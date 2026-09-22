// @api report or stop the node agent terminal session and its folder
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { status, stop } from "@/lib/terminal/session.cjs"
import { agentDir, agentService } from "@/lib/terminal/workspace.cjs"

// СОСТОЯНИЕ СЕССИИ АГЕНТА (267-1).
//
// 🔒 ОСТРОВОК СПРАШИВАЕТ ЭТУ ДВЕРЬ ДО ЛЮБОГО СОКЕТА: спит сессия — рисуется серая карточка и не открывается
// ничего. Работает — островок подключается сам, и подключение ничего нового не рождает.
// 🔒 ПАПКА АГЕНТА ПРИХОДИТ ОТСЮДА, А НЕ ИЗ РАЗМЕТКИ: страница предрендерена, а путь — факт о машине.
// Напечатанный при сборке, он запомнился бы навсегда (закон шага 264).
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  return NextResponse.json(
    { ok: true, service: agentService(), agentDir: agentDir(), ...status() },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { action?: string } | null
  if (body?.action !== "stop") return NextResponse.json({ ok: false, reason: "unknown-action" }, { status: 400 })
  return NextResponse.json({ ...stop("stopped"), ...status() }, { headers: { "Cache-Control": "no-store" } })
}
