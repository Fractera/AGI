import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// ИТОГ ПОСЛЕДНЕЙ ВЫКЛАДКИ КОПИИ ПУБЛИЧНЫХ СТРАНИЦ В CLOUDFLARE (узел, шаг 344-3). Пишет `scripts/static-copy.mjs` в
// `data/services/<id>/static-copy.json`; читает страница «Развёртывания» элемента. Файла нет — выкладок не было.
export type StaticCopyState = {
  ok: boolean
  at: string
  host?: string
  files?: number
  reason?: string
  detail?: string
  removed?: boolean
}

export function readStaticCopy(id: string): StaticCopyState | null {
  try {
    const s = JSON.parse(readFileSync(join(process.cwd(), "data", "services", id, "static-copy.json"), "utf8")) as StaticCopyState
    return typeof s?.at === "string" ? s : null
  } catch {
    return null
  }
}
