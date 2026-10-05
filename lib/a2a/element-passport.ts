import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/agi-items/element-github"
import { passportProblems, cardOf, projectionsOf } from "@/lib/a2a/passport.mjs"

// ПАСПОРТ ЭЛЕМЕНТА ДЛЯ СТРАНИЦ ЯДРА (шаг 406-4). Страницы левого меню элемента показывают разделы паспорта, а не держат
// свою копию (карта меню 406-2, решение владельца). Источник — `OWN-SERVICE-PROPS.json` в папке рождённого элемента;
// черновик и элемент без раздела `a2a` — `null` или список проблем.

export type A2ADoor = {
  capability: string; protocol: "http" | "mcp"; method?: string; path: string; key: string
  input?: unknown; output?: unknown; errors?: Record<string, string>; callers: string[]
}
export type A2A = {
  version: 1; summary: string; visibility: "node" | "network"
  capabilities: { name: string; words: string; tags: string[] }[]
  doors: A2ADoor[]
  consumes?: { capability: string; from?: string; why: string }[]
  process?: { kind: string; what: string }[]
  catalog?: { find: string; get: string; contribute?: string | null } | null
  private?: string[]
  intent?: string
}
export type ElementPassport = { name: string; a2a: A2A | null; problems: string[]; card: unknown; projections: unknown }

export function elementPassport(id: string): ElementPassport | null {
  const dir = elementDir(id)
  if (!dir) return null
  let props: { id?: string; name?: string; a2a?: A2A }
  try { props = JSON.parse(readFileSync(join(dir, "OWN-SERVICE-PROPS.json"), "utf8")) } catch { return null }
  const problems = passportProblems(props) as string[]
  const ok = problems.length === 0
  return {
    name: props.name ?? id,
    a2a: props.a2a ?? null,
    problems,
    card: ok ? cardOf(props, { address: id }) : null,
    projections: ok ? projectionsOf(props) : null,
  }
}

/** Есть ли у элемента каталог — для пункта меню «Связи → Каталог». */
export function hasCatalog(id: string): boolean {
  return Boolean(elementPassport(id)?.a2a?.catalog)
}
