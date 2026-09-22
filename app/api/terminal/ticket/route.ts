// @api issue a one-minute single-use ticket for the node terminal socket
import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/lib/auth/get-session"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { mintTicket } from "@/lib/terminal/ticket.cjs"

// БИЛЕТ НА ТЕРМИНАЛ УЗЛА (267-1).
//
// 🔒 РОЛЬ ПРОВЕРЯЕТСЯ ЗДЕСЬ И ТОЛЬКО ЗДЕСЬ. Сокет `/pty` принимает `server.js` до Next, замок слоя его не
// видит — сокет верит лишь билету, который выдала эта дверь.
// 🛑 ОТКАЗ НА ВРЕМЕННОМ АДРЕСЕ: терминал — это командная строка машины человека, и открыть её всякому,
// кому переслали ссылку быстрого туннеля, нельзя.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const session = await getSession(req)
  const { ticket, expiresInMs } = mintTicket(session?.email ?? "architect@node")
  return NextResponse.json({ ok: true, ticket, expiresInMs }, { headers: { "Cache-Control": "no-store" } })
}
