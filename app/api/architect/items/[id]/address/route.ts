// @api check and set the core address of a born AGI element
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/agi-items/element-delete"
import { addressOf, checkAddress, setAddress } from "@/lib/agi-items/element-address"

// «ПЕРЕИМЕНОВАТЬ АДРЕС» (325-3). GET `?name=` — свободно ли имя (занято — варианты); POST `{ address }` — записать, id не
// меняется. Только рождённые элементы; ворота architect/admin; на временном публичном адресе — отказ. Поддомен не трогается.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function gate(req: NextRequest, id: string) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  return null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  const name = (req.nextUrl.searchParams.get("name") ?? "").trim()
  return NextResponse.json({ current: addressOf(id), ...checkAddress(name, id) }, noStore)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await gate(req, id)
  if (g) return g
  const body = (await req.json().catch(() => null)) as { address?: unknown } | null
  const name = typeof body?.address === "string" ? body.address.trim() : ""
  const r = setAddress(id, name)
  if (!r.ok) return NextResponse.json(r, { status: 409, ...noStore })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ...r, address: addressOf(id) }, noStore)
}
