// @api set up one service agent Telegram bot and read its state
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { activationLink, channelState, isService, saveMessages, saveToken } from "@/lib/channel/telegram.cjs"

// БОТ TELEGRAM АГЕНТА УЗЛА (267-3).
//
// 🔒 ТОКЕН НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ НИКОГДА — только четыре последних знака, по ним человек узнаёт свой.
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ТЕРМИНАЛА: роль архитектора и отказ на временном адресе — это агент на машине
// человека, управляемый с телефона.
// 🔒 ЗАПУСКА И ОСТАНОВКИ ЗДЕСЬ НЕТ (решение владельца 2026-09-22): бот работает в сессии терминала, и её
// запускают и останавливают только во вкладке «Терминал». Допуск по ссылке делает узел сам
// (`startIdlePoller`), страница только спрашивает состояние.
// 🔒 СЛУЖБА — `?service=<id>` (269): у каждой службы свой бот; имени нет в реестре или на диске — 404.
export const dynamic = "force-dynamic"

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
  const service = req.nextUrl.searchParams.get("service") ?? ""
  if (!isService(service)) return unknown()
  return NextResponse.json({ ok: true, ...channelState(service) }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const service = req.nextUrl.searchParams.get("service") ?? ""
  if (!isService(service)) return unknown()
  const body = (await req.json().catch(() => null)) as { action?: string; token?: string; messages?: unknown } | null
  switch (body?.action) {
    case "token":
      return NextResponse.json(await saveToken(service, body.token), noStore)
    case "activation-link":
      return NextResponse.json(activationLink(service), noStore)
    case "messages":
      return NextResponse.json(saveMessages(service, body.messages), noStore)
    default:
      return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 })
  }
}
