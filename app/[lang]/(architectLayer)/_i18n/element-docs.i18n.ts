// Слова страниц «Документы» элемента (шаг 412-2).

import type { ElementDocIslandWords } from "@/components/element-docs/element-doc.client"

const DICT: Record<"en" | "ru", ElementDocIslandWords> = {
  en: {
    loading: "Reading the document…",
    failed: "Could not read the document right now. Reload the page.",
    empty: "Nothing here yet: the agent adds a file when a step is planned or closed.",
  },
  ru: {
    loading: "Читаю документ…",
    failed: "Не удалось прочитать документ. Перезагрузите страницу.",
    empty: "Пока пусто: агент добавит файл, когда шаг будет запланирован или закрыт.",
  },
}

export function elementDocsUi(lang: string): ElementDocIslandWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
