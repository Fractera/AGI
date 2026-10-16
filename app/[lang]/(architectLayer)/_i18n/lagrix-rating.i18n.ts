// Слова карточки «Репутация в сети Lagrix» на главной «Связи (A2A)» (шаг 436-3) и на Паспорте узла (478-1).
// 495-1: шесть показателей записей 43 и 44, строка отметки о доказанном нарушении; баланса нет.
// 495-5: подсказки к каждому показателю — две простые строки «число … / сумма …» (слово владельца: «Будь проще … Как-то так просто»);
// у карточки узла свои тексты — «этого узла, включая все его элементы» (владелец: «для узла и для элемента … один и тоже текст»).
// 511: «Сгорело» снято (шаг 500 решён); на его месте «Негативные оценки» — подсказка словами владельца: «показывает какой процент заказов
// этот узел или элемент оценивает как негативный опыт. Чем больше этих оценок тем выше вероятность того что этот партнёр и ваше
// сотрудничество оценит негативно».

import type { LagrixRatingWords } from "@/components/element-docs/lagrix-rating"

const DICT: Record<"en" | "ru", LagrixRatingWords> = {
  en: {
    eyebrow: "Lagrix",
    title: "Reputation in the Lagrix network",
    lead: "Every deal paid through the network adds to these indicators. They are never combined into one score: the counterparty reads them and decides.",
    orders: "All orders",
    likes: "Likes",
    dislikes: "Dislikes",
    negative: "Negative ratings",
    cancelled: "Cancelled orders",
    unreviewed: "Unreviewed",
    weightUnit: "count · weight, USDC",
    sumUnit: "count · sum of deals, USDC",
    percentUnit: "% of orders by weight · dislikes given: count · weight, USDC",
    violation: "Proven violation as a super-node",
    hints: {
      orders: ["the number of all orders of this element", "the sum of all orders of this element"],
      likes: ["the number of likes this element received", "their weight — the fee paid on those orders"],
      dislikes: ["the number of dislikes this element received", "their weight — the fee paid on those orders"],
      negative: ["what percentage of its orders this element rates as a negative experience", "the more of these ratings, the more likely it will rate your cooperation negatively too"],
      cancelled: ["the number of cancelled orders of this element", "the sum of those orders"],
      unreviewed: ["the number of orders where this element left no review", "the sum of those orders"],
      violation: ["whether the node this element belongs to has a proven violation as a super-node"],
    },
    hint: "What it means",
    toggle: "Show or hide",
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
    negative: "Негативные оценки",
    cancelled: "Отменённые заказы",
    unreviewed: "Без отзыва",
    weightUnit: "число · вес, USDC",
    sumUnit: "число · сумма сделок, USDC",
    percentUnit: "% заказов по весу · поставленные дизлайки: число · вес, USDC",
    violation: "Доказанное нарушение в роли супер-узла",
    hints: {
      orders: ["число всех заказов этого элемента", "сумма всех заказов этого элемента"],
      likes: ["число лайков, которые получил этот элемент", "их вес — комиссия, уплаченная по этим заказам"],
      dislikes: ["число дизлайков, которые получил этот элемент", "их вес — комиссия, уплаченная по этим заказам"],
      negative: ["какой процент заказов этот элемент оценивает как негативный опыт", "чем больше этих оценок, тем выше вероятность, что и ваше сотрудничество он оценит негативно"],
      cancelled: ["число отменённых заказов этого элемента", "сумма этих заказов"],
      unreviewed: ["число заказов, по которым этот элемент не оставил отзыв", "сумма этих заказов"],
      violation: ["есть ли у узла этого элемента доказанное нарушение в роли супер-узла"],
    },
    hint: "Что это значит",
    toggle: "Показать или свернуть",
    empty: "—",
    note: "Показатели появятся, когда элемент подключится к Lagrix.",
  },
}

const NODE_HINTS: Record<"en" | "ru", LagrixRatingWords["hints"]> = {
  en: {
    orders: ["the total number of orders of this node, including all its elements", "the sum of all orders of this node, including all its elements"],
    likes: ["the total number of likes of all elements of this node", "their total weight — the fee paid on those orders"],
    dislikes: ["the total number of dislikes of all elements of this node", "their total weight — the fee paid on those orders"],
    negative: ["what percentage of orders this node, including all its elements, rates as a negative experience", "the more of these ratings, the more likely it will rate your cooperation negatively too"],
    cancelled: ["the total number of cancelled orders of all elements of this node", "their total sum"],
    unreviewed: ["the total number of orders where the elements of this node left no review", "their total sum"],
    violation: ["whether this node has a proven violation as a super-node"],
  },
  ru: {
    orders: ["общее число заказов этого узла, включая все его элементы", "сумма всех заказов этого узла, включая все его элементы"],
    likes: ["общее число лайков всех элементов этого узла", "их общий вес — комиссия, уплаченная по этим заказам"],
    dislikes: ["общее число дизлайков всех элементов этого узла", "их общий вес — комиссия, уплаченная по этим заказам"],
    negative: ["какой процент заказов этот узел, включая все его элементы, оценивает как негативный опыт", "чем больше этих оценок, тем выше вероятность, что и ваше сотрудничество он оценит негативно"],
    cancelled: ["общее число отменённых заказов всех элементов этого узла", "их общая сумма"],
    unreviewed: ["общее число заказов, по которым элементы этого узла не оставили отзыв", "их общая сумма"],
    violation: ["есть ли у этого узла доказанное нарушение в роли супер-узла"],
  },
}

/** Hints of the node's card on the passport (495-5). */
export function lagrixNodeHints(lang: string): LagrixRatingWords["hints"] {
  return lang === "ru" ? NODE_HINTS.ru : NODE_HINTS.en
}

export function lagrixRatingUi(lang: string): LagrixRatingWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
