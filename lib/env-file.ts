import "server-only"
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import paths from "@/lib/agi-items/paths.cjs"
import { getService } from "@/lib/microservices/registry"

// ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ЯДРА И ЭЛЕМЕНТА (шаг 336-1). Слово владельца 2026-09-29: «разработать вкладку переменных окружений
// таким образом чтобы каждое поле также было возможно прокрутить до нужного места»; о ключе OpenAI: «если в ядре уже есть
// ключ то его надо использовать. Если в ядре нет ключа то мы записываем ключ в собственный переменные окружения и
// одновременно спрашиваем стоит ли продублировать запись в переменной окружении ядра».
//
// 🔒 СПИСОК — ИЗ ПРИМЕРА, СОСТОЯНИЕ — ИЗ ФАЙЛА. Какие переменные есть и зачем, говорит `.env.example` / `.env.local.example`
// (комментарии над строкой); задана ли — `.env.local`. Значение наружу не уходит НИКОГДА: ни на страницу, ни в ответ двери.
// 🔒 МЕНЯТЬ МОЖНО ТОЛЬКО EDITABLE. Секреты выдаёт установщик, `NEXT_PUBLIC_*` запекаются в сборку — правка без пересборки
// соврала бы «сохранено».

export const EDITABLE = ["OPENAI_API_KEY"] as const
export type EditableName = (typeof EDITABLE)[number]
export type EnvTarget = "core" | string
export type EnvVar = { name: string; group: string; help: string }

const CORE = process.cwd()

/** Папка цели: ядро — корень узла, элемент — его папка по реестру; неизвестный элемент — `null`. */
export function targetDir(target: EnvTarget): string | null {
  if (target === "core") return CORE
  const entry = getService(target)
  return entry ? paths.entryDir(entry) : null
}

function exampleFile(dir: string): string | null {
  for (const f of [".env.local.example", ".env.example"]) if (existsSync(join(dir, f))) return join(dir, f)
  return null
}

/**
 * Переменные из примера: имя, группа (строка-разделитель `# ─── … ───` или `# kind: …`) и пояснение — комментарии прямо над
 * строкой. Закомментированная переменная (`# ARCHITECT_TOKEN=`) тоже переменная: её можно задать.
 */
export function listVars(target: EnvTarget): EnvVar[] {
  const dir = targetDir(target)
  const file = dir ? exampleFile(dir) : null
  if (!file) return []
  const out: EnvVar[] = []
  const seen = new Set<string>()
  let group = ""
  let notes: string[] = []
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim()
    const head = line.match(/^#\s*─+\s*(.+?)\s*─*$/)
    if (head) { group = head[1]; notes = []; continue }
    const kind = line.match(/^#\s*kind:\s*(\w+)/)
    if (kind) { group = kind[1]; notes = []; continue }
    const v = line.match(/^#?\s*([A-Z][A-Z0-9_]*)=/)
    if (v) {
      if (!seen.has(v[1])) { seen.add(v[1]); out.push({ name: v[1], group, help: notes.join(" ") }) }
      notes = []
      continue
    }
    if (line.startsWith("#")) notes.push(line.replace(/^#\s?/, ""))
    else notes = []
  }
  return out
}

function localFile(dir: string): string {
  return join(dir, ".env.local")
}

function readLocal(dir: string): Map<string, string> {
  const map = new Map<string, string>()
  let raw = ""
  try { raw = readFileSync(localFile(dir), "utf8") } catch { return map }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/)
    if (m) map.set(m[1], m[2].trim())
  }
  return map
}

/** Какие переменные цели заданы (непустое значение в `.env.local`). Только имена — значений здесь нет. */
export function setNames(target: EnvTarget): string[] {
  const dir = targetDir(target)
  if (!dir) return []
  return [...readLocal(dir)].filter(([, v]) => v !== "").map(([k]) => k)
}

function readVar(target: EnvTarget, name: string): string {
  const dir = targetDir(target)
  return dir ? readLocal(dir).get(name) ?? "" : ""
}

/**
 * Записать одну переменную в `.env.local` цели: строка заменяется на месте, нет — дописывается; концы строк файла
 * сохраняются, запись атомарная (временный файл → переименование). Проверка значения — у вызывающего.
 */
export function writeVar(target: EnvTarget, name: EditableName, value: string): boolean {
  const dir = targetDir(target)
  if (!dir) return false
  const file = localFile(dir)
  let raw = ""
  try { raw = readFileSync(file, "utf8") } catch { /* нового файла нет */ }
  const eol = raw.includes("\r\n") ? "\r\n" : "\n"
  const lines = raw === "" ? [] : raw.split(/\r?\n/)
  if (lines.length && lines[lines.length - 1] === "") lines.pop()
  const i = lines.findIndex((l) => l.startsWith(`${name}=`))
  if (i >= 0) lines[i] = `${name}=${value}`
  else lines.push(`${name}=${value}`)
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, lines.join(eol) + eol, "utf8")
  renameSync(tmp, file)
  return true
}

/**
 * Ключ OpenAI для работы над элементом — решение владельца: ключ ядра, если он есть (окружение процесса, затем
 * `.env.local` ядра); нет — ключ самого элемента. Без элемента — только ядро.
 */
export function openAiKeyFor(item?: string | null): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY
  const core = readVar("core", "OPENAI_API_KEY")
  if (core) return core
  return item ? readVar(item, "OPENAI_API_KEY") : ""
}
