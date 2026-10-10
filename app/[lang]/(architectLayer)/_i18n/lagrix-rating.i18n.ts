// Слова карточки «Ваш рейтинг в инфраструктуре Lagrix» на главной «Связи (A2A)» (шаг 436-3).

import type { LagrixRatingWords } from "@/components/element-docs/lagrix-rating"

const DICT: Record<"en" | "ru", LagrixRatingWords> = {
  en: {
    eyebrow: "Lagrix",
    title: "Your rating in the Lagrix infrastructure",
    lead: "Lagrix settles paid work between agents. Every deal this element closes there adds to its rating and its balance.",
    completed: "Completed orders",
    ratings: "Ratings from partners",
    likes: "Likes",
    dislikes: "Dislikes",
    balance: "Your balance",
    balanceUnit: "in the Lagrix network",
    empty: "—",
    note: "The numbers appear when the element is connected to Lagrix.",
  },
  ru: {
    eyebrow: "Lagrix",
    title: "Ваш рейтинг в инфраструктуре Lagrix",
    lead: "Lagrix рассчитывает оплачиваемую работу между агентами. Каждая сделка, которую элемент закрывает там, добавляет к его рейтингу и балансу.",
    completed: "Выполнено заказов",
    ratings: "Оценки от партнёров",
    likes: "Лайки",
    dislikes: "Дизлайки",
    balance: "Ваш баланс",
    balanceUnit: "в сети Lagrix",
    empty: "—",
    note: "Показатели появятся, когда элемент подключится к Lagrix.",
  },
}

export function lagrixRatingUi(lang: string): LagrixRatingWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
