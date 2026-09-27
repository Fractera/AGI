// @api connect a born element to its owner's GitHub repository
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { connectElementGithub, elementDir, elementGithubState, forgetElementToken } from "@/lib/agi-items/element-github"

// СВЯЗЬ РОЖДЁННОГО ЭЛЕМЕНТА С GITHUB ВЛАДЕЛЬЦА (319-5). GET — состояние (репозиторий, аккаунт, 4 знака ключа, последняя
// выгрузка, число незакоммиченных правок); POST `{ repo, token }` — проверить у GitHub и сохранить только при праве записи;
// DELETE — забыть ключ. Ворота architect/admin; на временном публичном адресе — отказ (ключ — секрет, как у ядра, 273).

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function gate(req: NextRequest, id: string) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  if (!elementDir(id)) return NextResponse.json({ ok: false, error: "not-born" }, { status: 404 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  return NextResponse.json({ ok: true, ...elementGithubState(id) }, noStore)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  const body = (await req.json().catch(() => null)) as { repo?: unknown; token?: unknown } | null
  const r = await connectElementGithub(id, String(body?.repo ?? ""), String(body?.token ?? ""))
  if (!r.ok) return NextResponse.json(r, { status: 409, ...noStore })
  return NextResponse.json({ ok: true, ...elementGithubState(id) }, noStore)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  forgetElementToken(id)
  return NextResponse.json({ ok: true, ...elementGithubState(id) }, noStore)
}
