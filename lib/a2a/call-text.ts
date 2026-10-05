// ЧТО СПРОСИЛИ И ЧТО ОТВЕТИЛИ — из записи журнала A2A (шаг 408). Одна функция на ленту ядра и на Telegram: показанное в
// двух местах обязано совпадать. Запрос — тело JSON-RPC `SendMessage` (вход навыка из части `data` или текст); ответ —
// результат задачи, текст её отказа или ошибка протокола.

const MAX_TEXT = 1500

type J = Record<string, unknown>
const obj = (v: unknown): J => (v && typeof v === "object" ? (v as J) : {})
const partsOf = (v: unknown): J[] => (Array.isArray(v) ? (v as J[]) : [])
const texts = (parts: J[]) => parts.map((p) => p.text).filter((t): t is string => typeof t === "string").join("\n")

function parse(text: string | null): unknown {
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

export function clip(v: unknown, max = MAX_TEXT): string {
  const t = typeof v === "string" ? v : JSON.stringify(v, null, 2) ?? ""
  return t.length > max ? `${t.slice(0, max)}…` : t
}

export function questionOf(request: string | null, max = MAX_TEXT): string {
  const raw = parse(request)
  if (typeof raw === "string") return clip(raw, max)
  const parts = partsOf(obj(obj(obj(raw).params).message).parts)
  const call = parts.map((p) => obj(p.data)).find((d) => typeof d.skill === "string")
  if (call) return clip(call.input ?? {}, max)
  const text = texts(parts)
  if (text) return clip(text, max)
  const params = obj(raw).params
  return params ? clip(params, max) : ""
}

export function answerOf(response: string | null, max = MAX_TEXT): string {
  const body = obj(parse(response))
  const err = obj(body.error)
  if (typeof err.message === "string") return clip(err.message, max)
  const result = obj(body.result)
  const task = obj(result.task ?? result)
  const failText = texts(partsOf(obj(obj(task.status).message).parts))
  if (failText) return clip(failText, max)
  const parts = partsOf(task.artifacts).flatMap((a) => partsOf(a.parts))
  if (parts.length) return clip(parts.map((p) => (p.text !== undefined ? String(p.text) : clip(p.data, max))).join("\n"), max)
  return Object.keys(body).length ? clip(body, max) : ""
}
