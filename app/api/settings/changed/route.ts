// @api take the Design element signal and re-style the core pages
// POST /api/settings/changed — сигнал элемента «Дизайн» «версия сменилась» (шаг 309). Ключ узла в `X-Settings-Key`.
// Забирает оформление проекта и перерисовывает страницы ядра без пересборки. Модуль — `lib/design-follow.ts`.
import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { pullDesign, signalKeyOk } from "@/lib/design-follow"

export async function POST(req: NextRequest) {
  if (!signalKeyOk(req.headers.get("x-settings-key"))) return NextResponse.json({ ok: false, reason: "bad-key" }, { status: 401 })
  const r = await pullDesign()
  if (!r.ok) {
    console.warn(`[design] сигнал: забрать не удалось — ${r.reason}`)
    return NextResponse.json(r, { status: 502 })
  }
  // По любому сигналу с ключом: собранные страницы могли быть построены по другому DESIGN-CONFIG (посев перед сборкой).
  revalidatePath("/", "layout")
  console.log(`[design] сигнал: ${r.changed ? "оформление обновлено" : "без изменений"} — страницы ядра перерисованы`)
  return NextResponse.json(r)
}
