// @api read which environment variables are set and save the OpenAI key
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/agi-items/element-delete"
import { EDITABLE, type EditableName, setNames, writeVar } from "@/lib/env-file"

// ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ (336-1). `?target=core` или id рождённого элемента.
//   GET  — имена заданных переменных и есть ли ключ OpenAI у ядра. Значений в ответе нет никогда.
//   POST `{ target, name, value }` — только EDITABLE; ключ OpenAI до записи проверяется НАСТОЯЩИМ вызовом OpenAI (формат
//        не доказывает, что ключ живой). Отказ — файл не тронут.
// Ворота architect/admin; на временном публичном адресе — отказ: ключ, вписанный через чужой туннель, — утечка.
export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store" }
const OPENAI_KEY = /^sk-[A-Za-z0-9_-]{20,300}$/

function targetOk(target: string): boolean {
  return target === "core" || isBornElement(target)
}

async function gate(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ["architect", "admin"])
}

export async function GET(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  const target = req.nextUrl.searchParams.get("target") ?? ""
  if (!targetOk(target)) return NextResponse.json({ ok: false, error: "unknown-target" }, { status: 404 })
  const set = setNames(target)
  const coreHasKey = Boolean(process.env.OPENAI_API_KEY) || setNames("core").includes("OPENAI_API_KEY")
  return NextResponse.json({ ok: true, set, editable: EDITABLE, coreHasKey }, { headers: NO_STORE })
}

/** Живой ли ключ: список моделей OpenAI отвечает 200 только настоящему ключу. */
async function probe(key: string): Promise<"ok" | "key-rejected" | "probe-failed"> {
  try {
    const r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) })
    if (r.ok) return "ok"
    return r.status === 401 || r.status === 403 ? "key-rejected" : "probe-failed"
  } catch {
    return "probe-failed"
  }
}

export async function POST(req: NextRequest) {
  const denied = await gate(req)
  if (denied) return denied
  let body: { target?: unknown; name?: unknown; value?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 }) }
  const target = typeof body.target === "string" ? body.target : ""
  const name = typeof body.name === "string" ? body.name : ""
  const value = typeof body.value === "string" ? body.value.trim() : ""
  if (!targetOk(target)) return NextResponse.json({ ok: false, error: "unknown-target" }, { status: 404 })
  if (!(EDITABLE as readonly string[]).includes(name)) return NextResponse.json({ ok: false, error: "not-editable" }, { status: 400 })
  if (!OPENAI_KEY.test(value)) return NextResponse.json({ ok: false, error: "bad-format" }, { status: 400 })
  const checked = await probe(value)
  if (checked !== "ok") return NextResponse.json({ ok: false, error: checked }, { status: 400, headers: NO_STORE })
  if (!writeVar(target, name as EditableName, value)) return NextResponse.json({ ok: false, error: "write-failed" }, { status: 500 })
  const coreHasKey = Boolean(process.env.OPENAI_API_KEY) || setNames("core").includes("OPENAI_API_KEY")
  return NextResponse.json({ ok: true, coreHasKey }, { headers: NO_STORE })
}
