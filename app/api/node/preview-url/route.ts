// @api tell the address where an element of this node can be previewed
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { serviceUrl } from "@/lib/microservices/registry"
import { publicAuth } from "@/lib/domain/public-auth.cjs"

// АДРЕС ДЛЯ ПРОСМОТРА ЭЛЕМЕНТА (страница Preview, слово владельца 2026-09-24).
//
// 🔒 АДРЕС — ТОТ, ДО КОТОРОГО ДОТЯНЕТСЯ БРАУЗЕР ЧЕЛОВЕКА, А НЕ СЕРВЕР. На своём домене: сайт — корень
// зоны, вход — `auth.<зона>`. Без домена — петля машины: человек открыл ядро на этом же компьютере.
// У элемента без публичного имени (данные) — петля, и ответ говорит `public: false`: с чужого компьютера
// такой адрес не откроется, и страница обязана это сказать, а не показать пустую рамку молча.
export const dynamic = "force-dynamic"


export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const local = serviceUrl(id)
  if (!local) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  const lang = req.nextUrl.searchParams.get("lang") ?? "en"
  const pub = publicAuth(process.cwd())
  let base: string | null = null
  if (pub && id === "root" && pub.architectHost) base = `https://${pub.siteHost}`
  if (pub && id === "auth") base = `https://${pub.authHost}`
  const url = `${(base ?? local).replace(/\/+$/, "")}/${lang}`
  return NextResponse.json({ ok: true, url, public: !!base }, { headers: { "Cache-Control": "no-store" } })
}
