// @api redraw an element's pages now, from the core's own server
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { redrawElement } from "@/lib/agi-items/element-domain"
import { serviceUrl } from "@/lib/microservices/registry"

// «ОБНОВИТЬ» В PREVIEW (324-6). Прежде браузер звал `<адрес элемента>/api/revalidate` по куке входа; на собственном домене
// элемента кука узла не живёт, и кнопка молча не срабатывала. Теперь зовёт ядро — со своего сервера, по петле машины
// (хозяин за машиной — архитектор у элемента); браузеру остаётся ворота архитектора ядра.
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  if (!serviceUrl(id)) return NextResponse.json({ ok: false, error: "unknown-element" }, { status: 404 })
  const ok = await redrawElement(id)
  return NextResponse.json({ ok }, { status: ok ? 200 : 502, headers: { "Cache-Control": "no-store" } })
}
