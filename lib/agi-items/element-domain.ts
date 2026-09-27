import "server-only"
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { isDnsLabel } from "@/lib/agi-items/dns-label.mjs"
import { envValue } from "@/lib/agi-items/element-delete"
import { nodeZone } from "@/lib/agi-items/drafts"
import { zoneByName } from "@/lib/domain/cloudflare"
import { extraDomains } from "@/lib/domain/node-domains"

// ВТОРОЙ СОБСТВЕННЫЙ ДОМЕН В КОРНЕ AGI ЭЛЕМЕНТА (шаг 324). Слово владельца 2026-09-27: «подключение второго своего
// собственного домена который у меня куплен … второй основной домен который подключается к корню … с редиректом на основной
// домен в корне». Выборы: 301 старого поддомена — отвечает ядро; `www.<домен>` — 301 на корень.
//
// 🔒 ДОМЕН ЛЕЖИТ У ЭЛЕМЕНТА — `data/services/<id>/domain.json` (как адрес 325-3): удаление элемента стирает папку.
// 🔒 ФОРМА ИМЕНИ — ПО ПРАВИЛАМ DNS (325-7): каждая метка — `isDnsLabel`, не меньше двух меток, имя целиком ≤253 знаков
// (RFC 1035: 255 октетов в передаче, из них два — служебные), последняя метка не число. Вводится корень домена: `www.` и
// поддомены зоны узла — отдельные отказы со словом.
// 🔒 ЗОНА — ТОЛЬКО В АККАУНТЕ КЛЮЧА УЗЛА (решение плана 324: второй аккаунт = второй туннель). Ключ не показывается нигде.

export type DomainShape = "ok" | "bad-shape" | "with-www" | "node-zone"
export type DomainState =
  | { state: "ready"; zone: string; nameServers: string[] }
  | { state: "pending"; zone: string; status: string; nameServers: string[] }
  | { state: "not-visible" }
  | { state: "no-key" }
  | { state: "taken"; by: string }
  | { state: "cloudflare-error"; reason: string }
  | { state: DomainShape }

const DATA = join(process.cwd(), "data", "services")

/** Привести ввод к имени: строчные, без пробелов по краям и без точки в конце. */
export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/\.$/, "")
}

export function domainShape(name: string): DomainShape {
  const labels = name.split(".")
  if (name.length > 253 || labels.length < 2 || !labels.every((l) => isDnsLabel(l))) return "bad-shape"
  if (!/[a-z]/.test(labels[labels.length - 1])) return "bad-shape"
  if (labels[0] === "www") return "with-www"
  const zone = nodeZone()
  if (zone && (name === zone || name.endsWith(`.${zone}`))) return "node-zone"
  return "ok"
}

/** Подключённый домен элемента (`null` — нет). */
export function domainOf(id: string): string | null {
  try {
    const d = (JSON.parse(readFileSync(join(DATA, id, "domain.json"), "utf8")) as { domain?: unknown }).domain
    return typeof d === "string" ? d : null
  } catch { return null }
}

/** Элемент, у которого этот домен уже подключён (кроме `forId`). */
function holderOf(name: string, forId: string): string | null {
  let ids: string[] = []
  try { ids = readdirSync(DATA) } catch { return null }
  return ids.find((id) => id !== forId && domainOf(id) === name) ?? null
}

/** Что с доменом: форма, занятость, зона в Cloudflare и её статус. Ничего не пишет. */
export async function checkDomain(input: string, forId: string): Promise<DomainState & { name: string }> {
  const name = normalizeDomain(input)
  const shape = domainShape(name)
  if (shape !== "ok") return { state: shape, name }
  const by = holderOf(name, forId)
  if (by) return { state: "taken", by, name }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { state: "no-key", name }
  const z = await zoneByName(key, name)
  if (!z.ok) return { state: "cloudflare-error", reason: z.reason, name }
  if (!z.result) return { state: "not-visible", name }
  const nameServers = z.result.name_servers ?? []
  return z.result.status === "active"
    ? { state: "ready", zone: z.result.name, nameServers, name }
    : { state: "pending", zone: z.result.name, status: z.result.status, nameServers, name }
}

// «ПОДКЛЮЧИТЬ» — ВЫБОР ИЗ СПИСКА ДОМЕНОВ УЗЛА (324-3). Слово владельца 2026-09-27: «вместо того чтобы вводить свой домен я
// тебя просил сделать выпадающий список и указать какие домены уже прикреплены а какие ещё свободны». Домен добавляется и
// доводится до активной зоны на странице «Активация домена»; здесь — только выбор.
// 🔒 ЗАМЕР В МОМЕНТ НАЖАТИЯ: список показывает последнее, что узел видел; подключение спрашивает Cloudflare заново и берёт
// только свободный домен с активной зоной. Раздача сайта элемента на домене и 301 со старого поддомена — 324-4.
// Выбор другого домена заменяет прежний: у элемента один главный домен.
export async function attachDomain(id: string, input: string): Promise<{ ok: true; domain: string } | { ok: false; error: string }> {
  const name = normalizeDomain(input)
  if (!extraDomains().some((d) => d.name === name)) return { ok: false, error: "not-in-list" }
  const s = await checkDomain(name, id)
  if (s.state !== "ready") return { ok: false, error: s.state }
  const file = join(DATA, id, "domain.json")
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(join(DATA, id), { recursive: true })
    writeFileSync(tmp, JSON.stringify({ domain: name, attachedAt: new Date().toISOString() }, null, 2) + "\n", "utf8")
    renameSync(tmp, file)
  } catch { return { ok: false, error: "write-failed" } }
  return { ok: true, domain: name }
}
