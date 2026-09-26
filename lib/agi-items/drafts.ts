import "server-only"
import { randomBytes } from "node:crypto"
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync, unlinkSync } from "node:fs"
import { join, dirname } from "node:path"

// ЧЕРНОВИКИ ЭЛЕМЕНТОВ УЗЛА (шаг 314-1, слово владельца 2026-09-26: «кнопку создать новый микро servis который генерирует
// новую группу страниц на вкладке архитектора … название этого микро сервиса будет CUID.<domain> эти страницы сразу должны
// появиться … без нового развёртывания»).
//
// 🔒 ЧЕРНОВИК — НЕ ЗАПИСЬ РЕЕСТРА. `AGI-ITEMS-CONFIG/agi-items.json` читает установщик, и запись без репозитория он пытался
// бы ставить. Черновик живёт в данных ядра (`data/` целиком вне git): у него нет ни порта, ни поддомена, ни процесса — только
// имя и группа страниц архитектора. Порт и поддомен — следующий разговор (слово владельца: «порт пока не выделяй»,
// «мы ещё не генерировали сам субдомен»).
//
// 🔒 ЗАПИСЬ АТОМАРНА (временный файл + rename): читатель никогда не видит полузаписанный файл.
// 🔒 «НЕТ ФАЙЛА» — законный пустой список; файл есть, но не читается — тоже пусто для меню, но запись в такой файл
// отказывает, а не затирает его пустотой.

export type AgiDraft = { id: string; createdAt: string }

const FILE = join(process.cwd(), "data", "agi-drafts.json")

/** Имя черновика в форме CUID2: строчная буква + 23 знака base36. Годится и для поддомена, и для имени службы моста. */
export function newDraftId(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789"
  const bytes = randomBytes(24)
  let id = alphabet[bytes[0] % 26]
  for (let i = 1; i < 24; i++) id += alphabet[bytes[i] % 36]
  return id
}

export const DRAFT_ID = /^[a-z][a-z0-9]{23}$/

type ReadResult = { ok: true; drafts: AgiDraft[] } | { ok: false }

function read(): ReadResult {
  if (!existsSync(FILE)) return { ok: true, drafts: [] }
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as { drafts?: unknown }
    const list = Array.isArray(raw.drafts) ? raw.drafts : []
    return {
      ok: true,
      drafts: list.filter((d): d is AgiDraft => typeof d?.id === "string" && DRAFT_ID.test(d.id) && typeof d?.createdAt === "string"),
    }
  } catch {
    return { ok: false }
  }
}

function write(drafts: AgiDraft[]): boolean {
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`
  try {
    mkdirSync(dirname(FILE), { recursive: true })
    writeFileSync(tmp, JSON.stringify({ drafts }, null, 2) + "\n", "utf8")
    renameSync(tmp, FILE)
    return true
  } catch {
    if (existsSync(tmp)) try { unlinkSync(tmp) } catch { /* уже нет */ }
    return false
  }
}

/** Черновики по порядку создания. Нечитаемый файл — пустой список для меню. */
export function listDrafts(): AgiDraft[] {
  const r = read()
  return r.ok ? r.drafts : []
}

export function getDraft(id: string): AgiDraft | null {
  return DRAFT_ID.test(id) ? listDrafts().find((d) => d.id === id) ?? null : null
}

export function createDraft(): AgiDraft | null {
  const r = read()
  if (!r.ok) return null
  const draft = { id: newDraftId(), createdAt: new Date().toISOString() }
  return write([...r.drafts, draft]) ? draft : null
}

export function deleteDraft(id: string): boolean {
  const r = read()
  if (!r.ok || !r.drafts.some((d) => d.id === id)) return false
  return write(r.drafts.filter((d) => d.id !== id))
}

/** Зона домена узла (`logs/domain.json`). Нет домена — `null`, и адрес черновика называется без зоны. */
export function nodeZone(): string | null {
  try {
    const d = JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as { zone?: unknown }
    return typeof d.zone === "string" && d.zone ? d.zone : null
  } catch {
    return null
  }
}

/** Адрес, который человек вводит для удаления: `<id>.<зона>`, без зоны — сам `<id>`. */
export function draftAddress(id: string): string {
  const zone = nodeZone()
  return zone ? `${id}.${zone}` : id
}
