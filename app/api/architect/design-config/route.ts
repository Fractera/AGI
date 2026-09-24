// @api read and change the site element's design settings from the core
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { serviceUrl } from "@/lib/microservices/registry"

// ОФОРМЛЕНИЕ САЙТА ИЗ ЯДРА (280-6).
//
// 🔒 ЯДРО НЕ ХРАНИТ ОФОРМЛЕНИЕ САЙТА — ОНО ДОТЯГИВАЕТСЯ ДО НЕГО (закон направления потока, слово
// владельца 2026-09-23). Файл живёт в элементе root (`DESIGN-CONFIG/design-config.json` сайта);
// эта дверь только передаёт правку его двери настроек `/api/settings/design` под ключом
// `SETTINGS_SECRET`. Оформление запекается в страницы сайта на сборке — применяет его развёртывание.
//
// 🔒 АДРЕС ТОТ ЖЕ, ЧТО У РЕДАКТОРА fractera-next-starter (`/api/architect/design-config`, POST с
// `{ patch }`): островки перенесены оттуда без изменения того, как они сохраняют.
//
// 🔒 СОХРАНЕНИЕ НЕ ПЕРЕСОБИРАЕТ САЙТ (280-11a, слово владельца 2026-09-24): «важно чтобы пользователь не
// запускал это после каждого изменения: изменил шрифт сохранил рано запускать развёртывание». До 280-11a
// дверь пересобирала сайт на КАЖДОЕ сохранение — ~2 минуты машины, и одно такое сохранение 2026-09-24
// 08:12 уронило сайт (kill EPERM). Применяет правки кнопка на «Строительство → Дашборд развёртываний».
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const ROOT = process.cwd()

/** Ключ двери сайта — из окружения узла, куда его положил установщик. */
function settingsKey(): string {
  const fromEnv = process.env.SETTINGS_SECRET?.trim()
  if (fromEnv) return fromEnv
  try {
    const m = readFileSync(join(ROOT, ".env.local"), "utf8").match(/^SETTINGS_SECRET=(.*)$/m)
    return m ? m[1].trim() : ""
  } catch {
    return ""
  }
}

async function siteDoor(init: RequestInit = {}): Promise<Response | { unavailable: string }> {
  const site = serviceUrl("root")
  if (!site) return { unavailable: "no-site-element" }
  const key = settingsKey()
  if (!key) return { unavailable: "no-settings-key" }
  try {
    return await fetch(`${site.replace(/\/+$/, "")}/api/settings/design`, {
      ...init,
      cache: "no-store",
      headers: { ...(init.headers ?? {}), "x-settings-key": key, "content-type": "application/json" },
    })
  } catch {
    return { unavailable: "site-not-answering" }
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const r = await siteDoor()
  if ("unavailable" in r) return NextResponse.json({ ok: false, reason: r.unavailable }, { status: 503 })
  const body = await r.json().catch(() => ({ ok: false, reason: "bad-answer" }))
  return NextResponse.json(body, { status: r.status, headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 })
  }
  const patch = (body as { patch?: unknown } | null)?.patch
  const r = await siteDoor({ method: "PATCH", body: JSON.stringify(patch ?? null) })
  if ("unavailable" in r) return NextResponse.json({ ok: false, reason: r.unavailable }, { status: 503 })
  const answer = (await r.json().catch(() => ({ ok: false }))) as { ok?: boolean }
  if (!r.ok || !answer.ok) return NextResponse.json(answer, { status: r.status || 500 })
  return NextResponse.json({ ...answer, deployNeeded: true })
}
