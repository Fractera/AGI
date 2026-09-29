// @api build an element preview beside the live one, accept or reject
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/agi-items/element-delete"

// ПРЕДПРОСМОТР ЭЛЕМЕНТА (337-4). GET — состояние (`data/services/<id>/preview.json`, живость процессов измеряется здесь же);
// POST `{ action: "stage" | "promote" | "discard" }` — запускает `scripts/element-preview.mjs` вне дерева процессов ядра.
// Ворота architect/admin; на временном публичном адресе — отказ.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const NO_STORE = { "Cache-Control": "no-store" }

type Preview = { state?: string; pid?: number; serverPid?: number; port?: number; commit?: string | null; note?: string; [k: string]: unknown }

function alive(pid: unknown): boolean {
  if (typeof pid !== "number") return false
  try { process.kill(pid, 0); return true } catch (e) { return (e as NodeJS.ErrnoException)?.code === "EPERM" }
}

function read(id: string): Preview | null {
  let p: Preview | null = null
  try { p = JSON.parse(readFileSync(join(ROOT, "data", "services", id, "preview.json"), "utf8")) as Preview } catch { return null }
  if (p.state === "building" && !alive(p.pid)) return { ...p, state: "failed", note: "сборка предпросмотра прервана — процесс исчез" }
  if (p.state === "ready" && !alive(p.serverPid)) return { ...p, state: "failed", note: "сервер предпросмотра погас" }
  return p
}

async function gate(req: NextRequest, id: string): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const denied = await gate(req, id)
  if (denied) return denied
  return NextResponse.json({ ok: true, preview: read(id) }, { headers: NO_STORE })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const denied = await gate(req, id)
  if (denied) return denied
  let body: { action?: unknown } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 }) }
  const action = String(body.action ?? "")
  if (!["stage", "promote", "discard"].includes(action)) return NextResponse.json({ ok: false, error: "bad-request" }, { status: 400 })
  const now = read(id)
  if (action === "stage" && now?.state === "building") return NextResponse.json({ ok: false, error: "already-building" }, { status: 409 })
  if (action === "promote" && now?.state !== "ready") return NextResponse.json({ ok: false, error: "nothing-to-accept" }, { status: 409 })
  // Вне дерева процессов ядра — тот же запускатель, что у развёртывания (337-1).
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "element-preview.mjs"), action, id], {
    cwd: ROOT, windowsHide: true, stdio: "ignore", timeout: 10_000,
  })
  return NextResponse.json({ ok: true, action }, { headers: NO_STORE })
}
