// @api create the named tunnel and the DNS record, then remember what happened
import { NextResponse, type NextRequest } from "next/server"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import {
  accountOfZone, createTunnel, listZones, setIngress, tunnelToken, upsertTunnelRecord,
} from "@/lib/domain/cloudflare"

// ДВЕРЬ АКТИВАЦИИ ДОМЕНА (259-3).
//
// 🔒 ПЯТЬ ДЕЙСТВИЙ ПО ПОРЯДКУ, И КАЖДОЕ МОЖЕТ ОТКАЗАТЬ ОТДЕЛЬНО: найти зону →
// узнать её учётную запись → создать туннель → взять его токен → задать правила
// входа и завести запись DNS. Общий ответ «не получилось» здесь был бы тупиком:
// лечение у каждого отказа своё.
//
// 🔒 АДРЕС УЗЛА СПРАШИВАЕТСЯ У НЕГО САМОГО (`logs/runtime.json`). Порт назначается
// при запуске и меняется; код, помнящий порт, в день смены стучится в пустоту.
//
// 🛑 ТОКЕН ЗАПУСКА ТУННЕЛЯ — ВТОРОЙ СЕКРЕТ, И ОН НЕ ВОЗВРАЩАЕТСЯ НАРУЖУ. Он
// ложится в `.env.local` рядом с ключом API; в ответе его нет.
//
// 🔒 ЧТО ВЫШЛО — ЗАПИСЫВАЕТСЯ В `logs/domain.json`, ОТКУДА ЧИТАЕТ ДВЕРЬ СОСТОЯНИЯ.
// Островок ничего не помнит сам: перезагрузи страницу — и он спросит заново.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const ENV_FILE = join(ROOT, ".env.local")
const STATE_FILE = join(ROOT, "logs", "domain.json")
const KEY_NAME = "CLOUDFLARE_API_TOKEN"
const RUN_TOKEN = "CLOUDFLARE_TUNNEL_TOKEN"

function envValue(name: string): string | null {
  const fromProcess = process.env[name]?.trim()
  if (fromProcess) return fromProcess
  if (!existsSync(ENV_FILE)) return null
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && m[1] === name && m[2].trim()) return m[2].trim()
  }
  return null
}

function putEnv(name: string, value: string) {
  const existing = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : ""
  const re = new RegExp(`^${name}=.*$`, "m")
  const text = re.test(existing)
    ? existing.replace(re, `${name}=${value}`)
    : `${existing}${existing.endsWith("\n") || existing === "" ? "" : "\n"}${name}=${value}\n`
  writeFileSync(ENV_FILE, text, "utf8")
}

function nodeService(): string {
  try {
    const rt = JSON.parse(readFileSync(join(ROOT, "logs", "runtime.json"), "utf8")) as { port?: number }
    if (typeof rt.port === "number") return `http://localhost:${rt.port}`
  } catch { /* узел не сказал — ниже честный отказ */ }
  return ""
}

const fail = (reason: string, status = 400) => NextResponse.json({ ok: false, reason }, { status })

export async function POST(req: NextRequest) {
  if (isTemporaryPublicAddress(req) || !isOwnerAtMachine(req)) return fail("not-owner", 403)

  const key = envValue(KEY_NAME)
  if (!key) return fail("no-key")

  let hostname = ""
  try {
    const body = (await req.json()) as { hostname?: unknown }
    hostname = typeof body.hostname === "string" ? body.hostname.trim().toLowerCase() : ""
  } catch { return fail("bad-request") }
  if (!hostname || !hostname.includes(".")) return fail("bad-hostname")

  const service = nodeService()
  if (!service) return fail("node-port-unknown")

  // Зона выбирается по САМОМУ ДЛИННОМУ совпадению с хвостом имени: у человека
  // может быть и `example.com`, и `sub.example.com` — короткое совпало бы первым.
  const zones = await listZones(key)
  if (!zones.ok) return fail(zones.reason)
  const zone = zones.result
    .filter((z) => hostname === z.name || hostname.endsWith(`.${z.name}`))
    .sort((a, b) => b.name.length - a.name.length)[0]
  if (!zone) return fail("zone-not-found")
  if (zone.status !== "active") return fail(`zone-${zone.status}`)

  const account = await accountOfZone(key, zone.id)
  if (!account.ok) return fail(account.reason)

  const name = `fractera-${hostname.replace(/[^a-z0-9]+/g, "-")}`
  const tunnel = await createTunnel(key, account.result, name)
  if (!tunnel.ok) return fail(tunnel.reason)

  const runToken = await tunnelToken(key, account.result, tunnel.result)
  if (!runToken.ok) return fail(runToken.reason)

  const ingress = await setIngress(key, account.result, tunnel.result, hostname, service)
  if (!ingress.ok) return fail(ingress.reason)

  const record = await upsertTunnelRecord(key, zone.id, hostname, tunnel.result)
  if (!record.ok) return fail(record.reason)

  putEnv(RUN_TOKEN, runToken.result)
  process.env[RUN_TOKEN] = runToken.result

  mkdirSync(join(ROOT, "logs"), { recursive: true })
  writeFileSync(STATE_FILE, `${JSON.stringify({
    zone: zone.name,
    zoneStatus: zone.status,
    tunnelName: name,
    tunnelId: tunnel.result,
    hostname,
    service,
    activatedAt: new Date().toISOString(),
  }, null, 2)}\n`, "utf8")

  return NextResponse.json({ ok: true, hostname, zone: zone.name, tunnel: name })
}
