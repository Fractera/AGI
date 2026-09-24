// @api list node elements with pending changes and start their deployment
import { spawn } from "node:child_process"
import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import paths from "@/lib/agi-items/paths.cjs"
import rollback from "@/lib/deploy/previous-version.cjs"

// ДАШБОРД РАЗВЁРТЫВАНИЙ — ДВЕРЬ (280-11b).
//
// 🔒 «ЕСТЬ НЕПРИМЕНЁННЫЕ ИЗМЕНЕНИЯ» ИЗМЕРЯЕТСЯ, А НЕ ПОМНИТСЯ: файл настроек элемента (его паспорт
// называет их в `settings.owns`) новее его последней сборки (`.install-stamp.json` → `at`). Сохранение в
// редакторе «Дизайн» пишет файл, сборка — отметку; сравнение двух времён и есть ответ.
//
// 🔒 ЯДРО — В СПИСКЕ, НО БЕЗ КНОПКИ. Его пересборка перезапускает тот самый сервер, что отдаёт эту дверь,
// и идёт в ту же папку с простоем; сборка ядра без простоя — отдельная работа.
//
// 🛑 ОДНО РАЗВЁРТЫВАНИЕ ЗА РАЗ: пока `logs/deploy-state.json` говорит `running`, второе получает 409.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const ROOT = process.cwd()
const STATE = join(ROOT, "logs", "deploy-state.json")

type Entry = { id: string; version?: string; port?: number; kind?: string }

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T
  } catch {
    return null
  }
}

function mtime(file: string): number | null {
  try {
    return statSync(file).mtimeMs
  } catch {
    return null
  }
}

function elements() {
  const registry = readJson<{ services?: Entry[] }>(paths.REGISTRY_FILE)
  return (registry?.services ?? []).map((s) => {
    const dir = paths.entryDir(s)
    const stamp = readJson<{ at?: string; version?: string }>(join(dir, ".install-stamp.json"))
    const passport = readJson<{ settings?: { owns?: string[] } }>(join(dir, "OWN-SERVICE-PROPS.json"))
    const owns = passport?.settings?.owns ?? []
    const builtAt = stamp?.at ?? null
    let settingsChangedAt: number | null = null
    for (const folder of owns) {
      const f = join(dir, folder)
      for (const name of existsSync(f) ? ["design-config.json", "app-config.json", "platform-config.json"] : []) {
        const m = mtime(join(f, name))
        if (m && (!settingsChangedAt || m > settingsChangedAt)) settingsChangedAt = m
      }
    }
    return {
      id: s.id,
      version: s.version ?? null,
      port: s.port ?? null,
      installed: !!stamp,
      builtAt,
      takesSettings: owns.length > 0,
      pending: !!(settingsChangedAt && builtAt && settingsChangedAt > Date.parse(builtAt)),
      settingsChangedAt: settingsChangedAt ? new Date(settingsChangedAt).toISOString() : null,
      // 287: предыдущая рабочая версия — для кнопки «Вернуть»; `source: git` — успех той версии не записан.
      previous: stamp ? rollback.previousVersion(s.id) : null,
    }
  })
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  return NextResponse.json(
    {
      ok: true,
      core: { commit: process.env.AGI_COMMIT ?? null, builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? null },
      elements: elements(),
      deployment: readJson(STATE),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(req: NextRequest) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const current = readJson<{ running?: boolean }>(STATE)
  if (current?.running) return NextResponse.json({ ok: false, reason: "already-running" }, { status: 409 })
  let body: { ids?: unknown; rollback?: unknown } = {}
  try {
    body = (await req.json()) as { ids?: unknown; rollback?: unknown }
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-json" }, { status: 400 })
  }
  const known = new Set(elements().filter((e) => e.installed).map((e) => e.id))
  // 287: откат — та же команда, что с машины (`npm run deploy:rollback -- <id>`), отдельным процессом.
  if (typeof body.rollback === "string") {
    if (!known.has(body.rollback)) return NextResponse.json({ ok: false, reason: "no-elements" }, { status: 400 })
    if (!rollback.previousVersion(body.rollback)) return NextResponse.json({ ok: false, reason: "no-previous" }, { status: 409 })
    const child = spawn(process.execPath, [join(ROOT, "scripts", "deploy-rollback.mjs"), body.rollback], {
      cwd: ROOT,
      detached: true,
      windowsHide: true,
      stdio: "ignore",
    })
    child.unref()
    return NextResponse.json({ ok: true, rollback: body.rollback })
  }
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string" && known.has(x)) : []
  if (ids.length === 0) return NextResponse.json({ ok: false, reason: "no-elements" }, { status: 400 })
  const child = spawn(process.execPath, [join(ROOT, "scripts", "deploy-elements.mjs"), ...ids], {
    cwd: ROOT,
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  })
  child.unref()
  return NextResponse.json({ ok: true, started: ids })
}
