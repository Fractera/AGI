// @api read an AGI ITEM's passport through its own door, with the node key
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { idOfAddress } from "@/lib/agi-items/element-address"
import { serviceUrl } from "@/lib/microservices/registry"

// ПАСПОРТ ЭЛЕМЕНТА ГЛАЗАМИ ЯДРА (417). Владелец 2026-10-06: паспорт — главная дверь элемента, «это же Джейсон будет возвращаться в
// ядро». Ядро спрашивает дверь элемента `GET /api/own-service-props` с ключом узла — так в ответе есть и закрытые поля (почта автора,
// IP, связи внутри узла), которых посторонний не получает. Закрыта ролью: сведения о машине человека.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const id = idOfAddress(req.nextUrl.searchParams.get("item") ?? "")
  const base = id ? serviceUrl(id) : null
  if (!id || !base) return NextResponse.json({ ok: false, error: "not-installed" }, { status: 404 })
  try {
    const r = await fetch(`${base}/api/own-service-props`, {
      headers: { "X-Node-Key": process.env.SETTINGS_SECRET ?? "" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return NextResponse.json({ ok: false, error: `element ${r.status}` }, { status: 502 })
    return NextResponse.json({ ok: true, passport: await r.json() }, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as Error).message ?? e) }, { status: 502 })
  }
}
