// @api wake the Claude Code agent of a node element without a browser
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

// ПРОБУЖДЕНИЕ АГЕНТА ЭЛЕМЕНТА (шаг 409-1; владелец 2026-10-05: «агент должен уметь запускать собственный терминал»; «примерно
// 300 МБ свободной памяти на один терминал»). POST `{ service, reason?, text? }` с ключом узла (`X-Node-Key`): сессия `claude`
// рождается тем же путём, что кнопкой в окне терминала (`_agent-kit/server/bridge.cjs` → `wake`), `text` вставляется во вход
// агента, когда его экран затих. Свободной памяти меньше нормы — `{ ok:false, reason:"memory", freeMb, perSessionMb }`.
// Вход пробуждения кладёт в `globalThis` общее подключение комплектов (`lib/agent-kit/mount.cjs`) при старте сервера.
export const dynamic = "force-dynamic"

const HEADERS = { "Cache-Control": "no-store" }

type Wake = (service: string, opts: { text?: string }) => Promise<Record<string, unknown> & { ok: boolean }>

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    return NextResponse.json({ ok: false, reason: "node key required (X-Node-Key)" }, { status: 401, headers: HEADERS })
  }
  let body: { service?: unknown; reason?: unknown; text?: unknown }
  try { body = await req.json() } catch {
    return NextResponse.json({ ok: false, reason: "invalid JSON" }, { status: 400, headers: HEADERS })
  }
  const service = typeof body.service === "string" ? body.service.trim() : ""
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) {
    return NextResponse.json({ ok: false, reason: "service must be an element id" }, { status: 400, headers: HEADERS })
  }
  const wake = (globalThis as { __agiAgentWake?: Wake }).__agiAgentWake
  if (typeof wake !== "function") {
    return NextResponse.json({ ok: false, reason: "agent kits are not mounted in this process" }, { status: 503, headers: HEADERS })
  }
  const text = typeof body.text === "string" && body.text.trim() ? body.text.slice(0, 8000) : undefined
  const out = await wake(service, { text })
  console.log(`[agents/wake] ${service} reason=${String(body.reason ?? "-").slice(0, 32)} → ${out.ok ? (out.already ? "already" : "started") : out.reason}`)
  const status = out.ok ? 200 : out.reason === "memory" ? 503 : out.reason === "no-agent-kit" || out.reason === "no-agent-dir" ? 404 : 409
  return NextResponse.json(out, { status, headers: HEADERS })
}
