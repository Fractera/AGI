import "server-only"
import { mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { isDnsLabel } from "@/lib/agi-items/dns-label.mjs"
import { accountOfZone, activationCheck, createZone, getIngress, listAccounts, verifyToken, workersAccess, zoneByName } from "@/lib/domain/cloudflare"
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
  /** Регистратор домена по RDAP (324-2): только имя — экран чужого сервиса не описывается. `null` — RDAP не ответил. */
  registrar?: string | null
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

/** Дополнительные домены узла. Домен, ставший основным (324-2, «Сделать основным»), из них выпадает: он живёт в лестнице. */
export function extraDomains(): NodeDomain[] {
  const primary = primaryDomain()?.name
  return readList().filter((d) => d.name !== primary)
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

// РЕГИСТРАТОР ПО RDAP (324-2). Замер 2026-09-28: реестр IANA (`data.iana.org/rdap/dns.json`) даёт сервер RDAP зоны — .dev →
// pubapi.registry.google, .com → rdap.verisign.com; ответ называет регистратора (сущность с ролью registrar, vCard fn).
// Список серверов читается раз за жизнь процесса. Не ответил — `null`: «регистратор неизвестен», а не ошибка карточки.
let rdapBootstrap: Promise<Array<[string[], string[]]> | null> | null = null
async function registrarOf(name: string): Promise<string | null> {
  rdapBootstrap ??= fetch("https://data.iana.org/rdap/dns.json", { signal: AbortSignal.timeout(8000) })
    .then((r) => r.json())
    .then((j: { services?: Array<[string[], string[]]> }) => j.services ?? null)
    .catch(() => null)
  const services = await rdapBootstrap
  const tld = name.split(".").pop() ?? ""
  const base = services?.find(([tlds]) => tlds.includes(tld))?.[1]?.[0]
  if (!base) return null
  try {
    const r = await fetch(`${base.endsWith("/") ? base : `${base}/`}domain/${encodeURIComponent(name)}`, { headers: { accept: "application/rdap+json" }, signal: AbortSignal.timeout(8000) })
    const j = (await r.json()) as { entities?: Array<{ roles?: string[]; vcardArray?: [string, Array<[string, unknown, string, unknown]>] }> }
    const reg = j.entities?.find((e) => e.roles?.includes("registrar"))
    const fn = reg?.vcardArray?.[1]?.find((v) => v[0] === "fn")?.[3]
    return typeof fn === "string" && fn.trim() ? fn.trim() : null
  } catch { return null }
}

type Observed = Pick<NodeDomain, "state" | "status" | "zoneId" | "nameServers" | "registrarNs" | "nsMatch" | "activationAsked" | "registrar">

/** Всё, что узел может узнать о домене сейчас: зона, её серверы имён, серверы у регистратора; совпали — просит активацию. */
async function observe(name: string): Promise<Observed | { error: string }> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { error: "no-key" }
  const [z, reg, registrar] = await Promise.all([zoneByName(key, name), registrarNs(name), registrarOf(name)])
  if (!z.ok) return { error: `cloudflare:${z.reason}` }
  if (!z.result) return { state: "not-visible", registrarNs: reg, registrar }
  const assigned = (z.result.name_servers ?? []).map((n) => n.toLowerCase()).sort()
  const nsMatch = assigned.length > 0 && assigned.every((n) => reg.includes(n))
  const active = z.result.status === "active"
  let activationAsked = false
  if (!active && nsMatch) activationAsked = (await activationCheck(key, z.result.id)).ok
  return { state: active ? "active" : "pending", status: z.result.status, zoneId: z.result.id, nameServers: assigned, registrarNs: reg, nsMatch, activationAsked, registrar }
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

/** «Создать зону»: узел заводит зону в аккаунте основного домена сам. Уже видна — просто замер.
 *  324-2: основного домена ещё нет (первый домен узла) — аккаунт узнаётся у ключа (`/accounts`); ключ видит не ровно один
 *  аккаунт — отказ `no-account`, и карточка просит Account ID (запасное поле по слову владельца: «если нажатие вернёт
 *  ошибку, то подсунешь вторую кнопку и напишешь попробуй снова»). Названный аккаунт проверяет сам Cloudflare при создании. */
export async function createDomainZone(name: string, accountId?: string): Promise<{ ok: true; domain: NodeDomain } | { ok: false; error: string }> {
  if (!readList().some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { ok: false, error: "no-key" }
  const seen = await zoneByName(key, name)
  if (seen.ok && seen.result) return checkDomain(name)
  const primary = primaryDomain()
  let account: string
  if (primary) {
    const main = await zoneByName(key, primary.name)
    if (!main.ok || !main.result) return { ok: false, error: "primary-not-visible" }
    const acc = await accountOfZone(key, main.result.id)
    if (!acc.ok) return { ok: false, error: `cloudflare:${acc.reason}` }
    account = acc.result
  } else if (accountId) {
    if (!/^[0-9a-f]{32}$/.test(accountId)) return { ok: false, error: "bad-account-id" }
    account = accountId
  } else {
    const accounts = await listAccounts(key)
    if (!accounts.ok || accounts.result.length !== 1) return { ok: false, error: "no-account" }
    account = accounts.result[0].id
  }
  const created = await createZone(key, account, name)
  if (!created.ok) return { ok: false, error: /zone\.create/.test(created.reason) ? "no-zone-permission" : created.reason }
  return checkDomain(name)
}

// КЛЮЧ УЗЛА — ТРЕВОГА ТОЛЬКО ПО ЗАМЕРУ (324-1, решение владельца 2026-09-27 «go» после разбора: постоянная строка ключа и
// красная карточка по ЗАПОМНЕННОМУ отказу делались под один узел — у пользователя с ключом по исправленной инструкции их не
// бывает). Замеряется каждый раз: есть ли ключ и его статус у Cloudflare (`/user/tokens/verify`: active · disabled · expired).
// Нехватка права создавать зоны — не тревога страницы: она выясняется в момент «Создать зону» и показывается там же.
export async function nodeKeyState(): Promise<
  { present: false } | { present: true; tail: string; status: string | null; workers: { scripts: boolean; routes: boolean } | null; tunnel: boolean | null }
> {
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (!key) return { present: false }
  const v = await verifyToken(key)
  // 344-1: права на Workers — копия публичных страниц в Cloudflare. Замер, а не память: зона основного домена → её аккаунт.
  let workers: { scripts: boolean; routes: boolean } | null = null
  let tunnel: boolean | null = null
  const zoneName = primaryDomain()?.name
  const zone = zoneName ? await zoneByName(key, zoneName) : null
  if (zone?.ok && zone.result) {
    const acct = await accountOfZone(key, zone.result.id)
    if (acct.ok) workers = await workersAccess(key, acct.result, zone.result.id)
    // 2026-10-01 (dhndy: «Подключить не удалось: 502», Cloudflare `1001 Not authorized`): ключ без права на туннель выглядел здесь
    // исправным — работающие адреса отвечают (туннель живёт своими учётными данными), а подключить новый нельзя. Замер — тот же
    // вызов, что делает «Подключить»: чтение настроек туннеля узла. Туннеля у узла нет — `null`, не тревога.
    const tunnelId = nodeTunnelId()
    if (acct.ok && tunnelId) tunnel = (await getIngress(key, acct.result, tunnelId)).ok
  }
  return { present: true, tail: key.slice(-4), status: v.ok ? v.result.status : null, workers, tunnel }
}

/** Убрать дополнительный домен из списка — только если он не подключён к элементу. Зона в Cloudflare не трогается. */
export function removeDomain(name: string): { ok: true } | { ok: false; error: string; holder?: string } {
  const list = readList()
  if (!list.some((d) => d.name === name)) return { ok: false, error: "not-found" }
  const holder = domainHolder(name)
  if (holder) return { ok: false, error: "attached", holder }
  return writeList(list.filter((d) => d.name !== name)) ? { ok: true } : { ok: false, error: "write-failed" }
}

/** Туннель узла (`logs/domain.json` → `tunnelId`), или `null` — узел без туннеля. */
function nodeTunnelId(): string | null {
  try {
    const d = JSON.parse(readFileSync(PRIMARY_FILE, "utf8")) as { tunnelId?: unknown }
    return typeof d.tunnelId === "string" && d.tunnelId ? d.tunnelId : null
  } catch { return null }
}
