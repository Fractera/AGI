import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { nodeZone } from "@/lib/agi-items/drafts"
import { humanAnswerOf, humanQuestionOf, isTextQuestion, type Lang } from "@/lib/a2a/call-text"

// ВЫЗОВЫ A2A — В TELEGRAM УЧАСТНИКОВ И ЯДРА (шаг 408-5; владелец 2026-10-05: «если ты видишь активный Telegram то
// одновременно с этим пробрасывать туда сообщения … максимум три телеграмм канала … Добавляются ещё и Telegram ядра … текст
// сообщений должен начинаться со идентификатора агента например: Roman.aifa.dev пишет: бла-бла-бла»).
//
// Бот службы — `data/services/<id>/channel/telegram/` (`.env` с `TELEGRAM_BOT_TOKEN`, `access.json` с `allowFrom`), бот ядра —
// служба `build`. «Подключён» = есть токен И хотя бы один допущенный: одно определение для реестра, визитки и рассылки.
// Отправка опросу плагина каналов (`getUpdates`) не мешает. Отказ Telegram не ломает журнал.
// 408-6: сообщение = фраза для человека (вложение `.json` снято владельцем 2026-10-05 — только текст). Язык — бота: его системные сообщения
// (`messages.json`) записаны на языке страницы, где человек его подключал; кириллица → ru, иначе en.

export const CORE_BOT = "build"
const CAPTION = 1024 // предел подписи Telegram

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

/**
 * Язык человека этого бота (411): `person.json` папки бота (пишет комплект агента — страница подключения или свой агент); нет
 * файла — прежняя догадка по кириллице системных текстов. Код BCP 47 (`ru`, `uk`, `zh`).
 */
export function personLang(service: string): string {
  try {
    const p = JSON.parse(readFileSync(join(stateDir(service), "person.json"), "utf8")) as { lang?: unknown }
    if (typeof p.lang === "string" && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/.test(p.lang)) return p.lang
  } catch { /* нет файла */ }
  try {
    return /[а-яё]/i.test(readFileSync(join(stateDir(service), "messages.json"), "utf8")) ? "ru" : "en"
  } catch {
    return "en"
  }
}

/** Язык встроенных фраз (en/ru); прочие языки — переводом (411-3). */
function botLang(service: string): Lang {
  return personLang(service).split("-")[0] === "ru" ? "ru" : "en"
}

export type RelayCall = {
  fromId: string | null; fromAddress: string; toId: string | null; toAddress: string
  method?: string | null; skill?: string | null; state?: string | null; httpStatus?: number | null; reason?: string | null; durationMs?: number | null
  request: string | null; response: string | null
}

// Владелец 2026-10-05 (образец «Агенту roman пришёл вопрос от агента gyr1i»): кто кому — глаголом: спрашивает / отвечает.
const ASKS: Record<Lang, string> = { en: "asks", ru: "спрашивает" }
const ANSWERS: Record<Lang, string> = { en: "answers", ru: "отвечает" }
const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1)

const named = (address: string) => {
  const zone = nodeZone()
  return zone && !address.includes(".") ? `${address}.${zone}` : address
}

const cut = (t: string) => (t.length > CAPTION ? `${t.slice(0, CAPTION - 1)}…` : t)

/** Два сообщения вызова — вопрос вызывающего и ответ принимающего: только текст для человека. */
export function relayMessages(call: RelayCall, lang: Lang) {
  // 🪦 409-2 «при TaskResult — только ответ» снято 2026-10-05: вопрос больше не шлётся при постановке задачи.
  // 🪦 Вложение `.json` (408-6) снято владельцем 2026-10-05: «Сейчас в Telegram ты дублирующий Джейсон но человеком не дает
  // никакой ценности. Оставь его для внутреннего взаимодействия … возвращают просто текст». Тело вызова — в журнале и ленте.
  const q = humanQuestionOf(call.request, lang)
  const askLine = isTextQuestion(call.request) ? `${named(call.fromAddress)} ${ASKS[lang]}: «${q}»` : `${named(call.fromAddress)} ${lowerFirst(q)}`
  const ask = { caption: cut(askLine), file: null, name: "question.json" }
  const answer = { caption: cut(`${named(call.toAddress)} ${ANSWERS[lang]}: ${humanAnswerOf(call.response, lang, call.reason)}`), file: null, name: "answer.json" }
  // Владелец 2026-10-05: сначала вопрос «запустить терминал?», и только после «Запустить» — сообщения разговора. Поэтому
  // задача агенту приходит в Telegram парой «вопрос + ответ» при `TaskResult`, а не при постановке (см. `relayCall`).
  return [ask, answer]
}

async function send(token: string, chat: string, m: { caption: string; file: string | null; name: string }): Promise<boolean> {
  try {
    if (!m.file) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: m.caption, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(10_000),
      })
      return res.ok
    }
    const form = new FormData()
    form.append("chat_id", chat)
    form.append("caption", m.caption)
    form.append("document", new Blob([m.file], { type: "application/json" }), m.name)
    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: "POST", body: form, signal: AbortSignal.timeout(15_000) })
    return res.ok
  } catch {
    return false
  }
}

/** Разослать вызов: боты вызывающего, принимающего и ядра — у кого подключён; одна пара (бот, чат) — один раз. */
export async function relayCall(call: RelayCall): Promise<{ sent: number; skipped: string[] }> {
  const services = [...new Set([call.fromId, call.toId, CORE_BOT].filter((s): s is string => Boolean(s)))]
  const seen = new Set<string>()
  const skipped: string[] = []
  let sent = 0
  // Постановка задачи агенту (`SendMessage` без навыка → SUBMITTED/WORKING): в журнал и ленту — да, в Telegram — нет; разговор
  // придёт парой, когда агент ответит (`TaskResult`).
  if (call.method === "SendMessage" && (call.state === "TASK_STATE_SUBMITTED" || call.state === "TASK_STATE_WORKING")) return { sent, skipped: ["agent-task-pending"] }
  for (const s of services) {
    if (!telegramConnected(s)) { skipped.push(s); continue }
    const t = token(s)
    const messages = relayMessages(call, botLang(s))
    for (const chat of allowed(s)) {
      const key = `${t}:${chat}`
      if (seen.has(key)) continue
      seen.add(key)
      for (const m of messages) if (await send(t, chat, m)) sent++
    }
  }
  return { sent, skipped }
}
