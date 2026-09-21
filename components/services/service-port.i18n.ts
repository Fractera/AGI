// СЛОВА ОСТРОВКА, ПОКАЗЫВАЮЩЕГО ПОРТ СЛУЖБЫ — рядом с самим островком (264-1).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. `_data` несёт слова СТРАНИЦЫ —
// заголовок, вступление и темы. Островок переиспользуемый: тот же вопрос «на
// каком порту живёт этот блок» встанет у раздела «Данные» и у любого следующего
// сменного блока. Приём тот же, что у лестницы домена и слов cookie-баннера.
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ. Островок получает уже выбранный язык пропсами — в браузер
// уезжает один набор строк, а не словарь; за этим следит `check:lang-delivery`.

export type ServicePortWords = {
  /** пока ответ двери не пришёл */
  loading: string
  /** «служба такая-то живёт на порту» — `{port}` подставляется */
  onPort: string
  /** блока нет в составе узла */
  absent: string
  /** блок в составе, но порт ещё не назначен — установка не выполнена */
  notInstalled: string
  /** дверь не ответила: сказать честно, а не подставить правдоподобное число */
  unknown: string
  /** одна фраза о том, почему число спрашивается, а не написано */
  note: string
}

const DICT: Record<string, ServicePortWords> = {
  en: {
    loading: "Asking the node…",
    onPort: "Your sign-in service lives on port {port}.",
    absent: "This node carries no sign-in service yet.",
    notInstalled: "The sign-in service is part of this node, but it has not been installed yet — no port is assigned.",
    unknown: "The node did not answer just now, so the port is unknown. Nothing is guessed here: a plausible number would read as a checked fact.",
    note: "The number is asked of the node on every visit, never remembered: the installer may hand the block a different port, and a remembered one would knock at an empty door.",
  },
  ru: {
    loading: "Спрашиваю узел…",
    onPort: "Ваша служба входа живёт на порту {port}.",
    absent: "В составе этого узла службы входа пока нет.",
    notInstalled: "Служба входа входит в состав узла, но ещё не установлена — порт ей не назначен.",
    unknown: "Узел сейчас не ответил, и порт неизвестен. Правдоподобное число здесь не подставляется: его читают как проверенный факт.",
    note: "Число спрашивается у узла при каждом заходе и никогда не помнится: установщик может назначить блоку другой порт, а запомненный стучался бы в пустоту.",
  },
}

/** Слова островка на выбранном языке; незнакомый язык честно деградирует до английского. */
export function servicePortWords(lang: string): ServicePortWords {
  return DICT[lang] ?? DICT.en
}
