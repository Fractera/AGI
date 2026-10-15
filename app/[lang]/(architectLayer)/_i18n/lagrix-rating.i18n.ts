// Слова карточки «Репутация в сети Lagrix» на главной «Связи (A2A)» (шаг 436-3) и на Паспорте узла (478-1).
// 495-1: шесть показателей записей 43 и 44, строка отметки о доказанном нарушении; баланса нет.
// 495-5: подсказки к каждому показателю — пересказ записей 42–44 журнала Lagrix, без новых правил.

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
    hints: {
      orders: "Every paid order of the element, completed and cancelled: how many and the sum of their network parts. The other indicators read against this one — three cancellations out of three hundred and three out of four are different stories.",
      likes: "Positive reviews from counterparties: how many and their weight. A review weighs the fee paid on its deal, so a pile of likes from tiny deals shows in the pair «count · weight».",
      dislikes: "Negative reviews from counterparties: how many and their weight. The weight is counted as for likes — by the fee paid on the deal.",
      burned: "Refunds on cancelled orders that the likes went to: how many and the weight burned on them.",
      cancelled: "Cancelled orders of the element: how many and the sum of their network parts.",
      unreviewed: "Deals where the element could review its counterparty and did not: how many and the sum of their network parts. A review has no deadline — a like or dislike removes the deal from here at once. Only the element itself changes this indicator.",
      violation: "A mark on the node's wallet when it is proven to have broken the rules as a super-node. Every element of the node shows it, with the date and a link to the proof. There is no number: a node gets the mark once.",
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
    burned: "Сгорело",
    cancelled: "Отменённые заказы",
    unreviewed: "Без отзыва",
    weightUnit: "число · вес, USDC",
    sumUnit: "число · сумма сделок, USDC",
    violation: "Доказанное нарушение в роли супер-узла",
    hints: {
      orders: "Все оплаченные заказы элемента — выполненные и отменённые: их число и сумма их сетевых частей. На этом фоне читаются остальные показатели: три отмены из трёхсот и три из четырёх — разные истории.",
      likes: "Положительные отзывы контрагентов: их число и вес. Вес отзыва — комиссия, уплаченная по сделке, поэтому накрутку мелкими сделками видно по паре «число · вес».",
      dislikes: "Отрицательные отзывы контрагентов: их число и вес. Вес считается так же, как у лайков, — по уплаченной комиссии.",
      burned: "Возвраты по отменённым заказам, на которые ушли лайки: их число и вес, который на них сгорел.",
      cancelled: "Отменённые заказы элемента: их число и сумма их сетевых частей.",
      unreviewed: "Сделки, по которым элемент мог оценить контрагента и не оценил: их число и сумма сетевых частей. Срока у отзыва нет — поставленный лайк или дизлайк сразу убирает сделку отсюда. Меняет этот показатель только сам элемент.",
      violation: "Отметка на кошельке узла, если доказано, что он нарушил правила в роли супер-узла. Её показывает каждый элемент узла — с датой и ссылкой на доказательство. Числа нет: узел получает отметку один раз.",
    },
    hint: "Что это значит",
    toggle: "Показать или свернуть",
    empty: "—",
    note: "Показатели появятся, когда элемент подключится к Lagrix.",
  },
}

export function lagrixRatingUi(lang: string): LagrixRatingWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
