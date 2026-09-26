// @api create a new microservice draft with its own architect page group
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { createDraft, listDrafts } from "@/lib/agi-items/drafts"

// ЧЕРНОВИКИ ЭЛЕМЕНТОВ (314-1). POST — создать: имя из пяти знаков (буква + base36, сверено с занятыми), запись в `data/agi-drafts.json`, после записи слой
// архитектора перерисовывается по первому запросу — группа страниц появляется без пересборки. GET — список.
// Только архитектор и админ: черновик меняет меню слоя, закрытого воротами.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, drafts: listDrafts() })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const draft = createDraft()
  if (!draft) return NextResponse.json({ ok: false, reason: "write-failed" }, { status: 500 })
  revalidatePath("/[lang]", "layout")
  return NextResponse.json({ ok: true, id: draft.id, createdAt: draft.createdAt })
}
