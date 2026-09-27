import "server-only"
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { isDnsLabel } from "@/lib/agi-items/dns-label.mjs"
import { zoneByName } from "@/lib/domain/cloudflare"
import { envValue } from "@/lib/agi-items/element-delete"

// ДОМЕНЫ УЗЛА — СПИСОК, А НЕ ОДИН (шаг 324-1). Слово владельца 2026-09-27: «нужно все то что сделано там превратить в карточке
// аккордеона … первую карточку может быть открыты карточка первого домена а кроме этого здесь надо позволить подключать больше
// доменов сколько угодно». Выбор пути — «Как основной — туннель»: дополнительный домен — зона в том же аккаунте Cloudflare,
// тот же ключ и тот же туннель узла; новый туннель не заводится.
//
// 🔒 ОСНОВНОЙ ДОМЕН НЕ ПЕРЕЕЗЖАЕТ: он живёт в `logs/domain.json` (лестница 259, вход, ядро, туннель читают его оттуда), и
// список берёт его оттуда же, не копируя. Дополнительные — `data/node/domains.json` (вне git, как всё `data/*`).
// 🔒 ФОРМА ИМЕНИ — ПО ПРАВИЛАМ DNS (325-7): каждая метка — `isDnsLabel`, не меньше двух меток, имя ≤253 знаков (RFC 1035:
// 255 октетов в передаче, два из них служебные), последняя метка — не число. Вводится корень: `www.` — отдельный отказ.
// 🔒 ГОТОВ = ЗОНА АКТИВНА И КЛЮЧ УЗЛА ЕЁ ВИДИТ. Не видит — запись остаётся карточкой со следующим шагом, а не пропадает:
// человек идёт в Cloudflare и возвращается нажать «Проверить снова». Ничего не проверяется само.
// 🔒 КЛЮЧ ЧИТАЕТСЯ ИЗ ОКРУЖЕНИЯ УЗЛА И НИКУДА НЕ ОТДАЁТСЯ.

const ROOT = process.cwd()
const FILE = join(ROOT, "data", "node", "domains.json")
const PRIMARY_FILE = join(ROOT, "logs", "domain.json")
const SERVICES = join(ROOT, "data", "services")

export type ZoneState = "active" | "pending" | "not-visible" | "unknown"
export type NodeDomain = { name: string; state: ZoneState; status?: string; nameServers?: string[]; addedAt: string; checkedAt?: string }
export type Shape = "ok" | "bad-shape" | "with-www" | "primary" | "exists"

/** Основной домен узла (зона лестницы 259) или `null`. */
export function primaryDomain(): { name: string; status: string | null } | null {
  try {
    const d = JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { zone?: unknown; zoneStatus?: unknown }
    return typeof d.zone === "string" && d.zone ? { name: d.zone, status: typeof d.zoneStatus === "string" ? d.zoneStatus : null } : null
  } catch { return null }
}

function readList(): NodeDomain[] {
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as { domains?: unknown }
    return Array.isArray(raw.domains) ? (raw.domains as NodeDomain[]).filter((d) => typeof d?.name === "string") : []
  } catch { return [] }
}

function writeList(domains: NodeDomain[]): boolean {
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(tmp, JSON.stringify({ domains }, null, 2) + "\n", "utf8")
    renameSync(tmp, FILE)
    return true
  } catch { return false }
}

/** Дополнительные домены узла. */
export function extraDomains(): NodeDomain[] {
  return readList()
}

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/\.$/, "")
}

/** Годится ли имя как корень домена по правилам DNS (без проверки занятости). */
export function isDomainName(name: string): boolean {
  const labels = name.split(".")
  return name.length <= 253 && labels.length >= 2 && labels.every((l) => isDnsLabel(l)) && /[a-z]/.test(labels[labels.length - 1])
}

export function domainShape(name: string): Shape {
  if (!isDomainName(name)) return "bad-shape"
  if (name.split(".")[0] === "www") return "with-www"
  const primary = primaryDomain()?.name
  if (primary && (name === primary || name.endsWith(`.${primary}`))) return "primary"
  if (readList().some((d) => d.name === name)) return "exists"
  return "ok"
}

/** Элемент, к которому подключён домен (324-2 пишет `data/services/<id>/domain.json`), или `null`. */
export function domainHolder(name: string): string | null {
  let ids: string[] = []
  try { ids = readdirSync(SERVICES) } catch { return null }
  for (const id of ids) {
    try {
      const d = (JSON.parse(readFileSync(join(SERVICES, id, "domain.json"), "utf8")) as { domain?: unknown }).domain
      if (d === name) return id
    } catch { /* нет файла */ }
  }
  return null
}

async function zoneState(name: string): Promise<Pick<NodeDomain, "state" | "status" | "nameServers"> | { error: string }> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { error: "no-key" }
  const z = await zoneByName(key, name)
  if (!z.ok) return { error: `cloudflare:${z.reason}` }
  if (!z.result) return { state: "not-visible" }
  return { state: z.result.status === "active" ? "active" : "pending", status: z.result.status, nameServers: z.result.name_servers ?? [] }
}

/** «Добавить домен»: форма → запись → состояние зоны. Не видит ключ — запись всё равно остаётся карточкой. */
export async function addDomain(input: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  const name = normalizeDomain(input)
  const shape = domainShape(name)
  if (shape !== "ok") return { ok: false, error: shape }
  const z = await zoneState(name)
  if ("error" in z) return { ok: false, error: z.error }
  const now = new Date().toISOString()
  const domain: NodeDomain = { name, ...z, addedAt: now, checkedAt: now }
  if (domainShape(name) !== "ok") return { ok: false, error: "exists" }
  return writeList([...readList(), domain]) ? { ok: true, domain } : { ok: false, error: "write-failed" }
}

/** «Проверить снова»: спросить Cloudflare о зоне ещё раз. */
export async function recheckDomain(name: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  const list = readList()
  const i = list.findIndex((d) => d.name === name)
  if (i < 0) return { ok: false, error: "not-found" }
  const z = await zoneState(name)
  if ("error" in z) return { ok: false, error: z.error }
  list[i] = { ...list[i], state: z.state, status: z.status, nameServers: z.nameServers, checkedAt: new Date().toISOString() }
  return writeList(list) ? { ok: true, domain: list[i] } : { ok: false, error: "write-failed" }
}

/** Убрать дополнительный домен из списка — только если он не подключён к элементу. Зона в Cloudflare не трогается. */
export function removeDomain(name: string): { ok: true } | { ok: false; error: string; holder?: string } {
  const list = readList()
  if (!list.some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const holder = domainHolder(name)
  if (holder) return { ok: false, error: "attached", holder }
  return writeList(list.filter((d) => d.name !== name)) ? { ok: true } : { ok: false, error: "write-failed" }
}
