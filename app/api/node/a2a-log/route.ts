// @api write and read the log of agent-to-agent calls between node elements
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { readLog, writeLog, type LogRecord } from "@/lib/a2a/conversation-log"

// ЖУРНАЛ ОБЩЕНИЯ АГЕНТОВ УЗЛА (шаг 408). POST — запись одного вызова A2A от принимающего элемента: только ключ узла
// (`X-Node-Key`). GET — лента: ключ узла или архитектор/админ; отбор `after` (новее записи — опрос ленты), `before`,
// `element`, `pair=a,b`, `task`, `limit` (≤ 200). Логика — `lib/a2a/conversation-log.ts`.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, error: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let rec: LogRecord
  try { rec = (await req.json()) as LogRecord } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const out = await writeLog(rec)
  return NextResponse.json(out, { status: out.ok ? 200 : 400, headers: HEADERS })
}

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  const out = await readLog(req.nextUrl.searchParams)
  return NextResponse.json(out, { status: out.ok ? 200 : 502, headers: HEADERS })
}
