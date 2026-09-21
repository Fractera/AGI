// @api state of the own-domain connection: what is done and what is next
import { NextResponse } from "next/server"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

// ДВЕРЬ СОСТОЯНИЯ ПОДКЛЮЧЕНИЯ СВОЕГО ДОМЕНА (259-1).
//
// 🔒 ЛЕСТНИЦА НЕ ХРАНИТ СВОЁ СОСТОЯНИЕ — ОНА ЕГО СПРАШИВАЕТ. Островок, помнящий,
// «до какого шага дошёл человек», врёт при первом же открытии с другого
// устройства и после перезапуска. Источник один: то, что реально есть на машине.
//
// 🛑 КЛЮЧ ОТСЮДА НЕ ВОЗВРАЩАЕТСЯ НИКОГДА. Наружу идёт только «настроен» и хвост
// из четырёх знаков — по нему человек узнаёт свой ключ, не раскрывая его.
// Показанный секрет считается раскрытым; это закон образца из службы памяти.
//
// 🔒 АДРЕС УЗЛА СПРАШИВАЕТСЯ У САМОГО УЗЛА (`logs/runtime.json`), а не помнится:
// порт назначается при запуске и меняется.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const KEY_NAME = "CLOUDFLARE_API_TOKEN"

function envValue(name: string): string | null {
  for (const file of [".env.local", ".env"]) {
    const p = join(ROOT, file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && m[1] === name) {
        const v = m[2].trim()
        if (v) return v
      }
    }
  }
  const fromProcess = process.env[name]?.trim()
  return fromProcess ? fromProcess : null
}

function readJson(rel: string): Record<string, unknown> | null {
  const p = join(ROOT, rel)
  if (!existsSync(p)) return null
  try { return JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown> } catch { return null }
}

export async function GET() {
  const key = envValue(KEY_NAME)
  const runtime = readJson("logs/runtime.json") ?? {}
  const domain = readJson("logs/domain.json") ?? {}
  // Быстрый туннель ведёт СВОЙ файл состояния — спрашиваем его, а не выдумываем
  // поле в чужом. Измерено 259-1: в logs/runtime.json адреса нет вовсе.
  const quick = readJson("logs/tunnel.json") ?? {}

  const port = typeof runtime.port === "number" ? runtime.port : null

  return NextResponse.json({
    // Ступени 1-3 человек делает вне узла; проверить их можно только ключом,
    // поэтому их «сделанность» выводится из того, что ключ работает.
    keyConfigured: !!key,
    keyTail: key ? key.slice(-4) : null,
    zone: typeof domain.zone === "string" ? domain.zone : null,
    zoneStatus: typeof domain.zoneStatus === "string" ? domain.zoneStatus : null,
    tunnel: typeof domain.tunnelName === "string" ? domain.tunnelName : null,
    hostname: typeof domain.hostname === "string" ? domain.hostname : null,
    nodeUrl: port ? `http://localhost:${port}` : null,
    quickTunnel: quick.dead === true || typeof quick.url !== "string" ? null : quick.url,
  })
}
