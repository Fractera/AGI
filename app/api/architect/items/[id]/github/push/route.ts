// @api export a born element's folder to its connected GitHub repository
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { elementGithubState, pushElement } from "@/lib/agi-items/element-github"

// ВЫГРУЗКА ЭЛЕМЕНТА В GITHUB — ТОЛЬКО КНОПКОЙ (319-5, решение владельца «Кнопкой»). Тело `{ commit }`: false — при
// незакоммиченных правках отказ 409 `dirty` с их числом; true — узел сначала делает коммит «export <дата>» (вторая кнопка
// человека, слово владельца «а and b need both»). Вывод git наружу не отдаётся — только машинное слово причины.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  const body = (await req.json().catch(() => null)) as { commit?: unknown } | null
  const r = pushElement(id, body?.commit === true)
  if (!r.ok) return NextResponse.json({ ...r, ...elementGithubState(id) }, { status: r.error === "not-born" ? 404 : 409, ...noStore })
  return NextResponse.json({ ok: true, ...elementGithubState(id) }, noStore)
}
