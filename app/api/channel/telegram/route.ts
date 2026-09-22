// @api set up and run the Telegram channel to the node agent
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { activationLink, channelState, checkActivation, saveToken, start, stop } from "@/lib/channel/telegram.cjs"

// КАНАЛ TELEGRAM АГЕНТА УЗЛА (267-3).
//
// 🔒 ТОКЕН НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ НИКОГДА — только четыре последних знака, по ним человек узнаёт свой.
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ТЕРМИНАЛА: роль архитектора и отказ на временном адресе — это запуск агента на
// машине человека, управляемого с телефона.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, ...channelState() }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { action?: string; token?: string; greeting?: string } | null
  switch (body?.action) {
    case "token":
      return NextResponse.json(await saveToken(body.token), noStore)
    case "activation-link":
      return NextResponse.json(activationLink(), noStore)
    case "check-activation":
      return NextResponse.json(await checkActivation(body.greeting), noStore)
    case "start":
      return NextResponse.json({ ...start(), ...channelState() }, noStore)
    case "stop":
      return NextResponse.json({ ...stop(), ...channelState() }, noStore)
    default:
      return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 })
  }
}
