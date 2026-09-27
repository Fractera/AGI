// @api start a draft's birth into an element and report its progress
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { getDraft } from "@/lib/agi-items/drafts"
import { birthState, markRevalidated, startBirth, wasRevalidated } from "@/lib/agi-items/birth"
import { getService } from "@/lib/microservices/registry"

// РОЖДЕНИЕ ЧЕРНОВИКА (319-3). POST — запустить `scripts/item-birth.mjs <id>` отдельным процессом (только кнопкой человека);
// GET — ход по журналу. Черновика нет — 404; элемент уже есть в реестре — 409 `born`; рождение уже идёт — 409 `running`
// (второй процесс не стартует). Когда GET впервые видит `done`, слой архитектора перерисовывается: меню и карточки
// читают реестр при рендере, а страницы кэшированы.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!getDraft(id)) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  if (getService(id)) return NextResponse.json({ ok: false, reason: "born" }, { status: 409 })
  const r = startBirth(id)
  if (!r.ok) return NextResponse.json({ ok: false, reason: r.reason }, { status: r.reason === "running" ? 409 : 500 })
  return NextResponse.json({ ok: true, state: "running" }, { status: 202 })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!getDraft(id)) return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 })
  const s = birthState(id)
  if (s.state === "done" && !wasRevalidated(id)) {
    revalidatePath("/[lang]", "layout")
    markRevalidated(id)
  }
  return NextResponse.json({ ok: true, ...s }, { headers: { "Cache-Control": "no-store" } })
}
