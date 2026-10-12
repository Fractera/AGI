// Слова страниц «Документы» элемента (шаг 412-2).

import type { ElementDocIslandWords } from "@/components/element-docs/element-doc.client"
import type { PassportDoorWords } from "@/components/element-docs/passport-door.client"
import type { ElementOrdersWords } from "@/components/element-docs/element-orders.client"
import { tableUi } from "@/sections/table.i18n"

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

// Слова страницы «Связи (A2A) → Сделки» (шаг 412-6; 436-2 — прежде «Процесс → Заказы»; 442 — стандартная таблица узла).
// Колонки Lagrix названы словами глоссария Lagrix (lagrix-dev/lagrix README): price, fee 5%, escrow, receipt.
const ORDERS: Record<"en" | "ru", Omit<ElementOrdersWords, "table">> = {
  en: {
    loading: "Reading the deals…",
    failed: "Could not read the deals right now. Reload the page.",
    empty: "No deals yet: a summary appears here when the element closes work it did for another agent.",
    head: ["#", "Closed", "Direction", "Counterparty", "Skill", "Status", "Iterations", "Tags", "Price (USDC)", "Fee 5%", "Escrow", "Receipt", "Transaction", "Like", ""],
    incoming: "Incoming", outgoing: "Outgoing",
    open: "Open",
    lagrixNote: "Price, fee, escrow, receipt, transaction and like are filled when the element is connected to Lagrix; until then they show «—».",
    deal: "Deal",
    conversation: "The conversation behind this deal",
    conversationEmpty: "The node's log has no rows of this conversation.",
    conversationFailed: "Could not read the conversation from the node's log.",
  },
  ru: {
    loading: "Читаю сделки…",
    failed: "Не удалось прочитать сделки. Перезагрузите страницу.",
    empty: "Сделок пока нет: сводка появится здесь, когда элемент закроет работу, сделанную для другого агента.",
    head: ["№", "Закрыта", "Направление", "Контрагент", "Навык", "Статус", "Итерации", "Теги", "Цена (USDC)", "Комиссия 5%", "Эскроу", "Квитанция", "Транзакция", "Лайк", ""],
    incoming: "Входящие", outgoing: "Исходящие",
    open: "Открыть",
    lagrixNote: "Цена, комиссия, эскроу, квитанция, транзакция и лайк заполнятся, когда элемент подключится к Lagrix; до тех пор в них «—».",
    deal: "Сделка",
    conversation: "Беседа, из которой выросла эта сделка",
    conversationEmpty: "В журнале узла нет строк этой беседы.",
    conversationFailed: "Не удалось прочитать беседу из журнала узла.",
  },
}

export function elementOrdersUi(lang: string): ElementOrdersWords {
  return { ...(lang === "ru" ? ORDERS.ru : ORDERS.en), table: tableUi(lang === "ru" ? "ru" : "en") }
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
