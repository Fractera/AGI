// @api list every element of the node as a passport card
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { passportCards } from "@/lib/agi-items/node-passport"

// КАРТОЧКИ «ПАСПОРТА» УЗЛА (478-1). Страница предрендерена, поэтому состав узла и описания спрашиваются здесь, на запрос.
// 🔒 ДВЕРЬ ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ (как `/api/node/projects`): состав узла — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const lang = req.nextUrl.searchParams.get("lang") === "ru" ? "ru" : "en"
  const cards = await passportCards(lang)
  return NextResponse.json({ ok: true, cards }, { headers: { "Cache-Control": "no-store" } })
}
