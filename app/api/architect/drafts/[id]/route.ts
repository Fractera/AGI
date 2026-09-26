// @api delete a microservice draft after its address is typed back
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { deleteDraft, draftAddress, getDraft } from "@/lib/agi-items/drafts"

// УДАЛЕНИЕ ЧЕРНОВИКА (314-1). Тело `{ confirm }` обязано совпасть с адресом черновика `<id>.<зона>` буква в букву —
// та же проверка, что в окне, но здесь она не обходится запросом мимо окна. Не совпало — 409, ничего не удалено.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!getDraft(id)) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  const body = (await req.json().catch(() => null)) as { confirm?: unknown } | null
  if (typeof body?.confirm !== "string" || body.confirm.trim() !== draftAddress(id)) {
    return NextResponse.json({ ok: false, reason: "confirm-mismatch" }, { status: 409 })
  }
  if (!deleteDraft(id)) return NextResponse.json({ ok: false, reason: "write-failed" }, { status: 500 })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, id })
}
