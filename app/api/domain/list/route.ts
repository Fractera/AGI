// @api list add recheck and remove the node's own domains
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { addDomain, checkDomain, createDomainZone, domainHolder, extraDomains, nodeKeyState, primaryDomain, removeDomain } from "@/lib/domain/node-domains"
import { detachDomain } from "@/lib/agi-items/element-domain"
import { addressOf } from "@/lib/agi-items/address-file.mjs"

// ДОМЕНЫ УЗЛА (324-1): «Хостинг → Домен» списком. GET — основной (из лестницы 259) и дополнительные с тем, к какому элементу
// каждый подключён; POST `{ name }` — добавить, POST `{ name, action: "create-zone" }` — узел создаёт зону сам (конвейер);
// PUT `{ name }` — замерить заново (зона, серверы имён у регистратора; совпали — запрос активации); DELETE `{ name }` — убрать
// из списка (подключённый к элементу — 409); DELETE `{ name, detach: true }` (373-1) — сначала отключить от элемента (поддомен
// снова ведёт на элемент), потом убрать из списка. Всё по кнопке человека. Ворота architect/admin; на временном адресе — отказ.

export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }

async function gate(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  return requireRoles(req, ROLES)
}

async function bodyOf(req: NextRequest): Promise<{ name: string; action: string; accountId?: string; detach: boolean }> {
  const body = (await req.json().catch(() => null)) as { name?: unknown; action?: unknown; accountId?: unknown; detach?: unknown } | null
  return {
    name: typeof body?.name === "string" ? body.name : "",
    action: typeof body?.action === "string" ? body.action : "",
    // 324-2: первый домен — Account ID, если ключ не назвал аккаунт сам.
    accountId: typeof body?.accountId === "string" && body.accountId.trim() ? body.accountId.trim().toLowerCase() : undefined,
    detach: body?.detach === true,
  }
}

export async function GET(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  // 373-1: человеку — адрес элемента (как в левом меню), а не его вечный id.
  const extra = extraDomains().map((d) => {
    const holder = domainHolder(d.name)
    return { ...d, holder, holderAddress: holder ? addressOf(holder) : null }
  })
  // 324-1: строка «Ключ узла» — свойство узла, приходит вместе со списком.
  return NextResponse.json({ ok: true, key: await nodeKeyState(), primary: primaryDomain(), extra }, noStore)
}

export async function POST(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const { name, action, accountId } = await bodyOf(req)
  const r = action === "create-zone" ? await createDomainZone(name, accountId) : await addDomain(name)
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}

export async function PUT(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const r = await checkDomain((await bodyOf(req)).name)
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}

export async function DELETE(req: NextRequest) {
  const g = await gate(req)
  if (g) return g
  const { name, detach } = await bodyOf(req)
  // 373-1 (владелец 2026-10-02: «добавить опцию удалить домен который должна вернуть работу проекта как субдомен»). Домен,
  // подключённый к элементу, снимается с него тем же `detachDomain`, что и кнопка «Отключить» на странице элемента: правила
  // туннеля узла, наши записи в зоне (если зона ещё видна ключу узла — чужую не трогаем), `domain.json`. Без `detach` — прежний 409.
  const holder = detach ? domainHolder(name) : null
  if (holder) {
    const off = await detachDomain(holder)
    if (!off.ok) return NextResponse.json(off, { status: 409, ...noStore })
  }
  const r = removeDomain(name)
  return NextResponse.json(r, { status: r.ok ? 200 : 409, ...noStore })
}
