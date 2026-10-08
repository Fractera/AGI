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
  }
}

/** Есть ли у элемента каталог — для пункта меню «Связи → Каталог». */
export function hasCatalog(id: string): boolean {
  return Boolean(elementPassport(id)?.ext?.catalog)
}
