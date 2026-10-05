import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { nodeZone } from "@/lib/agi-items/drafts"
import { answerOf, questionOf } from "@/lib/a2a/call-text"

// ВЫЗОВЫ A2A — В TELEGRAM УЧАСТНИКОВ И ЯДРА (шаг 408-5; владелец 2026-10-05: «если ты видишь активный Telegram то
// одновременно с этим пробрасывать туда сообщения … максимум три телеграмм канала … Добавляются ещё и Telegram ядра … текст
// сообщений должен начинаться со идентификатора агента например: Roman.aifa.dev пишет: бла-бла-бла»).
//
// Бот службы — `data/services/<id>/channel/telegram/` (`.env` с `TELEGRAM_BOT_TOKEN`, `access.json` с `allowFrom`), бот ядра —
// служба `build`. «Подключён» = есть токен И хотя бы один допущенный: одно определение для реестра, визитки и рассылки.
// Отправка `sendMessage` опросу плагина каналов (`getUpdates`) не мешает. Отказ Telegram не ломает журнал.

export const CORE_BOT = "build"
const MAX = 1000

const stateDir = (service: string) => join(process.cwd(), "data", "services", service, "channel", "telegram")

function token(service: string): string {
  try {
    const line = readFileSync(join(stateDir(service), ".env"), "utf8").split(/\r?\n/).find((l) => l.startsWith("TELEGRAM_BOT_TOKEN="))
    return line ? line.slice("TELEGRAM_BOT_TOKEN=".length).trim() : ""
  } catch {
    return ""
  }
}

function allowed(service: string): string[] {
  try {
    const a = JSON.parse(readFileSync(join(stateDir(service), "access.json"), "utf8")) as { allowFrom?: unknown }
    return Array.isArray(a.allowFrom) ? a.allowFrom.map(String) : []
  } catch {
    return []
  }
}

/** Подключён ли Telegram у службы: токен и хотя бы один допущенный. */
export function telegramConnected(service: string): boolean {
  if (!/^[a-z0-9-]+$/i.test(service) || !existsSync(stateDir(service))) return false
  return Boolean(token(service)) && allowed(service).length > 0
}

export type RelayCall = {
  fromId: string | null; fromAddress: string; toId: string | null; toAddress: string
  skill?: string | null; state?: string | null; httpStatus?: number | null; reason?: string | null; durationMs?: number | null
  request: string | null; response: string | null
}

const WORDS = {
  en: { writes: "writes", refused: "refused", ms: "ms" },
  ru: { writes: "пишет", refused: "отказ", ms: "мс" },
}

const named = (address: string) => {
  const zone = nodeZone()
  return zone && !address.includes(".") ? `${address}.${zone}` : address
}

const cut = (t: string) => (t.length > MAX ? `${t.slice(0, MAX)}…` : t)

/** Тексты двух сообщений вызова — вопрос вызывающего и ответ принимающего. */
export function relayTexts(call: RelayCall, lang: "en" | "ru"): [string, string] {
  const w = WORDS[lang]
  const q = questionOf(call.request, MAX)
  const a = answerOf(call.response, MAX)
  const refused = call.httpStatus != null && call.httpStatus >= 400
  const head = [call.skill ? `[${call.skill}]` : "", refused ? `${w.refused} ${call.httpStatus}${call.reason ? ` · ${call.reason}` : ""}` : call.state ?? "",
    call.durationMs != null ? `${call.durationMs} ${w.ms}` : ""].filter(Boolean).join(" · ")
  return [
    cut(`${named(call.fromAddress)} ${w.writes}: ${call.skill ? `[${call.skill}] ` : ""}${q}`),
    cut(`${named(call.toAddress)} ${w.writes}: ${head ? `(${head}) ` : ""}${a}`),
  ]
}

/** Разослать вызов: боты вызывающего, принимающего и ядра — у кого подключён; одна пара (бот, чат) — один раз. */
export async function relayCall(call: RelayCall, lang: "en" | "ru"): Promise<{ sent: number; skipped: string[] }> {
  const services = [...new Set([call.fromId, call.toId, CORE_BOT].filter((s): s is string => Boolean(s)))]
  const texts = relayTexts(call, lang)
  const seen = new Set<string>()
  const skipped: string[] = []
  let sent = 0
  for (const s of services) {
    if (!telegramConnected(s)) { skipped.push(s); continue }
    const t = token(s)
    for (const chat of allowed(s)) {
      const key = `${t}:${chat}`
      if (seen.has(key)) continue
      seen.add(key)
      for (const text of texts) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${t}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
            signal: AbortSignal.timeout(10_000),
          })
          if (res.ok) sent++
        } catch { /* Telegram недоступен — журнал уже записан */ }
      }
    }
  }
  return { sent, skipped }
}
