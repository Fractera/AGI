// @api list and stop the live Claude Code terminals of born AGI elements
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { addressOf } from "@/lib/agi-items/element-address"
import { list, stop } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/session.cjs"
import { isBornItem } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/workspace.cjs"

// ОТКРЫТЫЕ ТЕРМИНАЛЫ ЭЛЕМЕНТОВ (узел, шаг 345; черновик 267-5). Слово владельца 2026-09-30: «создать индикатор активных открытых
// Cloud Code терминалов … только тогда я смогу их закрыть … отслеживают только те терминалы которые создаются через наш новый
// стартовый шаблон». Поэтому в списке — только рождённые элементы (`isBornItem`), терминалы встроенных разделов ядра не видны.
//
// Источник — одна карта сессий в процессе ядра (`_agent-kit/server/session.cjs`, `globalThis.__agiTerminalSessions`): все копии
// комплекта пишут в неё, поэтому любой копией её можно прочесть. Процесс ядра умер — умерли и терминалы (они его дети;
// замерено 2026-09-30 после пересборки ядра): сирот, которых список не видит, нет.
//
// GET — `{ sessions: [{ id, name, since, channel }] }`; POST `{ id, action: "stop" }` — закрыть терминал элемента. Только
// architect/admin; на временном публичном адресе — отказ.
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

type Session = { service: string; running: boolean; startedAt?: string; channel?: boolean }

async function guard(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const sessions = (list() as Session[])
    .filter((s) => s.running && isBornItem(s.service))
    .map((s) => ({ id: s.service, name: addressOf(s.service), since: s.startedAt ?? null, channel: Boolean(s.channel) }))
    .sort((a, b) => String(a.since).localeCompare(String(b.since)))
  return NextResponse.json({ ok: true, sessions }, noStore)
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const body = (await req.json().catch(() => null)) as { id?: unknown; action?: unknown } | null
  const id = typeof body?.id === "string" ? body.id : ""
  if (body?.action !== "stop") return NextResponse.json({ ok: false, reason: "unknown-action" }, { status: 400 })
  if (!isBornItem(id)) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  return NextResponse.json(stop(id, "stopped"), noStore)
}
