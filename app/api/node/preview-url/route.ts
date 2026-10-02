// @api tell the address where an element of this node can be previewed
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { getService, serviceUrl } from "@/lib/microservices/registry"
// АДРЕС ДЛЯ ПРОСМОТРА ЭЛЕМЕНТА (страница Preview, слово владельца 2026-09-24).
//
// 🔒 373-2 (владелец 2026-10-02): «задача привью … в том чтобы показывать то как домен работает прямо сейчас режиме локальной
// разработки … она вообще должна уметь работать только с режимом Dev mode»; через интернет — «Только кнопка»; живой dev-сервер
// отменён («у компьютера есть только 400 МБ … давай отталкиваться от того какой у нас сейчас режим»). Поэтому адрес ВСЕГДА —
// петля машины: работающая сборка элемента, а не его публичный домен. Ни домен, ни поддомен здесь не выводятся: ✗ 2026-10-02
// Preview roman показывал отданный чужому аккаунту aifa.dev (530) вместо сайта. Страница ядра не на петле фрейма не строит.
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const local = serviceUrl(id)
  if (!local) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  const lang = req.nextUrl.searchParams.get("lang") ?? "en"
  // 2026-10-02 (владелец: белый экран на se2xu…/ru): элемент из репозитория человека — чужой проект без языковых адресов; путь
  // `/<язык>` есть только у наших стартеров. Mosaic Lite на `/ru`: «No routes matched location "/ru"» — пустая страница.
  const fromRepo = (getService(id) as { born?: { from?: string } } | null)?.born?.from === "repository"
  const url = `${local.replace(/\/+$/, "")}/${fromRepo ? "" : lang}`
  return NextResponse.json({ ok: true, url }, { headers: { "Cache-Control": "no-store" } })
}
