// @api read and set the Resend sign-in letter key of the auth service
import { NextRequest, NextResponse } from "next/server"

import { authResendState, setAuthResendKeys } from "@/lib/domain/auth-env"
import { requireRoles } from "@/lib/auth/require-roles"
import { authMode } from "@/lib/node-state/auth-mode"
import { measureNodeState } from "@/lib/node-state/measure"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"

// ВКЛЮЧЕНИЕ ВХОДА ПИСЬМОМ (RESEND) У СЛУЖБЫ ВХОДА (266-1).
//
// Слово владельца: «запусти абсолютно такой же с точки зрения смысла этапы
// разработки под регистрацию через ресенд». Поэтому дверь устроена как дверь
// Google (265-1) и отличается только тем, чем отличается сам провайдер.
//
// 🛑 ТЕ ЖЕ ТРИ ЗАМКА: `force-dynamic`, роль архитектора спрошена здесь, отказ на
// временном адресе — это запись ключа в чужой сменный блок.
//
// 🛑 КЛЮЧ НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ НИКОГДА. Отправитель возвращается: он не секрет,
// и человек обязан видеть, с какого адреса уйдёт письмо.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

const fail = (reason: string, status = 400) => NextResponse.json({ ok: false, reason }, { status })

async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return fail("temporary-address", 403)
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  // Замок спрашивается у индикатора (276-4): экран не решает сам, свой ли это домен.
  return NextResponse.json({ ok: true, ...authResendState(), mode: authMode(await measureNodeState()) })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied

  let apiKey = ""
  let from = ""
  try {
    const body = (await req.json()) as { apiKey?: unknown; from?: unknown }
    apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : ""
    from = typeof body.from === "string" ? body.from.trim() : ""
  } catch {
    return fail("bad-request")
  }

  // 🛑 ОБА ИЛИ НИ ОДНОГО. Ключ без отправителя оставил бы службе её умолчание
  // `noreply@localhost` — с него Resend не отправит ни одного письма, а кнопка
  // «войти по письму» при этом появится.
  if (!apiKey || !from) return fail("both-required")

  // 🔒 ФОРМА — ЗДЕСЬ, ПРАВИЛЬНОСТЬ — ТОЛЬКО У RESEND. Мы отсекаем очевидно не то и
  // не притворяемся, что умеем проверить ключ или то, подтверждён ли домен
  // отправителя: это знает только Resend, в момент первой отправки.
  if (/\s/.test(apiKey)) return fail("whitespace-in-key")
  // Отправитель — адрес, возможно с именем: «Имя <адрес@домен>» или «адрес@домен».
  const address = (from.match(/<([^>]+)>\s*$/)?.[1] ?? from).trim()
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) return fail("from-shape")
  // Адрес песочницы Resend шлёт письма только владельцу аккаунта — для входа
  // посетителей он не годится, и принять его значит пообещать то, чего не будет.
  if (/@resend\.dev$/i.test(address)) return fail("from-sandbox")

  const res = setAuthResendKeys(apiKey, from)
  if (res.files === 0) return fail(res.reason ?? "auth-not-installed", 409)
  return NextResponse.json({ ok: true, files: res.files, restarted: res.restarted, ...authResendState() })
}

export async function DELETE(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied

  // Пустой ключ и есть выключатель; отправителя оставляем — он не секрет и
  // пригодится, когда вход включат снова.
  const current = authResendState()
  const res = setAuthResendKeys("", current.from ?? "")
  if (res.files === 0) return fail(res.reason ?? "auth-not-installed", 409)
  return NextResponse.json({ ok: true, files: res.files, restarted: res.restarted, ...authResendState() })
}
