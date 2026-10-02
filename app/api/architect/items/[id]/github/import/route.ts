// @api replace an element's code from another GitHub repository
import { spawnSync } from "node:child_process"
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { elementDir, parseRepo } from "@/lib/agi-items/element-github"
import { checkAccess } from "@/app/[lang]/(architectLayer)/architect/build/github/_github/server/github.cjs"
import { SHAPE } from "@/app/[lang]/(architectLayer)/architect/build/github/_github/server/token.cjs"

// ИМПОРТ НА МЕСТО ЭЛЕМЕНТА (шаг 374-6). Слово владельца 2026-10-02: «Приехал новый встал на место старого»; свой ключ элемента —
// «возможность подключить сюда другой источник и его ключ и начать работать с ним»; старая история — архив в прежнем репозитории.
// POST `{ repo, token }`: ключ проверяется у GitHub (виден ли репозиторий), прежний ключ элемента сохраняется как `.env.previous`
// (им выгружается архив), новый становится ключом элемента; работа — `scripts/element-import.mjs` вне дерева ядра. GET — ход.
// 🔒 Без прежнего репозитория — отказ ДО любых изменений: прежняя история пропала бы.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const ROLES = ["architect", "admin"] as const
const noStore = { headers: { "Cache-Control": "no-store" } }
const ghDir = (id: string) => join(ROOT, "data", "services", id, "github")

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  try { return NextResponse.json({ ok: true, ...JSON.parse(readFileSync(join(ROOT, "data", "services", id, "import.json"), "utf8")) }, noStore) }
  catch { return NextResponse.json({ ok: true, state: "none" }, noStore) }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const { id } = await params
  if (!elementDir(id)) return NextResponse.json({ ok: false, error: "no-folder" }, { status: 404, ...noStore })
  const body = (await req.json().catch(() => null)) as { repo?: unknown; token?: unknown } | null
  const where = parseRepo(String(body?.repo ?? ""))
  const token = String(body?.token ?? "").trim()
  if (!where) return NextResponse.json({ ok: false, error: "bad-repo" }, { status: 400, ...noStore })
  if (!SHAPE.test(token)) return NextResponse.json({ ok: false, error: "bad-token-shape" }, { status: 400, ...noStore })
  let previous: string | null = null
  try { previous = (JSON.parse(readFileSync(join(ghDir(id), "state.json"), "utf8")) as { repo?: string }).repo ?? null } catch { /* нет */ }
  if (!previous) return NextResponse.json({ ok: false, error: "archive-first" }, { status: 409, ...noStore })
  if (previous === `${where.owner}/${where.repo}`) return NextResponse.json({ ok: false, error: "same-repo" }, { status: 409, ...noStore })
  const access = await checkAccess(token, where.owner, where.repo)
  if (!access.ok) return NextResponse.json({ ok: false, error: access.error ?? "github-refused" }, { status: 409, ...noStore })
  if (!access.canRead) return NextResponse.json({ ok: false, error: "repo-not-visible" }, { status: 409, ...noStore })
  mkdirSync(ghDir(id), { recursive: true })
  const own = join(ghDir(id), ".env")
  if (existsSync(own)) copyFileSync(own, join(ghDir(id), ".env.previous"))
  writeFileSync(own, `GITHUB_TOKEN=${token}\n`, { mode: 0o600 })
  try { chmodSync(own, 0o600) } catch { /* Windows: права даёт профиль пользователя */ }
  writeFileSync(join(ROOT, "data", "services", id, "import.json"), JSON.stringify({ state: "starting", target: `${where.owner}/${where.repo}`, at: new Date().toISOString() }, null, 2) + "\n", "utf8")
  spawnSync(process.execPath, [join(ROOT, "scripts", "spawn-free.mjs"), join(ROOT, "scripts", "element-import.mjs"), id, `${where.owner}/${where.repo}`], {
    cwd: ROOT, windowsHide: true, stdio: "ignore", timeout: 10_000,
  })
  return NextResponse.json({ ok: true, state: "starting", previous }, noStore)
}
