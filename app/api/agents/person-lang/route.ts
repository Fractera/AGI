// @api element agent reports the language its person now writes in
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

// ЯЗЫК ЧЕЛОВЕКА В TELEGRAM ЭЛЕМЕНТА (шаг 411-1; владелец 2026-10-06: «в своем чате я вижу на своем языке по дефолту ну или если я
// уже после этого перешёл на другой язык»). POST `{ service, lang }` с ключом узла: свой агент увидел, что человек пишет на другом
// языке (код BCP 47: `uk`, `zh`, `pt-BR`), — с этого момента вопросы ядра, реплики разговора и ответы агента идут на нём.
// Пишет `data/services/<id>/channel/telegram/person.json` (`source: agent`) единственный писатель — комплект агента
// (`_agent-kit/server/telegram.cjs` → `setPersonLang`), его вход кладёт в `globalThis` общее подключение `lib/agent-kit/mount.cjs`.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

type SetLang = (service: string, lang: string) => { ok: boolean; lang?: string; error?: string }

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
  let body: { service?: unknown; lang?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const service = typeof body.service === "string" ? body.service.trim() : ""
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) {
    return NextResponse.json({ ok: false, error: "service must be an element id" }, { status: 400, headers: HEADERS })
  }
  const setLang = (globalThis as { __agiPersonLang?: SetLang }).__agiPersonLang
  if (typeof setLang !== "function") {
    return NextResponse.json({ ok: false, error: "agent kits are not mounted in this process" }, { status: 503, headers: HEADERS })
  }
  const out = setLang(service, typeof body.lang === "string" ? body.lang : "")
  console.log(`[agents/person-lang] ${service} → ${out.ok ? out.lang : out.error}`)
  const status = out.ok ? 200 : out.error === "no-agent-kit" ? 404 : 400
  return NextResponse.json(out, { status, headers: HEADERS })
}
