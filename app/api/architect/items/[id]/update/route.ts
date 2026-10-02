// @api merge a new Fractera tag into an element's own history
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { terminalServiceOf, updateElement, updateState } from "@/lib/agi-items/element-update"

// «ОБНОВИТЬ» ОБЯЗАТЕЛЬНЫЙ ЭЛЕМЕНТ (шаг 374-7). GET — основа, цель, своя работа, идёт ли слияние. POST — слить (кнопка человека).
// Конфликт — ответ 409 `conflict` с файлами, текстом задачи и сегментом терминала: островок открывает терминал элемента с задачей в
// окне вставки (слово владельца 2026-10-02: «fix with ai agent»); агенту без нажатия человека не уходит ничего.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const st = updateState(id)
  return st ? NextResponse.json({ ok: true, ...st }, noStore) : NextResponse.json({ ok: false, error: "not-updatable" }, { status: 404, ...noStore })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const r = updateElement(id)
  if (r.ok) return NextResponse.json(r, noStore)
  return NextResponse.json({ ...r, terminal: terminalServiceOf(id) }, { status: 409, ...noStore })
}
