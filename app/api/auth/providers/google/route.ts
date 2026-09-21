// @api read and set the Google sign-in keys of this node's auth service
import { NextRequest, NextResponse } from "next/server"

import { authGoogleState, setAuthGoogleKeys } from "@/lib/domain/auth-env"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"

// ВКЛЮЧЕНИЕ ПРОВАЙДЕРА GOOGLE У СЛУЖБЫ ВХОДА (265-1).
//
// Решение владельца 2026-09-21, дословно: «Вход через Google первый, экран пишет
// ключи сам». То есть человек не редактирует файлы — он вводит пару, а узел
// доносит её до службы и перезапускает её.
//
// 🔒 ЭТО ЗАПИСЬ В ЧУЖОЙ СМЕННЫЙ БЛОК, И ОТСЮДА ВСЕ ОГРАНИЧЕНИЯ НИЖЕ. Узел не
// хранит эти ключи у себя и не может: читает их служба, при старте, из своего
// `.env.local`. Мы только доставляем.
//
// 🛑 ТРИ ЗАМКА, И НИ ОДИН НЕ ЛИШНИЙ:
//   1. `force-dynamic` — маршрут данных, не страница;
//   2. РОЛЬ АРХИТЕКТОРА, спрошенная здесь, а не оставленная воротам: `proxy.ts`
//      требует лишь наличие сессии, то есть пускает любого вошедшего;
//   3. ОТКАЗ НА ВРЕМЕННОМ АДРЕСЕ. Ворота пропускают временный адрес целиком —
//      иначе замок слоя показывал бы окно «нет доступа» поверх открытой
//      страницы. Для чтения это верно, для записи секретов — нет: ссылку
//      `*.trycloudflare.com` знает всякий, кому её переслали.
//
// 🛑 СЕКРЕТ НЕ ВОЗВРАЩАЕТСЯ НАРУЖУ НИКОГДА. `GET` отвечает «установлен / не
// установлен», а не значением. Отданный однажды в HTML, ключ живёт в истории
// браузера, в кэше и в чужом скриншоте; починить это потом нельзя — только
// перевыпустить ключ у Google.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

const fail = (reason: string, status = 400) => NextResponse.json({ ok: false, reason }, { status })

/** Общая для всех методов проверка: кто пришёл и откуда. */
async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return fail("temporary-address", 403)
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  return NextResponse.json({ ok: true, ...authGoogleState() })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied

  let clientId = ""
  let clientSecret = ""
  try {
    const body = (await req.json()) as { clientId?: unknown; clientSecret?: unknown }
    clientId = typeof body.clientId === "string" ? body.clientId.trim() : ""
    clientSecret = typeof body.clientSecret === "string" ? body.clientSecret.trim() : ""
  } catch {
    return fail("bad-request")
  }

  // 🛑 ОБА ИЛИ НИ ОДНОГО. Служба поднимает провайдера только когда непусты оба
  // ключа; записав один, мы оставили бы человека с виду настроенным входом,
  // который молчит. Пустая пара — это `DELETE`, и у неё свой метод.
  if (!clientId || !clientSecret) return fail("both-required")

  // 🔒 ФОРМА ПРОВЕРЯЕТСЯ ЗДЕСЬ, А ПРАВИЛЬНОСТЬ — ТОЛЬКО У GOOGLE. Мы отсекаем
  // очевидно не то (перенос строки, пробел, адрес страницы, вставленный целиком),
  // и не притворяемся, что умеем проверить ключ: это знает только сам Google, в
  // момент первого входа. Обещать больше — уверенное умолчание.
  if (/\s/.test(clientId) || /\s/.test(clientSecret)) return fail("whitespace-in-key")
  if (!clientId.endsWith(".apps.googleusercontent.com")) return fail("client-id-shape")

  const res = setAuthGoogleKeys(clientId, clientSecret)
  if (res.files === 0) return fail(res.reason ?? "auth-not-installed", 409)
  return NextResponse.json({ ok: true, files: res.files, restarted: res.restarted, ...authGoogleState() })
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied

  // Пустые значения и есть выключатель — см. закон в `lib/domain/auth-env.ts`.
  const res = setAuthGoogleKeys("", "")
  if (res.files === 0) return fail(res.reason ?? "auth-not-installed", 409)
  return NextResponse.json({ ok: true, files: res.files, restarted: res.restarted, ...authGoogleState() })
}
