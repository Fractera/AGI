// @api list add recheck and remove the node's own domains
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { addDomain, domainHolder, extraDomains, primaryDomain, recheckDomain, removeDomain } from "@/lib/domain/node-domains"

// ДОМЕНЫ УЗЛА (324-1): «Хостинг → Домен» списком. GET — основной (из лестницы 259) и дополнительные с тем, к какому элементу
// каждый подключён; POST `{ name }` — добавить; PUT `{ name }` — спросить Cloudflare о зоне снова; DELETE `{ name }` — убрать
// из списка (подключённый к элементу — 409). Всё по кнопке человека. Ворота architect/admin; на временном адресе — отказ.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function gate(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

async function nameOf(req: NextRequest): Promise<string> {
  const body = (await req.json().catch(() => null)) as { name?: unknown } | null
  return typeof body?.name === "string" ? body.name : ""
}

export async function GET(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const extra = extraDomains().map((d) => ({ ...d, holder: domainHolder(d.name) }))
  return NextResponse.json({ ok: true, primary: primaryDomain(), extra }, noStore)
}

export async function POST(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const r = await addDomain(await nameOf(req))
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}

export async function PUT(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const r = await recheckDomain(await nameOf(req))
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}

export async function DELETE(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const r = removeDomain(await nameOf(req))
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}
