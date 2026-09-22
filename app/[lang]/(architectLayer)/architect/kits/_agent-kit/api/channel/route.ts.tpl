// @api set up the __SERVICE__ agent Telegram bot and read its state
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { activationLink, channelState, isService, saveMessages, saveToken } from "../../_agent-kit/server/telegram.cjs"

// БОТ TELEGRAM АГЕНТА СЛУЖБЫ (267-3; в маршруте службы — 271).
// 🔒 ДВЕРЬ КОПИИ КОМПЛЕКТА АГЕНТА (271): шаблон `kits/_agent-kit/api/*/route.ts.tpl`, установщик подставил
// имя службы вместо `__SERVICE__`. Живёт в маршруте службы — удалили папку службы, ушла и дверь.
//
// 🔒 ТОКЕН НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ НИКОГДА — только четыре последних знака, по ним человек узнаёт свой.
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ТЕРМИНАЛА: роль архитектора и отказ на временном адресе.
// 🔒 ЗАПУСКА И ОСТАНОВКИ ЗДЕСЬ НЕТ: бот работает в сессии терминала службы, её запускают и останавливают
// только на странице «Терминал». Допуск по ссылке делает узел сам (`startIdlePoller`).
export const dynamic = "force-dynamic"

const SERVICE = "__SERVICE__"
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

const unknown = () => NextResponse.json({ ok: false, error: "unknown-service" }, { status: 404 })

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (!isService(SERVICE)) return unknown()
  return NextResponse.json({ ok: true, ...channelState(SERVICE) }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  if (!isService(SERVICE)) return unknown()
  const body = (await req.json().catch(() => null)) as { action?: string; token?: string; messages?: unknown } | null
  switch (body?.action) {
    case "token":
      return NextResponse.json(await saveToken(SERVICE, body.token), noStore)
    case "activation-link":
      return NextResponse.json(activationLink(SERVICE), noStore)
    case "messages":
      return NextResponse.json(saveMessages(SERVICE, body.messages), noStore)
    default:
      return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 })
  }
}
