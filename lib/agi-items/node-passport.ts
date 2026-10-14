import "server-only"

import { projectRows } from "@/lib/agi-items/dashboard-rows"
import { registryDescription, TASK as DESCRIBE_TASK } from "@/lib/agi-items/element-describe"
import { addressOf } from "@/lib/agi-items/address-file.mjs"
import { listServices } from "@/lib/microservices/registry"
import { terminalLink } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs"

// КАРТОЧКИ ЭЛЕМЕНТОВ «ПАСПОРТА» УЗЛА (478-1). Слово владельца 2026-10-14: «для каждого элемента покажи его название, и …
// описание которое отображает первые несколько строк, чтобы оно раскрывалось как аккордеон … если описание ещё не существует …
// красную кнопку сгенерировать описание … на самой карточке слева отрисовать красную точку».
//
// 🔒 «ОПИСАНИЕ ЕСТЬ» = В РЕЕСТРЕ СТОИТ `described`: её ставит только «Забрать в ядро» (325) после проверки, что текст не шаблонный.
// Начало описания до этого — короткое описание из паспорта элемента или мета его главной (как в «Проектах»), полный текст — из реестра.
// 🔒 КНОПКА ВЕДЁТ В УЖЕ РАБОТАЮЩУЮ ГЕНЕРАЦИЮ (выбор владельца 2026-10-14: «Вести в генерацию»): терминал элемента с задачей
// `TASK` из `element-describe`, та же ссылка, что в «Настройках». Новой генерации нет.
// 🛑 Репутация элемента (исполнитель и заказчик, вес лайков и дизлайков) — источника нет, пока нет сети Lagrix: `null` = «не знаю».

export type PassportCard = {
  id: string
  custom: boolean
  name: string
  /** Начало описания: описание из реестра, иначе короткое из паспорта элемента или мета главной. */
  lead: string | null
  /** Полный текст описания и что элемент даёт — только когда описание забрано в ядро. */
  summary: string | null
  provides: string[]
  described: boolean
  /** Страница элемента в ядре, без языка. */
  open: string
  /** Терминал элемента с задачей «опиши себя»; у нерождённого черновика — `null`. */
  generate: string | null
  reputation: null
}

export async function passportCards(lang: string): Promise<PassportCard[]> {
  const born = new Set(listServices().map((s) => s.id))
  const rows = await projectRows(lang)
  return rows.map((r) => {
    const d = registryDescription(r.id)
    const slug = addressOf(r.id)
    return {
      id: r.id,
      custom: r.custom,
      name: slug,
      lead: d?.summary ?? r.description,
      summary: d?.summary ?? null,
      provides: d?.provides ?? [],
      described: d !== null,
      open: r.open,
      generate: born.has(r.id) ? terminalLink({ lang, service: `${slug}/build`, text: DESCRIBE_TASK }) : null,
      reputation: null,
    }
  })
}
