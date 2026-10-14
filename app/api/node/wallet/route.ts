// @api connect or disconnect the node wallet address
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isEvmAddress, readWallet, removeWallet, saveWallet } from "@/lib/agi-items/node-wallet"

// КОШЕЛЁК УЗЛА (478-3): GET — подключён ли, POST `{ address }` — подключить (адрес EVM: 0x и 40 шестнадцатеричных знаков, иначе 422),
// DELETE — отключить. Только архитектор: кошелёк — счёт всех элементов узла.
export const dynamic = "force-dynamic"

const ROLES = ["architect"] as const
const NO_STORE = { "Cache-Control": "no-store" }

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json({ ok: true, wallet: readWallet() }, { headers: NO_STORE })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { address?: unknown } | null
  if (!isEvmAddress(body?.address)) return NextResponse.json({ ok: false, error: "bad-address" }, { status: 422, headers: NO_STORE })
  return NextResponse.json({ ok: true, wallet: saveWallet(body.address) }, { headers: NO_STORE })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  removeWallet()
  return NextResponse.json({ ok: true, wallet: null }, { headers: NO_STORE })
}
