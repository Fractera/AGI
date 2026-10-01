// @api tell how far this node's fork is behind the original
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"

// ОТСТАВАНИЕ ФОРКА УЗЛА ОТ ОРИГИНАЛА (шаг 368). Источник — отметка `logs/origin.json`, которую пишет `scripts/check-origin.mjs` при
// сборке и запуске (сравнение веток GitHub). Дверь в сеть не ходит: работающий узел не зависит от оригинала. Узел автора и форк,
// который не отстаёт, — `behindBy: 0` (плашки нет).

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  let rec: { verdict?: string; url?: string; version?: { behindBy?: number; checkedAt?: string } } = {}
  try { rec = JSON.parse(readFileSync(join(process.cwd(), "logs", "origin.json"), "utf8")) } catch { /* проверки ещё не было */ }
  const behindBy = rec.verdict === "fork" ? Number(rec.version?.behindBy) || 0 : 0
  const repo = typeof rec.url === "string" ? rec.url.replace(/\.git$/, "") : null
  return NextResponse.json({ ok: true, behindBy, repo, checkedAt: rec.version?.checkedAt ?? null }, { headers: { "Cache-Control": "no-store" } })
}
