// @api read one development document of an AGI ITEM
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { readDoc } from "@/lib/agi-items/element-docs"
import { ITEM_TREE } from "@/lib/agi-items/item-tree"
import { idOfAddress } from "@/lib/agi-items/element-address"

// ДОКУМЕНТ ЭЛЕМЕНТА ДЛЯ СТРАНИЦЫ «Документы» (412-2). Страница предрендерена, а агент элемента переписывает свои документы в
// любую минуту (`current-step.md` — на каждом событии): текст, запечённый в HTML, врал бы с первой правки. Поэтому островок
// спрашивает его здесь, при открытии страницы.
// 🔒 Файл берётся только из дерева меню (`doc` у страницы раздела documents), не из запроса: путь из запроса открыл бы любой
// файл элемента, включая `.env.local`.
// 🔒 ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ, как `/api/node/projects`: документы — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const q = req.nextUrl.searchParams
  const id = idOfAddress(q.get("item") ?? "")
  const doc = ITEM_TREE.find((s) => s.slug === "documents")?.pages?.find((p) => p.slug === q.get("page"))?.doc
  if (!id || !doc) return NextResponse.json({ ok: false, error: "unknown document" }, { status: 404 })
  const files = readDoc(id, doc)
  if (!files) return NextResponse.json({ ok: false, error: "no such file" }, { status: 404 })
  return NextResponse.json({ ok: true, files }, { headers: { "Cache-Control": "no-store" } })
}
