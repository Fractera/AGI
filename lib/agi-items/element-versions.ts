import "server-only"
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { elementDir } from "@/lib/agi-items/element-github"

// ВЕРСИИ РОЖДЁННОГО ЭЛЕМЕНТА — ДЛЯ СТРАНИЦЫ «РАЗВЁРТЫВАНИЯ» (узел, шаг 321). Слово владельца 2026-09-27: «давай сделаем здесь
// аналогичный инструмент но использую нашу стандартную таблицу из блоков которые имеют пагинацию и поиск».
//
// 🔒 ИСТОЧНИК — ФАКТЫ, А НЕ ЖУРНАЛ, КОТОРЫЙ КТО-ТО ЗАБЫЛ ДОПИСАТЬ: версии — коммиты собственной истории элемента; «работает» —
// версия из отпечатка установки (`.install-stamp.json`, её пишет установщик после сборки); «в GitHub» — последний выгруженный
// коммит (`data/services/<id>/github/state.json`). ✗ Журнал ядра `logs/deploy-history.jsonl` пишет только
// `deploy-elements.mjs` — рождения и `services:install` в него не попадают, поэтому здесь он не источник.

export type ElementVersion = { hash: string; at: string; subject: string; running: boolean; exported: boolean }

const MAX = 500

export function elementVersions(id: string): ElementVersion[] | null {
  const dir = elementDir(id)
  if (!dir) return null
  const log = spawnSync("git", ["-C", dir, "log", `--max-count=${MAX}`, "--format=%h%x09%cI%x09%s"], { encoding: "utf8", windowsHide: true, timeout: 10_000 })
  if (log.status !== 0) return []
  let running: string | null = null
  try {
    const v = String((JSON.parse(readFileSync(join(dir, ".install-stamp.json"), "utf8")) as { version?: string }).version ?? "")
    running = v.includes("+") ? v.split("+").pop() ?? null : null
  } catch { /* не установлен — работающей версии нет */ }
  let exported: string | null = null
  try {
    exported = (JSON.parse(readFileSync(join(process.cwd(), "data", "services", id, "github", "state.json"), "utf8")) as { lastCommit?: string }).lastCommit ?? null
  } catch { /* не выгружался */ }
  return log.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
    const [hash, at, ...rest] = line.split("\t")
    return { hash, at, subject: rest.join("\t"), running: hash === running, exported: hash === exported }
  })
}
