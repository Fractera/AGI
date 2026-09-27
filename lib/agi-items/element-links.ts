import "server-only"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import paths from "@/lib/agi-items/paths.cjs"
import { redrawElement } from "@/lib/agi-items/element-domain"

// СВЯЗИ ЭЛЕМЕНТА С УЗЛОМ (шаг 324-7). Решение владельца 2026-09-28, дословно: «в настройках AGI ITEM нужно создать новый
// раздел который отрубает синхронизацию проекта от CONFIG, от блоков, от дизайна и позволяет проекту продолжить своё
// развитие абсолютно самостоятельно».
//
// 🔒 СОСТОЯНИЕ — `data/services/<id>/links.json` (`{ config, design, blocks }`), папка данных элемента у узла: её читает сам
// элемент (`lib/own-site.ts` → `linkOn`), удаление элемента стирает её вместе с ним. Нет ключа — связь включена.
//   CONFIG выключен — элемент не кладёт копию настроек проекта поверх своих файлов и не забирает новую. В момент
//     отключения последняя копия ОДИН РАЗ переносится в его собственные APP-CONFIG / PLATFORM-CONFIG / DESIGN-CONFIG:
//     элемент продолжает с того же места, а не с умолчаний. Включение обратно — снова поверх (последняя копия; новая придёт
//     со следующим сохранением в CONFIG или при запуске элемента).
//   Дизайн выключен — элемент не забирает оформление; остаётся последнее полученное.
//   Блоки выключены — реестр `@fractera` убирается из `components.json` элемента (взятые блоки — копии в его коде —
//     остаются), включены — возвращается той же строкой, что даёт шаблон.
// После каждого нажатия ядро перерисовывает страницы элемента (`revalidate` по петле) — в ответ на нажатие, не само.

export type LinkKind = "config" | "design" | "blocks"
export type Links = Record<LinkKind, boolean>
const KINDS: LinkKind[] = ["config", "design", "blocks"]
const DATA = join(process.cwd(), "data", "services")
const BLOCKS_REGISTRY = "${BLOCKS_REGISTRY_URL}/r/{name}.json"

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

function writeJson(file: string, value: unknown): void {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n", "utf8")
  renameSync(tmp, file)
}

function readJson(file: string): unknown {
  try { return JSON.parse(readFileSync(file, "utf8")) } catch { return null }
}

export function readLinks(id: string): Links {
  const raw = readJson(join(DATA, id, "links.json"))
  const r = isObj(raw) ? raw : {}
  return { config: r.config !== false, design: r.design !== false, blocks: r.blocks !== false }
}

function deepMerge(base: unknown, over: unknown): unknown {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over
  const out: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(over)) out[k] = deepMerge(base[k], v)
  return out
}

/** Последняя копия настроек проекта → собственные файлы элемента (один раз, при отключении CONFIG). */
function adoptProjectSettings(id: string, dir: string): void {
  const copy = readJson(join(DATA, id, "project-settings.json"))
  const patches = isObj(copy) && isObj(copy.patches) ? copy.patches : null
  if (!patches) return
  const files: Record<string, string> = {
    app: join(dir, "APP-CONFIG", "app-config.json"),
    platform: join(dir, "PLATFORM-CONFIG", "platform-config.json"),
    design: join(dir, "DESIGN-CONFIG", "design-config.json"),
  }
  for (const [kind, file] of Object.entries(files)) {
    if (!isObj(patches[kind]) || Object.keys(patches[kind] as object).length === 0) continue
    writeJson(file, deepMerge(readJson(file) ?? {}, patches[kind]))
  }
}

/** Реестр блоков в `components.json` элемента: убрать или вернуть. */
function setBlocksRegistry(dir: string, on: boolean): void {
  const file = join(dir, "components.json")
  const raw = readJson(file)
  if (!isObj(raw)) return
  const registries = isObj(raw.registries) ? { ...raw.registries } : {}
  if (on) registries["@fractera"] = BLOCKS_REGISTRY
  else delete registries["@fractera"]
  writeJson(file, { ...raw, registries })
}

export async function setLink(id: string, kind: LinkKind, on: boolean): Promise<{ ok: true; links: Links } | { ok: false; error: string }> {
  if (!KINDS.includes(kind)) return { ok: false, error: "bad-kind" }
  const dir = paths.itemDir(id, "user")
  const links = { ...readLinks(id), [kind]: on }
  try {
    if (kind === "config" && !on) adoptProjectSettings(id, dir)
    if (kind === "blocks") setBlocksRegistry(dir, on)
    writeJson(join(DATA, id, "links.json"), links)
  } catch {
    return { ok: false, error: "write-failed" }
  }
  await redrawElement(id)
  return { ok: true, links }
}
