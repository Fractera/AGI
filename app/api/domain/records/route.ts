// @api add mail-service DNS records to the node's own Cloudflare zone, never overwriting
import { NextRequest, NextResponse } from "next/server"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { addMailRecord, listZones, type MailRecord } from "@/lib/domain/cloudflare"

// ЗАПИСИ DNS ДЛЯ ПОЧТЫ — В ЗОНУ УЗЛА В CLOUDFLARE (266-4).
//
// Слово владельца 2026-09-22: «если мы находимся в режиме локального компьютера
// то у нас есть API который сам запишет необходимые dns записи в Cloudflare…
// И когда пользователь здесь их введёт ты нажмёшь кнопку отправить записи на
// Cloudflare».
//
// 🔒 ПРИЗНАК «УЗЕЛ МОЖЕТ ПИСАТЬ В ЗОНУ» ИЗМЕРЯЕТСЯ, А НЕ ОБЪЯВЛЯЕТСЯ: есть токен
// и есть зона, подключённая лестницей домена. Это и решает, какой из двух
// аккордеонов экрана открыт, пока индикатора режима нет (`AUTH-DEBT.md`).
//
// 🛑 ТЕ ЖЕ ЗАМКИ, ЧТО У ДВЕРЕЙ ПРОВАЙДЕРОВ: роль архитектора и отказ на временном
// адресе — это запись в живую зону человека.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const KEY_NAME = "CLOUDFLARE_API_TOKEN"
const ROLES = ["architect", "admin"] as const
const TYPES = new Set(["TXT", "CNAME", "MX"])

const fail = (reason: string, status = 400) => NextResponse.json({ ok: false, reason }, { status })

// Тот же чтец, что в соседних дверях домена: ключ живёт в `.env.local` узла.
function envValue(name: string): string | null {
  for (const file of [".env.local", ".env"]) {
    const p = join(ROOT, file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && m[1] === name && m[2].trim()) return m[2].trim()
    }
  }
  return process.env[name]?.trim() || null
}

function zoneName(): string | null {
  const p = join(ROOT, "logs", "domain.json")
  if (!existsSync(p)) return null
  try {
    const d = JSON.parse(readFileSync(p, "utf8")) as { zone?: unknown }
    return typeof d.zone === "string" && d.zone ? d.zone : null
  } catch {
    return null
  }
}

async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (isTemporaryPublicAddress(req)) return fail("temporary-address", 403)
  return requireRoles(req, ROLES)
}

export async function GET(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied
  const zone = zoneName()
  return NextResponse.json({ ok: true, cloudflare: !!envValue(KEY_NAME) && !!zone, zone })
}

export async function POST(req: NextRequest) {
  const denied = await guard(req)
  if (denied) return denied

  const token = envValue(KEY_NAME)
  const zone = zoneName()
  if (!token || !zone) return fail("no-cloudflare-zone", 409)

  let records: MailRecord[] = []
  try {
    const body = (await req.json()) as { records?: unknown }
    if (!Array.isArray(body.records)) return fail("bad-request")
    records = body.records.map((r) => {
      const x = r as Record<string, unknown>
      return {
        type: String(x.type ?? "").toUpperCase() as MailRecord["type"],
        name: String(x.name ?? "").trim(),
        content: String(x.content ?? "").trim(),
        priority: typeof x.priority === "number" ? x.priority : undefined,
      }
    })
  } catch {
    return fail("bad-request")
  }
  if (records.length === 0 || records.length > 10) return fail("bad-request")
  if (records.some((r) => !TYPES.has(r.type) || !r.name || !r.content)) return fail("row-incomplete")

  const zones = await listZones(token)
  if (!zones.ok) return fail(zones.reason, 502)
  const hit = zones.result.find((z) => z.name.toLowerCase() === zone.toLowerCase())
  if (!hit) return fail("zone-not-visible", 409)

  // По одной и по порядку: у Cloudflare есть предел частоты, а ответ по каждой
  // строке человек должен увидеть отдельно.
  const results = []
  for (const r of records) results.push(await addMailRecord(token, hit.id, zone, r))
  return NextResponse.json({ ok: results.every((r) => r.outcome !== "failed"), results })
}
