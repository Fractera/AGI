// @api pin one agent conversation so the log keeps it
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { dataFetch } from "@/lib/fractera/data-service"

// ЗАКРЕПИТЬ БЕСЕДУ В ЖУРНАЛЕ (шаг 412-5). Владелец 2026-10-06 выбрал «б»: беседы, на которые ссылается сводка заказа, журнал
// не вытесняет. Зовёт `npm run order:save` элемента сразу после записи сводки; слой данных (`POST /a2a-log/pin`) отмечает
// `contextId`, и вытеснение последних 10 000 его строки пропускает. Только ключ узла.
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
  let body: { contextId?: unknown; by?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  if (typeof body.contextId !== "string" || !body.contextId.trim()) {
    return NextResponse.json({ ok: false, error: "contextId is required" }, { status: 400, headers: HEADERS })
  }
  try {
    const res = await dataFetch("/a2a-log/pin", { method: "POST", body: JSON.stringify({ contextId: body.contextId, by: body.by }) })
    const out = await res.json().catch(() => ({}))
    return NextResponse.json(res.ok ? { ok: true, ...out } : { ok: false, error: out.error ?? `data layer ${res.status}` }, { status: res.ok ? 200 : 502, headers: HEADERS })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message ?? e) }, { status: 502, headers: HEADERS })
  }
}
