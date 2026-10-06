// Слова страниц «Документы» элемента (шаг 412-2).

import type { ElementDocIslandWords } from "@/components/element-docs/element-doc.client"
import type { ElementOrdersWords } from "@/components/element-docs/element-orders.client"

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

// Слова страницы «Процесс → Заказы» (шаг 412-6).
const ORDERS: Record<"en" | "ru", ElementOrdersWords> = {
  en: {
    loading: "Reading the orders…",
    failed: "Could not read the orders right now. Reload the page.",
    empty: "No orders yet: a summary appears here when the element closes work it did for another agent.",
    closed: "Closed", status: "Status", from: "Customer", kind: "Kind", tags: "Tags", iterations: "Iterations",
    conversation: "The conversation behind this order",
    conversationEmpty: "The node's log has no rows of this conversation.",
    conversationFailed: "Could not read the conversation from the node's log.",
  },
  ru: {
    loading: "Читаю заказы…",
    failed: "Не удалось прочитать заказы. Перезагрузите страницу.",
    empty: "Заказов пока нет: сводка появится здесь, когда элемент закроет работу, сделанную для другого агента.",
    closed: "Закрыт", status: "Статус", from: "Заказчик", kind: "Вид", tags: "Теги", iterations: "Итерации",
    conversation: "Беседа, из которой вырос этот заказ",
    conversationEmpty: "В журнале узла нет строк этой беседы.",
    conversationFailed: "Не удалось прочитать беседу из журнала узла.",
  },
}

export function elementOrdersUi(lang: string): ElementOrdersWords {
  return lang === "ru" ? ORDERS.ru : ORDERS.en
}
