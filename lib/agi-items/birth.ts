import { spawn } from "node:child_process"
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

// РОЖДЕНИЕ ЧЕРНОВИКА — ЗАПУСК И ХОД (узел, шаг 319-3). Сам путь рождения — `scripts/item-birth.mjs` (319-1); здесь только то,
// что нужно кнопке: запустить его отдельным процессом и прочитать, как он идёт.
//
// 🔒 ЗАПУСК ТОЛЬКО ПО НАЖАТИЮ ЧЕЛОВЕКА: дверь POST вызывается кнопкой «Родить элемент» с окном подтверждения. Ничего не
// запускается само (закон 2026-09-25 о незаказанном поведении).
// 🔒 ПРОЦЕСС ОТОРВАН ОТ ЯДРА (`detached`, `unref`) и живёт, пока идёт рождение: закрытая вкладка его не останавливает.
// `windowsHide: true` — иначе Windows открывает окно консоли поверх экрана человека (закон 2026-09-18).
// 🔒 ХОД ЧИТАЕТСЯ ИЗ ЖУРНАЛА, А НЕ ПОМНИТСЯ: `logs/birth-<id>.log` — вывод прибора с его маркерами `===BIRTH_OK===` /
// `===BIRTH_FAILED===`; `logs/birth-<id>.json` — pid и время старта. Нет маркера и процесс мёртв — рождение прервано, и
// это называется словами, а не показывается вечным «идёт».

export type BirthState = {
  state: "idle" | "running" | "done" | "failed"
  lines: string[]
  reason?: string
  port?: number
}

const LOGS = () => join(process.cwd(), "logs")
const logFile = (id: string) => join(LOGS(), `birth-${id}.log`)
const stateFile = (id: string) => join(LOGS(), `birth-${id}.json`)

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

type Meta = { pid: number; startedAt: string; revalidated?: boolean }

function readMeta(id: string): Meta | null {
  try {
    return JSON.parse(readFileSync(stateFile(id), "utf8")) as Meta
  } catch {
    return null
  }
}

export function markRevalidated(id: string): void {
  const meta = readMeta(id)
  if (meta) writeFileSync(stateFile(id), JSON.stringify({ ...meta, revalidated: true }), "utf8")
}

export function wasRevalidated(id: string): boolean {
  return readMeta(id)?.revalidated === true
}

/** Как идёт рождение `<id>`: по журналу прибора и живости его процесса. */
export function birthState(id: string): BirthState {
  const meta = readMeta(id)
  if (!meta || !existsSync(logFile(id))) return { state: "idle", lines: [] }
  const text = readFileSync(logFile(id), "utf8").replace(/\u001b\[[0-9;]*m/g, "")
  const all = text.split(/\r?\n/)
  // Этапы прибора (`[12.3 с] …`) и строки установщика с отступом — то, что человеку есть смысл видеть.
  const lines = all.filter((l) => /^\[\d/.test(l) || /^ {2}\S/.test(l)).map((l) => l.trim()).slice(-14)
  const ok = all.find((l) => l.startsWith("===BIRTH_OK==="))
  if (ok) {
    const port = Number(ok.match(/port (\d+)/)?.[1])
    return { state: "done", lines, ...(Number.isInteger(port) ? { port } : {}) }
  }
  const failed = all.find((l) => l.startsWith("===BIRTH_FAILED==="))
  if (failed) return { state: "failed", lines, reason: failed.replace("===BIRTH_FAILED===", "").trim() }
  // Пока идёт установка — последние строки журнала хода (`npm ci`, сборка), чтобы движение было видно (2026-10-01).
  if (alive(meta.pid)) return { state: "running", lines: [...lines, ...liveTail(id)] }
  return { state: "failed", lines, reason: "interrupted" }
}

/** Хвост журнала хода установщика при рождении (`logs/birth-<id>-live.log`): до 6 непустых строк, без управляющих знаков. */
function liveTail(id: string): string[] {
  let text = ""
  try { text = readFileSync(join(LOGS(), `birth-${id}-live.log`), "utf8") } catch { return [] }
  // eslint-disable-next-line no-control-regex
  const clean = text.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, "")
  return clean.split(/\r?\n|\r/).map((l) => l.trim()).filter(Boolean).slice(-6).map((l) => `› ${l.slice(0, 200)}`)
}

/** Облик рождённого элемента (367, слово владельца 2026-10-01): `project` — дизайн и CONFIG проекта, связи включены; `own` —
 *  самостоятельный: файлы шаблона, связи CONFIG и «Дизайн» выключены до первой сборки. */
export type BirthLook = "project" | "own"
export const BIRTH_LOOKS: BirthLook[] = ["project", "own"]

/** 367-3: адрес репозитория человека — https, хост, владелец/имя, необязательный `.git`. Ни пробелов, ни параметров, ни ключей в адресе. */
export function isRepoUrl(url: string): boolean {
  return url.length <= 300 && /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?(\.git)?\/?$/.test(url)
}

/** Запустить рождение. Вызывающий уже проверил роли, черновик, что элемента ещё нет, `look` и адрес репозитория (`repo`). */
export function startBirth(id: string, look: BirthLook, repo: string | null = null): { ok: true } | { ok: false; reason: string } {
  if (birthState(id).state === "running") return { ok: false, reason: "running" }
  mkdirSync(LOGS(), { recursive: true })
  const fd = openSync(logFile(id), "w")
  try {
    const child = spawn(process.execPath, [join(process.cwd(), "scripts", "item-birth.mjs"), id, "--look", look, ...(repo ? ["--repo", repo] : [])], {
      cwd: process.cwd(),
      detached: true,
      stdio: ["ignore", fd, fd],
      windowsHide: true,
    })
    if (!child.pid) return { ok: false, reason: "spawn-failed" }
    child.unref()
    writeFileSync(stateFile(id), JSON.stringify({ pid: child.pid, startedAt: new Date().toISOString() }), "utf8")
    return { ok: true }
  } finally {
    closeSync(fd)
  }
}
