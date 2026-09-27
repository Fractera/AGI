import "server-only"
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { isDnsLabel } from "@/lib/agi-items/dns-label.mjs"
import { accountOfZone, activationCheck, createZone, listZones, zoneByName } from "@/lib/domain/cloudflare"
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
// 🔒 КОНВЕЙЕР, А НЕ ИНСТРУКЦИЯ (слово владельца 2026-09-27: «если мы уже прошли этот конвейер и у нас есть доступ к API … просто
// иди и подключай этот домен через API если это невозможно то значит создавай нормальный конвейер с пошаговым подключением»):
//   1. зону создаёт узел сам (`createZone` в аккаунте основного домена); ключу не хватает права — ступень ключа;
//   2. серверы имён: узел показывает, какие назначил Cloudflare, и ЗАМЕРЯЕТ, какие сейчас у регистратора (DoH) — меняет их
//      только человек, это единственный шаг вне узла;
//   3. совпали — узел сам просит Cloudflare перепроверить зону (`activationCheck`), итог — «активна».
// Каждая проверка по кнопке возвращает, что увидено и когда, — «ничего не изменилось» тоже ответ.

const ROOT = process.cwd()
const FILE = join(ROOT, "data", "node", "domains.json")
const PRIMARY_FILE = join(ROOT, "logs", "domain.json")
const SERVICES = join(ROOT, "data", "services")

export type ZoneState = "active" | "pending" | "not-visible" | "unknown"
export type NodeDomain = {
  name: string; state: ZoneState; status?: string; zoneId?: string; nameServers?: string[]
  registrarNs?: string[]; nsMatch?: boolean; activationAsked?: boolean; addedAt: string; checkedAt?: string
}
export type Shape = "ok" | "bad-shape" | "with-www" | "primary" | "exists"

/** Основной домен узла (зона лестницы 259) или `null`. */
export function primaryDomain(): { name: string; status: string | null } | null {
  try {
    const d = JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { zone?: unknown; zoneStatus?: unknown }
    return typeof d.zone === "string" && d.zone ? { name: d.zone, status: typeof d.zoneStatus === "string" ? d.zoneStatus : null } : null
  } catch { return null }
}

/** Основной домен подключён лестницей до конца (`activatedAt` в `logs/domain.json`): тексты «как получить домен» больше не нужны. */
export function primaryConnected(): boolean {
  try { return typeof (JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { activatedAt?: unknown }).activatedAt === "string" } catch { return false }
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

const DOH = "https://cloudflare-dns.com/dns-query"

/** Серверы имён, которые домен отдаёт сейчас в интернете (их ставит регистратор). Пусто — не удалось спросить. */
async function registrarNs(name: string): Promise<string[]> {
  try {
    const r = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=NS`, { headers: { accept: "application/dns-json" }, cache: "no-store", signal: AbortSignal.timeout(8000) })
    const j = (await r.json()) as { Answer?: Array<{ type: number; data: string }> }
    return (j.Answer ?? []).filter((x) => x.type === 2).map((x) => x.data.toLowerCase().replace(/\.$/, "")).sort()
  } catch { return [] }
}

type Observed = Pick<NodeDomain, "state" | "status" | "zoneId" | "nameServers" | "registrarNs" | "nsMatch" | "activationAsked">

/** Всё, что узел может узнать о домене сейчас: зона, её серверы имён, серверы у регистратора; совпали — просит активацию. */
async function observe(name: string): Promise<Observed | { error: string }> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { error: "no-key" }
  const [z, reg] = await Promise.all([zoneByName(key, name), registrarNs(name)])
  if (!z.ok) return { error: `cloudflare:${z.reason}` }
  if (!z.result) return { state: "not-visible", registrarNs: reg }
  const assigned = (z.result.name_servers ?? []).map((n) => n.toLowerCase()).sort()
  const nsMatch = assigned.length > 0 && assigned.every((n) => reg.includes(n))
  const active = z.result.status === "active"
  let activationAsked = false
  if (!active && nsMatch) activationAsked = (await activationCheck(key, z.result.id)).ok
  return { state: active ? "active" : "pending", status: z.result.status, zoneId: z.result.id, nameServers: assigned, registrarNs: reg, nsMatch, activationAsked }
}

function save(name: string, patch: Partial<NodeDomain>): NodeDomain | null {
  const list = readList()
  const i = list.findIndex((d) => d.name === name)
  if (i < 0) return null
  list[i] = { ...list[i], ...patch, checkedAt: new Date().toISOString() }
  return writeList(list) ? list[i] : null
}

/** «Добавить домен»: форма → запись (`unknown`) → сразу первый замер. */
export async function addDomain(input: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  const name = normalizeDomain(input)
  const shape = domainShape(name)
  if (shape !== "ok") return { ok: false, error: shape }
  if (!writeList([...readList(), { name, state: "unknown", addedAt: new Date().toISOString() }])) return { ok: false, error: "write-failed" }
  return checkDomain(name)
}

/** «Проверить»: замерить заново и записать, что увидено. */
export async function checkDomain(name: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  if (!readList().some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const o = await observe(name)
  if ("error" in o) return { ok: false, error: o.error }
  const d = save(name, o)
  return d ? { ok: true, domain: d } : { ok: false, error: "write-failed" }
}

/** «Создать зону»: узел заводит зону в аккаунте основного домена сам. Уже видна — просто замер. */
export async function createDomainZone(name: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  if (!readList().some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { ok: false, error: "no-key" }
  const seen = await zoneByName(key, name)
  if (seen.ok && seen.result) return checkDomain(name)
  const primary = primaryDomain()
  if (!primary) return { ok: false, error: "no-primary" }
  const main = await zoneByName(key, primary.name)
  if (!main.ok || !main.result) return { ok: false, error: "primary-not-visible" }
  const account = await accountOfZone(key, main.result.id)
  if (!account.ok) return { ok: false, error: `cloudflare:${account.reason}` }
  const created = await createZone(key, account.result, name)
  if (!created.ok) {
    const denied = /zone\.create/.test(created.reason)
    if (denied) rememberZoneCreate(key, "denied")
    return { ok: false, error: denied ? "no-zone-permission" : created.reason }
  }
  rememberZoneCreate(key, "allowed")
  return checkDomain(name)
}

// КЛЮЧ УЗЛА — СВОЙСТВО УЗЛА, А НЕ ДОМЕНА (324-1). Может ли ключ создавать зоны, Cloudflare не говорит заранее (у ключа нет
// права читать свои права); узел узнаёт это первой попыткой создать зону и помнит ответ для ЭТОГО ключа (по хвосту): новый
// ключ — снова «ещё не проверено». Файл — `data/node/key-state.json`, сам ключ туда не пишется.
const KEY_STATE = join(ROOT, "data", "node", "key-state.json")
type ZoneCreate = "allowed" | "denied" | "unknown"

function rememberZoneCreate(key: string, zoneCreate: Exclude<ZoneCreate, "unknown">) {
  try {
    mkdirSync(dirname(KEY_STATE), { recursive: true })
    writeFileSync(KEY_STATE, JSON.stringify({ tail: key.slice(-4), zoneCreate, at: new Date().toISOString() }, null, 2) + "\n", "utf8")
  } catch { /* не записалось — строка покажет «ещё не проверено» */ }
}

/** Строка «Ключ узла»: есть ли ключ, хвост, сколько зон видит, может ли создавать зоны (по последней попытке). */
export async function nodeKeyState(): Promise<{ present: false } | { present: true; tail: string; zones: number | null; zoneCreate: ZoneCreate; checkedAt: string | null }> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { present: false }
  const tail = key.slice(-4)
  const zones = await listZones(key)
  let zoneCreate: ZoneCreate = "unknown"
  let checkedAt: string | null = null
  try {
    const s = JSON.parse(readFileSync(KEY_STATE, "utf8")) as { tail?: string; zoneCreate?: ZoneCreate; at?: string }
    if (s.tail === tail && (s.zoneCreate === "allowed" || s.zoneCreate === "denied")) { zoneCreate = s.zoneCreate; checkedAt = s.at ?? null }
  } catch { /* не проверялось */ }
  return { present: true, tail, zones: zones.ok ? zones.result.length : null, zoneCreate, checkedAt }
}

/** Убрать дополнительный домен из списка — только если он не подключён к элементу. Зона в Cloudflare не трогается. */
export function removeDomain(name: string): { ok: true } | { ok: false; error: string; holder?: string } {
  const list = readList()
  if (!list.some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const holder = domainHolder(name)
  if (holder) return { ok: false, error: "attached", holder }
  return writeList(list.filter((d) => d.name !== name)) ? { ok: true } : { ok: false, error: "write-failed" }
}
