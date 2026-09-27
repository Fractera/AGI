// @api check an own second domain for a born element root
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { isBornElement } from "@/lib/agi-items/element-delete"
import { checkDomain, domainOf } from "@/lib/agi-items/element-domain"

// «СВОЙ ДОМЕН» ЭЛЕМЕНТА (324-1). GET `?name=` — форма имени по правилам DNS, занятость другим элементом, зона в аккаунте
// Cloudflare узла и её статус (серверы имён — если зона ждёт их у регистратора). Ничего не пишет. Подключение — 324-2.
// Только рождённые элементы; ворота architect/admin; на временном публичном адресе — отказ.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  if (!isBornElement(id)) return NextResponse.json({ ok: false, error: "not-a-born-element" }, { status: 404 })
  const name = req.nextUrl.searchParams.get("name") ?? ""
  return NextResponse.json({ current: domainOf(id), ...(await checkDomain(name, id)) }, noStore)
}
