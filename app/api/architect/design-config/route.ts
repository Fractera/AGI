// @api read and change the site element's design settings from the core
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { serviceUrl } from "@/lib/microservices/registry"
import paths from "@/lib/agi-items/paths.cjs"

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
// 🔒 ОДНО ОФОРМЛЕНИЕ НА ВСЕ ЭЛЕМЕНТЫ (280-10, слово владельца 2026-09-24): «любой сервис который приходит
// в платформу получает настройки через нашу панель». Читается оформление САЙТА (элемент root — основной),
// а правка пишется в КАЖДЫЙ элемент, чей паспорт объявляет `settings.door` (сайт, вход, данные, любой
// следующий). Элемент без двери не трогается и живёт со своим оформлением.
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

/** Элементы узла, объявившие дверь настроек, — из реестра и их паспортов. */
function settingsElements(): { id: string; door: string }[] {
  let registry: { services?: { id: string; kind?: string }[] } = {}
  try {
    registry = JSON.parse(readFileSync(paths.REGISTRY_FILE, "utf8"))
  } catch {
    return []
  }
  const out: { id: string; door: string }[] = []
  for (const s of registry.services ?? []) {
    try {
      const passport = JSON.parse(readFileSync(join(paths.entryDir(s), "OWN-SERVICE-PROPS.json"), "utf8")) as { settings?: { door?: string } }
      if (passport.settings?.door) out.push({ id: s.id, door: passport.settings.door })
    } catch { /* не установлен */ }
  }
  return out
}

async function siteDoor(init: RequestInit = {}, id = "root", door = "/api/settings/design"): Promise<Response | { unavailable: string }> {
  const site = serviceUrl(id)
  if (!site) return { unavailable: "no-site-element" }
  const key = settingsKey()
  if (!key) return { unavailable: "no-settings-key" }
  try {
    return await fetch(`${site.replace(/\/+$/, "")}${door}`, {
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
  const elements = settingsElements()
  const results: { id: string; ok: boolean; reason?: string }[] = []
  let rootAnswer: Record<string, unknown> | null = null
  for (const el of elements) {
    const r = await siteDoor({ method: "PATCH", body: JSON.stringify(patch ?? null) }, el.id, el.door)
    if ("unavailable" in r) { results.push({ id: el.id, ok: false, reason: r.unavailable }); continue }
    const answer = (await r.json().catch(() => ({ ok: false }))) as Record<string, unknown>
    results.push({ id: el.id, ok: r.ok && answer.ok === true, reason: r.ok ? undefined : String(r.status) })
    if (el.id === "root") rootAnswer = answer
  }
  const root = results.find((x) => x.id === "root")
  if (!root?.ok) return NextResponse.json({ ok: false, reason: root?.reason ?? "no-site-element", elements: results }, { status: 503 })
  return NextResponse.json({ ...(rootAnswer ?? {}), ok: true, elements: results, deployNeeded: true })
}
