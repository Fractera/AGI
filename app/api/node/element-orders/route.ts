// @api list the order summaries one AGI ITEM saved
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { listOrders } from "@/lib/agi-items/element-orders"
import { idOfAddress } from "@/lib/agi-items/element-address"

// ЗАКАЗЫ ЭЛЕМЕНТА ДЛЯ СТРАНИЦЫ «Процесс → Заказы» (412-6). Сводки пишет агент элемента при закрытии заказа A2A; страница
// предрендерена, поэтому список спрашивается здесь, при открытии. Беседу заказа островок берёт из `/api/node/a2a-log?context=`.
// 🔒 ЗАКРЫТА ВОРОТАМИ И РОЛЬЮ, как `/api/node/projects`: заказы — сведения о машине человека.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  if (!id) return NextResponse.json({ ok: false, error: "unknown element" }, { status: 404 })
  return NextResponse.json({ ok: true, orders: listOrders(id) }, { headers: { "Cache-Control": "no-store" } })
}
