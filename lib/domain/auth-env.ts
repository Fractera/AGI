import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { authEnvOverrides } from "./public-auth.cjs"
import { restartService } from "./resident"

// ОКРУЖЕНИЕ СЛУЖБЫ ВХОДА ПЕРЕВОДИТСЯ НА ДОМЕН ТОЙ ЖЕ КНОПКОЙ (259-8).
//
// 🛑 ФАЙЛОВ ДВА, И ЭТО НЕ ПРИДИРКА. Служба запускается из standalone-сборки, а
// Next кладёт туда СВОЮ КОПИЮ `.env.local` на сборке и читает при старте именно
// её. Правка одного исходника не изменила бы ничего до следующей сборки — и
// выглядела бы как «настройка не применилась».
//
// 🔒 ПРАВЯТСЯ ТОЛЬКО ЧЕТЫРЕ ИМЕНИ, остальное (секреты, база) не трогается: файл
// порождён установщиком, и та же формула стоит в нём (`public-auth.cjs`), так что
// переустановка даст те же значения, а не петлю.

const ROOT = process.cwd()

function authFiles(): string[] {
  const dir = join(ROOT, "microservices", "auth")
  const files = [join(dir, ".env.local")]
  try {
    const stamp = JSON.parse(readFileSync(join(dir, ".install-stamp.json"), "utf8")) as {
      start?: { args?: string[]; cwd?: string }
    }
    const server = stamp.start?.args?.[0]
    if (server) files.push(join(stamp.start?.cwd || dir, dirname(server), ".env.local"))
  } catch { /* службы нет — ниже честное «нечего править» */ }
  return files.filter((f) => existsSync(f))
}

function patch(file: string, values: Record<string, string>) {
  let text = readFileSync(file, "utf8")
  for (const [name, value] of Object.entries(values)) {
    const re = new RegExp(`^${name}=.*$`, "m")
    text = re.test(text)
      ? text.replace(re, `${name}=${value}`)
      : `${text}${text.endsWith("\n") ? "" : "\n"}${name}=${value}\n`
  }
  writeFileSync(file, text, "utf8")
}

function currentOrigins(file: string): string[] {
  const m = readFileSync(file, "utf8").match(/^ALLOWED_ORIGINS=(.*)$/m)
  return m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : []
}

export type AuthEnvResult = { files: number; restarted: boolean; reason?: string }

/** Перевести службу входа на `auth.<зона>` и перезапустить её. */
export function applyDomainToAuth(): AuthEnvResult {
  const files = authFiles()
  if (files.length === 0) return { files: 0, restarted: false, reason: "auth-not-installed" }
  const overrides = authEnvOverrides(ROOT, currentOrigins(files[0]).filter((o) => o.startsWith("http://127.0.0.1")))
  if (!overrides) return { files: 0, restarted: false, reason: "domain-not-routed" }
  for (const f of files) patch(f, overrides)
  return { files: files.length, restarted: restartService("fractera-svc-auth") }
}
