import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/agi-items/element-github"
import { extensionOf, passportProblems, publishedCard, registryEntryOf } from "@/lib/a2a/passport.mjs"
import elementProps from "@/lib/agi-items/element-props.cjs"

// ПАСПОРТ ЭЛЕМЕНТА ДЛЯ СТРАНИЦ ЯДРА (шаги 406-3, 406-4): визитка A2A Google v1.0 (`a2a.card`) + расширение Fractera.
// Страницы левого меню элемента показывают его разделы, своей копии не держат.

export type A2ASkill = { id: string; name: string; description: string; tags: string[]; examples?: string[]; inputModes?: string[]; outputModes?: string[] }
export type A2ADoor = {
  skill: string; protocol: "http" | "mcp"; method?: string; path: string; key: string
  input?: unknown; output?: unknown; errors?: Record<string, string>; callers: string[]
}
export type FracteraExt = {
  visibility: "node" | "network"
  doors?: A2ADoor[]
  consumes?: { skill: string; from?: string; why: string }[]
  process?: { kind: string; what: string; service?: string; env?: string; docs?: string; schedule?: string }[]
  catalog?: { find: string; get: string; contribute?: string | null } | null
  private?: string[]
}
export type A2ACard = {
  name: string; description: string; version: string
  skills: A2ASkill[]; defaultInputModes: string[]; defaultOutputModes: string[]
  capabilities: { extensions?: { uri: string; params?: unknown }[] }
}
export type ElementPassport = {
  card: A2ACard | null
  ext: FracteraExt | null
  problems: string[]
  warnings: string[]
  published: unknown
  registry: unknown
  offers: A2AOffers | null
  subscriptions: ExternalServices | null
  cron: CronPlan | null
}

// 435-4 (владелец 2026-10-08): витрина «Связи (A2A) → A2A» — что элемент предлагает, по какой цене, кому и с каким лимитом.
// Отдельный файл `OWN-SERVICE-PROPS/A2A-OFFERS.json`, а не поле визитки: в публичную `/.well-known/agent-card.json` не попадает.
// Сегодня у roman — пример (`example: true`), вызвать его нельзя.
export type A2AOffer = {
  id: string; name: string; description: string; inputModes: string[]; outputModes: string[]
  price: { amount: string; currency: string; unit: "request" | "message" }
  access: "registered" | "everyone"
  limit: { count: number; per: "day" | "hour" } | null
}
export type A2AOffers = { example: boolean; offers: A2AOffer[] }

// 463 (владелец 2026-10-12): вкладка «Процесс → Подписки» — внешние платные сервисы элемента. Отдельный файл
// `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` (как A2A-OFFERS.json): в публичную визитку не попадает; ключи — только ИМЕНА переменных.
// Сегодня у roman — пример «AI search machine» (`example: true`): ничего не сохраняется и не вызывается. Навык элемента —
// `connect-external-service`.
export type ExternalPayment = { date: string; description: string; amount: string; currency: string; status: string }
export type ExternalService = {
  id: string; name: string; description: string; docs?: string
  keys: { env: string; label: string; secret?: boolean }[]
  check?: string
  examplePayments?: ExternalPayment[]
}
export type ExternalServices = { example: boolean; services: ExternalService[] }

// 465 (владелец 2026-10-12): вкладка «Процесс → Крон автоматизации» — календарь расписания элемента. Отдельный файл
// `OWN-SERVICE-PROPS/CRON.json` (как SUBSCRIPTIONS.json): события — обработчики, написанные заранее; расписания — когда сервер
// элемента их зовёт (он сверяется с часами раз в минуту, lib/cron/ элемента). Журнал запусков — `data/cron-runs.jsonl` элемента:
// ядро только читает его, чтобы календарь показал «выполнено / ошибка / пропущено». Навык элемента —
// `schedule-cron-automations-calendar-reminders-recurring-and-one-time-tasks`.
export type CronRepeat = "once" | "daily" | "weekdays" | "weekly" | "monthly"
export type CronEvent = { id: string; name: string; description: string }
export type CronSchedule = { id: string; event: string; name?: string; time: string; repeat: CronRepeat; start: string; until?: string; enabled: boolean }
export type CronRun = { slot: string; at: string; schedule: string; event: string; ok: boolean; detail?: string } // slot — «YYYY-MM-DDTHH:MM» по местным часам
export type CronPlan = { repeatsPaused: boolean; events: CronEvent[]; schedules: CronSchedule[]; runs: CronRun[] }

const REPEATS = new Set(["once", "daily", "weekdays", "weekly", "monthly"])
const RUNS_SHOWN = 2000 // последние строки журнала: календарю хватает

function readCron(dir: string): CronPlan | null {
  let raw: { repeatsPaused?: unknown; events?: unknown; schedules?: unknown }
  try {
    raw = JSON.parse(readFileSync(join(dir, "OWN-SERVICE-PROPS", "CRON.json"), "utf8"))
  } catch {
    return null
  }
  const events = (Array.isArray(raw.events) ? raw.events : []) as CronEvent[]
  const schedules = ((Array.isArray(raw.schedules) ? raw.schedules : []) as CronSchedule[])
    .filter((s) => s && typeof s.id === "string" && /^\d{2}:\d{2}$/.test(s.time) && REPEATS.has(s.repeat) && /^\d{4}-\d{2}-\d{2}$/.test(s.start))
  let runs: CronRun[] = []
  try {
    runs = readFileSync(join(dir, "data", "cron-runs.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).slice(-RUNS_SHOWN)
      .flatMap((l) => { try { return [JSON.parse(l) as CronRun] } catch { return [] } })
  } catch { /* журнала ещё нет */ }
  return { repeatsPaused: raw.repeatsPaused === true, events, schedules, runs }
}

function readSubscriptions(dir: string): ExternalServices | null {
  try {
    const raw = JSON.parse(readFileSync(join(dir, "OWN-SERVICE-PROPS", "SUBSCRIPTIONS.json"), "utf8")) as Partial<ExternalServices>
    return Array.isArray(raw.services) && raw.services.length ? { example: raw.example !== false, services: raw.services } : null
  } catch {
    return null
  }
}

function readOffers(dir: string): A2AOffers | null {
  try {
    const raw = JSON.parse(readFileSync(join(dir, "OWN-SERVICE-PROPS", "A2A-OFFERS.json"), "utf8")) as Partial<A2AOffers>
    return Array.isArray(raw.offers) && raw.offers.length ? { example: raw.example !== false, offers: raw.offers } : null
  } catch {
    return null
  }
}

export function elementPassport(id: string): ElementPassport | null {
  const dir = elementDir(id)
  if (!dir) return null
  let props: { id?: string; a2a?: { card?: A2ACard } }
  props = elementProps.readElementProps(dir) // 417: обе раскладки
  if (!props) return null
  const { problems, warnings } = passportProblems(props) as { problems: string[]; warnings: string[] }
  const card = props.a2a?.card ?? null
  const ok = problems.length === 0
  return {
    card,
    ext: card ? (extensionOf(card) as FracteraExt | null) : null,
    problems,
    warnings,
    published: ok ? publishedCard(props) : null,
    registry: ok ? registryEntryOf(props, { address: id }) : null,
    offers: readOffers(dir),
    subscriptions: readSubscriptions(dir),
    cron: readCron(dir),
  }
}

/** Есть ли у элемента каталог — для пункта меню «Связи → Каталог». */
export function hasCatalog(id: string): boolean {
  return Boolean(elementPassport(id)?.ext?.catalog)
}
