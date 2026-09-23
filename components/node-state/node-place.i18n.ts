// СЛОВА ЭКРАНА «ГДЕ СТОИТ УЗЕЛ» — рядом с островком (276-3).
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ: островок получает уже выбранный язык пропсами, в браузер уезжает один набор
// строк. За этим следит `check:lang-delivery`.
//
// 🛑 СЛОВА ГОВОРЯТ ЧЕЛОВЕКУ ПРАВДУ О ПРИРОДЕ ЭТОГО ОТВЕТА: узел верит ему на слово и проверить не
// может. Без этой строки человек прочитает собственное объявление в индикаторе как измеренный факт.

export type NodePlaceWords = {
  loading: string
  doorSilent: string
  title: string
  currentHome: string
  currentServer: string
  currentUnknown: string
  chooseHome: string
  chooseServer: string
  /** «изменено {at}» */
  changedAt: string
  note: string
}

const DICT: Record<string, NodePlaceWords> = {
  en: {
    loading: "Asking the node…",
    doorSilent: "The node did not answer. This means «I do not know», not «nothing is set».",
    title: "Where does this node stand?",
    currentHome: "Now: a home computer. You choose which items to install, and you answer for that choice — an item runs with your own rights.",
    currentServer: "Now: a dedicated server. This is the place to invite other developers to, once items are walled off from each other.",
    currentUnknown: "Not stated yet. Nothing can measure this, so the node asks you.",
    chooseHome: "A home computer",
    chooseServer: "A dedicated server",
    changedAt: "changed {at}",
    note: "The node takes your word for it and cannot check it: a home machine and a server look the same from the inside. The answer only changes what the node tells you — it changes no locks and no rights.",
  },
  ru: {
    loading: "Спрашиваю узел…",
    doorSilent: "Узел не ответил. Это значит «не знаю», а не «ничего не задано».",
    title: "Где стоит этот узел?",
    currentHome: "Сейчас: домашний компьютер. Элементы вы выбираете сами и за выбор отвечаете сами — элемент работает с вашими правами.",
    currentServer: "Сейчас: выделенный сервер. Сюда можно приглашать чужих разработчиков, когда элементы будут отделены друг от друга стеной.",
    currentUnknown: "Пока не сказано. Измерить это нечем, поэтому узел спрашивает вас.",
    chooseHome: "Домашний компьютер",
    chooseServer: "Выделенный сервер",
    changedAt: "изменено {at}",
    note: "Узел верит вам на слово и проверить это не может: изнутри домашняя машина и сервер выглядят одинаково. Ответ меняет только то, что узел вам рассказывает, — он не меняет ни замков, ни прав.",
  },
}

export function nodePlaceWords(lang: string): NodePlaceWords {
  return DICT[lang] ?? DICT.en
}
