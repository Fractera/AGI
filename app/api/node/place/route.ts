// @api read or set where this node stands
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { readPlace, writePlace } from "@/lib/node-state/place"

// ГДЕ СТОИТ УЗЕЛ — ОБЪЯВЛЕНИЕ ЧЕЛОВЕКА (276-3).
//
// 🔒 ЕДИНСТВЕННОЕ СВЕДЕНИЕ ИНДИКАТОРА, КОТОРОЕ НЕ ИЗМЕРЯЕТСЯ. «Домашний компьютер» и «выделенный
// сервер» неразличимы ни по сети, ни по машине, и прибор, который взялся бы это угадывать, однажды
// уверенно соврал бы. Поэтому узел спрашивает, а ответ помечает как слова человека.
//
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ПРОЧИХ ДВЕРЕЙ УЗЛА: роль архитектора и отказ на временном адресе. Второе не
// перестраховка: ссылку быстрого туннеля пересылают, и менять состояние чужого узла по ней нельзя.
//
// 🔒 GET ОТВЕЧАЕТ И ТОГДА, КОГДА НИКТО НИЧЕГО НЕ ГОВОРИЛ, — `kind: "unknown"`. Отсутствие ответа и
// ответ «не знаю» — разные вещи, и дверь обязана уметь сказать второе.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, place: readPlace() }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { place?: unknown } | null
  const saved = writePlace(body?.place)
  // Слово не из списка — отказ с названием допустимых, а не молчаливая запись чужого состояния.
  if (!saved) {
    return NextResponse.json({ ok: false, error: "unknown-place", allowed: ["home", "server"] }, { status: 400 })
  }
  return NextResponse.json({ ok: true, place: saved }, noStore)
}
