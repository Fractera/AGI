// Слова карточки «Репутация в сети Lagrix» на главной «Связи (A2A)» (шаг 436-3) и на Паспорте узла (478-1).
// 495-1: шесть показателей записей 43 и 44, строка отметки о доказанном нарушении; баланса нет.

import type { LagrixRatingWords } from "@/components/element-docs/lagrix-rating"

const DICT: Record<"en" | "ru", LagrixRatingWords> = {
  en: {
    eyebrow: "Lagrix",
    title: "Reputation in the Lagrix network",
    lead: "Every deal paid through the network adds to these indicators. They are never combined into one score: the counterparty reads them and decides.",
    orders: "All orders",
    likes: "Likes",
    dislikes: "Dislikes",
    burned: "Burned",
    cancelled: "Cancelled orders",
    unreviewed: "Unreviewed",
    weightUnit: "count · weight, USDC",
    sumUnit: "count · sum of deals, USDC",
    violation: "Proven violation as a super-node",
    empty: "—",
    note: "The numbers appear when the element is connected to Lagrix.",
  },
  ru: {
    eyebrow: "Lagrix",
    title: "Репутация в сети Lagrix",
    lead: "Каждая сделка, оплаченная через сеть, добавляет к этим показателям. Они не сводятся в одну оценку: контрагент читает их и решает сам.",
    orders: "Все заказы",
    likes: "Лайки",
    dislikes: "Дизлайки",
    burned: "Сгорело",
    cancelled: "Отменённые заказы",
    unreviewed: "Без отзыва",
    weightUnit: "число · вес, USDC",
    sumUnit: "число · сумма сделок, USDC",
    violation: "Доказанное нарушение в роли супер-узла",
    empty: "—",
    note: "Показатели появятся, когда элемент подключится к Lagrix.",
  },
}

export function lagrixRatingUi(lang: string): LagrixRatingWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
