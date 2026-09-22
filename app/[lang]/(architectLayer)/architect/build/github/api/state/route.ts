// @api tell which repository this node works with and whether its key exists
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { binding } from "../../_github/server/binding.cjs"
import { tokenState } from "../../_github/server/token.cjs"

// ПРИВЯЗКА УЗЛА К РЕПОЗИТОРИЮ (273).
//
// 🔒 ДВЕРЬ ЖИВЁТ В МАРШРУТЕ СВОЕЙ СТРАНИЦЫ: удалили вкладку — ушла и дверь (закон 271).
// 🔒 ПРИВЯЗКА ИЗМЕРЯЕТСЯ ПРИ КАЖДОМ ЗАПРОСЕ: страница предрендерена, а `origin` — факт о машине.
// 🛑 КЛЮЧ НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ: только признак «есть» и четыре последних знака.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json(
    { ok: true, binding: binding(), token: tokenState() },
    { headers: { "Cache-Control": "no-store" } },
  )
}
