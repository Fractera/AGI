// @api report or stop the data agent terminal session
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { status, stop } from "../../_agent-kit/server/session.cjs"
import { serviceDir } from "../../_agent-kit/server/workspace.cjs"

// СОСТОЯНИЕ СЕССИИ АГЕНТА СЛУЖБЫ (267-1; в маршруте службы — 271).
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил
// имя службы вместо `data`. Живёт в маршруте службы — удалили папку службы, ушла и дверь.
//
// 🔒 ОСТРОВОК СПРАШИВАЕТ ЭТУ ДВЕРЬ ДО ЛЮБОГО СОКЕТА: спит сессия — рисуется серая карточка и не открывается
// ничего. Работает — островок подключается сам, и подключение ничего нового не рождает.
// 🔒 ПАПКА АГЕНТА ПРИХОДИТ ОТСЮДА, А НЕ ИЗ РАЗМЕТКИ: страница предрендерена, а путь — факт о машине.
// 🛑 Службы нет в реестре узла или на диске — 404, а не чужая сессия.
export const dynamic = "force-dynamic"

const SERVICE = "data"
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const dir = serviceDir(SERVICE)
  if (!dir) return NextResponse.json({ ok: false, reason: "unknown-service" }, { status: 404 })
  return NextResponse.json({ ok: true, service: SERVICE, agentDir: dir, ...status(SERVICE) }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (!serviceDir(SERVICE)) return NextResponse.json({ ok: false, reason: "unknown-service" }, { status: 404 })
  const body = (await req.json().catch(() => null)) as { action?: string } | null
  if (body?.action !== "stop") return NextResponse.json({ ok: false, reason: "unknown-action" }, { status: 400 })
  return NextResponse.json({ ...stop(SERVICE, "stopped"), ...status(SERVICE) }, noStore)
}
