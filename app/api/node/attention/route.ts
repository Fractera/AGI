// @api list open element terminals and previews waiting for the architect
import { readFileSync } from "node:fs"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { addressOf } from "@/lib/agi-items/element-address"
import paths from "@/lib/agi-items/paths.cjs"
import previewLock from "@/lib/deploy/preview-lock.cjs"
import { list } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/session.cjs"
import { isBornItem } from "@/app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/workspace.cjs"

// ЧТО ЖДЁТ АРХИТЕКТОРА (узел, шаг 356-1). Слово владельца 2026-10-01: «если есть хотя бы один терминал или хотя бы одно развёртывание
// в шапке … пульсирующий оранжевый индикатор … внутри я вижу только те развёртывания которые сейчас завершены и требуют внимания или
// терминалы». Читает ящик «Мой аккаунт» ядра. Терминалы — та же карта сессий, что у `/api/agents/sessions` (только рождённые
// элементы); развёртывания — только ГОТОВЫЕ предпросмотры (сервер жив): собирающийся ещё не требует решения.
// Адреса — страницы ядра: терминал и «Развёртывания» элемента. Ворота architect/admin; на временном адресе — отказ.
export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const noStore = { headers: { "Cache-Control": "no-store" } }
type Session = { service: string; running?: boolean; startedAt?: string }
type Entry = { id: string; kind?: string; born?: unknown }

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en"
  const lang = /^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(langParam) ? langParam : "en"
  const page = (id: string, slug: string) => `/${lang}/architect/${addressOf(id)}/build/${slug}`

  const terminals = (list() as Session[])
    .filter((s) => s.running && isBornItem(s.service))
    .map((s) => ({ id: s.service, name: addressOf(s.service), href: page(s.service, "terminal") }))

  let entries: Entry[] = []
  try { entries = (JSON.parse(readFileSync(paths.REGISTRY_FILE, "utf8")) as { services: Entry[] }).services ?? [] } catch { /* реестра нет — пусто */ }
  const previews = entries
    .filter((e) => e.kind === "user" && e.born)
    .map((e) => ({ e, p: previewLock.pendingPreview(ROOT, e.id) as { state?: string; commit?: string } | null }))
    .filter(({ p }) => p?.state === "ready")
    .map(({ e, p }) => ({ id: e.id, name: addressOf(e.id), commit: p?.commit ?? null, href: page(e.id, "deployments") }))

  return NextResponse.json({ ok: true, terminals, previews }, noStore)
}

