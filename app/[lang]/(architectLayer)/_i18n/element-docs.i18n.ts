// Слова страниц «Документы» элемента (шаг 412-2).

import type { ElementDocIslandWords } from "@/components/element-docs/element-doc.client"
import type { PassportDoorWords } from "@/components/element-docs/passport-door.client"
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

// 417: паспорт элемента — кнопка генерации описания и ответ его двери, как его получает ядро.

const PASSPORT: Record<"en" | "ru", PassportDoorWords> = {
  en: {
    generate: "Generate description",
    generateLead: "Opens this element's terminal with the task: its agent reads its own code, writes the name, descriptions, what it accepts and returns, and search tags — and shows them to you before saving.",
    answerTitle: "What the door returns",
    answerLead: "The passport as the node core receives it: the file plus the fields the door computes. A stranger gets the same without the e-mail, the IP and the ties inside the node.",
    loading: "Asking the element…",
    failed: "The element did not answer — deploy it so the door is live",
  },
  ru: {
    generate: "Сгенерировать описание",
    generateLead: "Открывает терминал этого элемента с поручением: его агент читает свой код, пишет название, описания, что элемент принимает и возвращает, и теги для поиска — и показывает их вам до сохранения.",
    answerTitle: "Что отдаёт дверь",
    answerLead: "Паспорт таким, каким его получает ядро узла: файл плюс поля, которые дверь вычисляет. Посторонний получает то же без почты, IP и связей внутри узла.",
    loading: "Спрашиваю элемент…",
    failed: "Элемент не ответил — разверните его, чтобы дверь заработала",
  },
}

export function passportDoorUi(lang: string): PassportDoorWords {
  return lang === "ru" ? PASSPORT.ru : PASSPORT.en
}
