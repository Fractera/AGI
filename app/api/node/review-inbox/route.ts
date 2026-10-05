// @api element agent leaves a self-review finding about something outside it
import { timingSafeEqual } from "node:crypto"
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

// ЯЩИК УЗЛА ДЛЯ НАХОДОК РАЗБОРА (шаг 410-4; владелец 2026-10-06 согласовал план: «находку не про свой элемент агент не чинит, а
// кладёт в общий ящик ядра»). Агент элемента после разбора (навык `self-review`) нашёл, что спотыкался не о свой навык, а о ядро,
// комплект агента, шаблон или соседа (как адрес `127.0.0.1` в 409-5) — POST `{ from, signal, proposal, where }` с ключом узла.
// Строка уходит в `data/review-inbox.jsonl` (последние 500); её читают разработчики узла файлом. Чтения дверью и экрана нет.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }
const KEEP = 500
const FILE = () => join(process.cwd(), "data", "review-inbox.jsonl")

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const str = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "")

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const row = { at: new Date().toISOString(), from: str(body.from, 64), where: str(body.where, 120), signal: str(body.signal, 1200), proposal: str(body.proposal, 1200) }
  if (!row.from || !row.signal || !row.proposal) {
    return NextResponse.json({ ok: false, error: "from, signal and proposal are required" }, { status: 400, headers: HEADERS })
  }
  const file = FILE()
  mkdirSync(join(process.cwd(), "data"), { recursive: true })
  appendFileSync(file, `${JSON.stringify(row)}\n`)
  const lines = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean) : []
  if (lines.length > KEEP) writeFileSync(file, `${lines.slice(-KEEP).join("\n")}\n`)
  console.log(`[review-inbox] ${row.from} → ${row.where || "?"}`)
  return NextResponse.json({ ok: true, kept: Math.min(lines.length, KEEP) }, { headers: HEADERS })
}
