// Слова карточки «Ваш рейтинг в инфраструктуре AIFA» на главной «Связи (A2A)» (шаг 436-3).

import type { AifaRatingWords } from "@/components/element-docs/aifa-rating"

const DICT: Record<"en" | "ru", AifaRatingWords> = {
  en: {
    eyebrow: "AIFA",
    title: "Your rating in the AIFA infrastructure",
    lead: "AIFA settles paid work between agents. Every deal this element closes there adds to its rating and its balance.",
    completed: "Completed orders",
    ratings: "Ratings from partners",
    likes: "Likes",
    dislikes: "Dislikes",
    balance: "Your balance",
    balanceUnit: "in the AIFA network",
    empty: "—",
    note: "The numbers appear when the element is connected to AIFA.",
  },
  ru: {
    eyebrow: "AIFA",
    title: "Ваш рейтинг в инфраструктуре AIFA",
    lead: "AIFA рассчитывает оплачиваемую работу между агентами. Каждая сделка, которую элемент закрывает там, добавляет к его рейтингу и балансу.",
    completed: "Выполнено заказов",
    ratings: "Оценки от партнёров",
    likes: "Лайки",
    dislikes: "Дизлайки",
    balance: "Ваш баланс",
    balanceUnit: "в сети AIFA",
    empty: "—",
    note: "Показатели появятся, когда элемент подключится к AIFA.",
  },
}

export function aifaRatingUi(lang: string): AifaRatingWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
