// @api take the agent-written element description into the core registry
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/agi-items/element-delete"
import { takeDescription } from "@/lib/agi-items/element-describe"

// «ЗАБРАТЬ В ЯДРО» (325-2). POST — паспорт элемента (`summary`, `provides`, написанные его агентом) → запись реестра узла.
// Неверная форма — 422 со словом ошибки, реестр не тронут. Только рождённые элементы; ворота architect/admin; на временном
// публичном адресе — отказ.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  const r = takeDescription(id)
  if (!r.ok) return NextResponse.json(r, { status: r.error === "registry-failed" ? 500 : 422, ...noStore })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json(r, noStore)
}
