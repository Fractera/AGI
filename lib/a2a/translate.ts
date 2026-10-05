import { openAiKeyFor } from "@/lib/env-file"

// ПЕРЕВОД РЕПЛИК РАЗГОВОРА АГЕНТОВ НА ЯЗЫК ЧЕЛОВЕКА (шаг 411-3; владелец 2026-10-06: «если м2м агент напишет на английском или
// на китайском я бы не хотел видеть это в свою чате на английском для китайском»). Только то, что уходит в Telegram; журнал и
// лента хранят оригинал. Ключ — ключ OpenAI ядра (`openAiKeyFor`), модель — `gpt-5-mini` (сверена с живым списком ключа, roman
// `app/api/i18n/translate/route.ts`). Нет ключа или ответа — `null`: вызывающий показывает оригинал.

const MODEL = "gpt-5-mini"
const API = "https://api.openai.com/v1/chat/completions"

/**
 * Явно на языке человека — без обращения к модели (дёшево и без расхода ключа на обычный случай): русский — кириллица без
 * украинских букв; украинский — есть і/ї/є/ґ; английский — только латиница и знаки. Прочее решает модель.
 */
export function clearlyIn(text: string, lang: string): boolean {
  const base = lang.split("-")[0]
  if (base === "ru") return /[а-яё]/i.test(text) && !/[іїєґ]/i.test(text)
  if (base === "uk") return /[іїєґ]/i.test(text)
  if (base === "en") return !/[^\x00-\x7F«»—–…‘’“”]/.test(text)
  return false
}

export type Translated = { same: true } | { same: false; text: string; note: string }

/** Перевести текст на язык `lang` (BCP 47); `{ same: true }` — уже на нём; `null` — перевести не вышло. */
export async function translateTo(text: string, lang: string, hint = ""): Promise<Translated | null> {
  const key = openAiKeyFor()
  if (!key || !text.trim()) return null
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `If the text is already in the language with BCP 47 code «${lang}», return {"same":true}. Otherwise translate it into that language and return {"same":false,"text":"<translation>","note":"<a short note in the target language meaning \"translated from <original language>\", e.g. for ru: \"перевод с китайского\", for en: \"translated from Chinese\">"}. Keep web addresses, names and codes (like en, ru) as they are; translate all words, number words included. Return only JSON.${hint ? ` Context: ${hint}` : ""}` },
          { role: "user", content: text },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.ok) return null
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const out = JSON.parse(body.choices?.[0]?.message?.content ?? "null") as Translated | null
    if (!out || typeof out !== "object") return null
    if (out.same) return { same: true }
    return typeof out.text === "string" && out.text.trim() ? { same: false, text: out.text, note: String(out.note ?? "") } : null
  } catch {
    return null
  }
}
