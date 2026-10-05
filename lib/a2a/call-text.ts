// ЧТО СПРОСИЛИ И ЧТО ОТВЕТИЛИ — из записи журнала A2A (шаги 408, 408-6). Одни функции на ленту ядра и на Telegram: показанное
// в двух местах обязано совпадать.
//   • `humanQuestionOf` / `humanAnswerOf` — фраза для человека: текстовые части сообщения (по языку `metadata.lang`, A2A
//     `Part.metadata`), отказ протокола — фраза по `reason`; текста нет — запасная фраза «вызывает навык X», а не пустота.
//   • `questionOf` / `answerOf` — данные: вход навыка и части `data` ответа; лента показывает их свёрнутыми, Telegram — вложением.

const MAX_TEXT = 1500

export type Lang = "en" | "ru"
type J = Record<string, unknown>
const obj = (v: unknown): J => (v && typeof v === "object" ? (v as J) : {})
const partsOf = (v: unknown): J[] => (Array.isArray(v) ? (v as J[]) : [])

function parse(text: string | null): unknown {
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

export function clip(v: unknown, max = MAX_TEXT): string {
  const t = typeof v === "string" ? v : JSON.stringify(v, null, 2) ?? ""
  return t.length > max ? `${t.slice(0, max)}…` : t
}

/** Текст частей на нужном языке; частей с этим языком нет — любые текстовые; нет и их — пусто. */
function textIn(parts: J[], lang: Lang): string {
  const all = parts.filter((p) => typeof p.text === "string" && (p.text as string).trim())
  const mine = all.filter((p) => obj(p.metadata).lang === lang)
  const untagged = all.filter((p) => !obj(p.metadata).lang)
  const pick = mine.length ? mine : untagged.length ? untagged : all.slice(0, 1)
  return pick.map((p) => String(p.text).trim()).join("\n")
}

const requestParts = (request: string | null) => partsOf(obj(obj(obj(parse(request)).params).message).parts)
const callOf = (parts: J[]) => parts.map((p) => obj(p.data)).find((d) => typeof d.skill === "string")

function taskOf(response: string | null) {
  const body = obj(parse(response))
  const result = obj(body.result)
  return { body, err: obj(body.error), task: obj(result.task ?? result) }
}

const REASONS: Record<string, Record<Lang, string>> = {
  UNAUTHENTICATED: { en: "Refused: the call came without the node key.", ru: "Отказ: вызов пришёл без ключа узла." },
  NOT_VISIBLE_OUTSIDE_NODE: { en: "Refused: this element serves only its own node.", ru: "Отказ: этот элемент работает только внутри своего узла." },
  VERSION_NOT_SUPPORTED: { en: "Refused: the caller speaks another version of A2A (1.0 is needed).", ru: "Отказ: вызывающий говорит на другой версии A2A (нужна 1.0)." },
  JSON_PARSE: { en: "Refused: the message is not valid JSON.", ru: "Отказ: сообщение — не JSON." },
  INVALID_PARAMS: { en: "Refused: the message has no skill to call.", ru: "Отказ: в сообщении не названо, какой навык вызвать." },
  INVALID_REQUEST: { en: "Refused: this is not a JSON-RPC request.", ru: "Отказ: это не запрос JSON-RPC." },
  METHOD_NOT_FOUND: { en: "Refused: no such method.", ru: "Отказ: такого метода нет." },
  UNSUPPORTED_OPERATION: { en: "Refused: this element does not do that over A2A.", ru: "Отказ: по A2A этот элемент такого не делает." },
  UNIT_NOT_FOUND: { en: "There is no such unit in the catalogue.", ru: "Такой единицы в каталоге нет." },
  CONTRIBUTION_REFUSED: { en: "The contribution is not accepted:", ru: "Вклад не принят:" },
  TASK_NOT_FOUND: { en: "No such task.", ru: "Такой задачи нет." },
}

/** Вопрос словами (часть `text`), а не вызов навыка: в Telegram — «спрашивает: «…»», иначе — «вызывает навык …». */
export function isTextQuestion(request: string | null): boolean {
  return requestParts(request).some((p) => typeof p.text === "string" && (p.text as string).trim() !== "")
}

export function humanQuestionOf(request: string | null, lang: Lang): string {
  const raw = parse(request)
  if (typeof raw === "string") return lang === "ru" ? "Прислал не-JSON." : "Sent something that is not JSON."
  const parts = requestParts(request)
  const text = textIn(parts, lang)
  if (text) return clip(text, 600)
  const call = callOf(parts)
  const input = call ? JSON.stringify(call.input ?? {}) : ""
  const short = input.length > 160 ? `${input.slice(0, 160)}…` : input
  if (call) return lang === "ru" ? `Вызывает навык ${call.skill}${short && short !== "{}" ? `: ${short}` : ""}` : `Calls skill ${call.skill}${short && short !== "{}" ? `: ${short}` : ""}`
  const method = String(obj(raw).method ?? "")
  return method ? (lang === "ru" ? `Вызывает ${method}` : `Calls ${method}`) : ""
}

export function humanAnswerOf(response: string | null, lang: Lang, reason?: string | null): string {
  const { body, err, task } = taskOf(response)
  if (typeof err.message === "string") {
    const known = REASONS[reason ?? ""]?.[lang]
    if (!known) return clip(err.message, 600)
    return reason === "CONTRIBUTION_REFUSED" ? `${known} ${err.message}` : known
  }
  const failText = textIn(partsOf(obj(obj(task.status).message).parts), lang)
  if (failText) return clip(failText, 600)
  const text = textIn(partsOf(task.artifacts).flatMap((a) => partsOf(a.parts)), lang)
  if (text) return clip(text, 600)
  return Object.keys(body).length ? (lang === "ru" ? "Ответил данными." : "Answered with data.") : ""
}

/** Тема беседы (408-7): `metadata.title` сообщения — её даёт вызывающий в первом сообщении; нет — пусто. */
export function titleOf(request: string | null): string {
  const t = obj(obj(obj(obj(parse(request)).params).message).metadata).title
  return typeof t === "string" ? t.trim().slice(0, 120) : ""
}

/** Данные вопроса: вход навыка (или то, что пришло вместо него). */
export function questionOf(request: string | null, max = MAX_TEXT): string {
  const raw = parse(request)
  if (typeof raw === "string") return clip(raw, max)
  const call = callOf(requestParts(request))
  if (call) return clip(call.input ?? {}, max)
  const params = obj(raw).params
  return params ? clip(params, max) : ""
}

/** Данные ответа: части `data` артефактов; ошибка — её тело. */
export function answerOf(response: string | null, max = MAX_TEXT): string {
  const { body, err, task } = taskOf(response)
  if (Object.keys(err).length) return clip(err, max)
  const data = partsOf(task.artifacts).flatMap((a) => partsOf(a.parts)).filter((p) => p.data !== undefined).map((p) => p.data)
  if (data.length) return clip(data.length === 1 ? data[0] : data, max)
  return Object.keys(body).length ? clip(body, max) : ""
}
