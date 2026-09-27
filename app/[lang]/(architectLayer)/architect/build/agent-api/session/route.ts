// @api report or stop the build agent terminal session
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { status, stop } from "../../_agent-kit/server/session.cjs"
import { isBornItem, serviceDir } from "../../_agent-kit/server/workspace.cjs"

// СОСТОЯНИЕ СЕССИИ АГЕНТА СЛУЖБЫ (267-1; в маршруте службы — 271).
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил
// имя службы вместо `build`. Живёт в маршруте службы — удалили папку службы, ушла и дверь.
// 🔒 ОБЩАЯ КОПИЯ ДЛЯ РОЖДЁННЫХ (326): установщик с `--born` ставит вместо имени метку `__BORN__`, и имя элемента
// берётся ИЗ АДРЕСА (`architect/[item]/agent-api/…`) — только рождённого элемента, иначе 404.
//
// 🔒 ОСТРОВОК СПРАШИВАЕТ ЭТУ ДВЕРЬ ДО ЛЮБОГО СОКЕТА: спит сессия — рисуется серая карточка и не открывается
// ничего. Работает — островок подключается сам, и подключение ничего нового не рождает.
// 🔒 ПАПКА АГЕНТА ПРИХОДИТ ОТСЮДА, А НЕ ИЗ РАЗМЕТКИ: страница предрендерена, а путь — факт о машине.
// 🛑 Службы нет в реестре узла или на диске — 404, а не чужая сессия.
export const dynamic = "force-dynamic"

const INSTALLED: string = "build"
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }
// Параметры маршрута — словарь строк: у обычной копии там только `lang`, у общей — ещё и `item` (так их принимает Next).
type Ctx = { params: Promise<Record<string, string>> }

/** Имя службы этой двери: подставленное установщиком, а у общей копии — из адреса, только рождённого элемента. */
async function serviceOf(ctx: Ctx): Promise<string | null> {
  if (INSTALLED !== "__BORN__") return INSTALLED
  const id = (await ctx.params)?.item ?? ""
  return isBornItem(id) ? id : null
}

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

const unknown = () => NextResponse.json({ ok: false, reason: "unknown-service" }, { status: 404 })

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req)
  if (denied) return denied
  const service = await serviceOf(ctx)
  const dir = service ? serviceDir(service) : null
  if (!service || !dir) return unknown()
  return NextResponse.json({ ok: true, service, agentDir: dir, ...status(service) }, noStore)
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const denied = await guard(req)
  if (denied) return denied
  const service = await serviceOf(ctx)
  if (!service || !serviceDir(service)) return unknown()
  const body = (await req.json().catch(() => null)) as { action?: string } | null
  if (body?.action !== "stop") return NextResponse.json({ ok: false, reason: "unknown-action" }, { status: 400 })
  return NextResponse.json({ ...stop(service, "stopped"), ...status(service) }, noStore)
}
