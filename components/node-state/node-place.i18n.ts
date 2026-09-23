// СЛОВА ЭКРАНА «ГДЕ РАЗМЕЩЁН ПРОЕКТ» — рядом с островком (276-3; человеческим языком — 276-6).
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ: островок получает уже выбранный язык пропсами, в браузер уезжает один набор
// строк. За этим следит `check:lang-delivery`.
//
// 🛑 СЛОВА ГОВОРЯТ ЧЕЛОВЕКУ ПРАВДУ О ПРИРОДЕ ЭТОГО ОТВЕТА: проект верит ему на слово и проверить не
// может. Без этой строки человек прочитает собственный выбор в индикаторе как измеренный факт.
// 🛑 Язык — «проект», «размещён», «изоляция» (слово владельца 2026-09-23): «узел» и «стена» — жаргон.

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
    loading: "Checking the project…",
    doorSilent: "The project did not answer. This means «unknown», not «nothing is set».",
    title: "Where is your project hosted?",
    currentHome: "Now: a local computer. You choose the apps yourself and answer for that choice — an app runs with your own rights.",
    currentServer: "Now: a dedicated server. This is the place to invite other developers to, once apps are isolated in containers.",
    currentUnknown: "Not stated yet. This cannot be measured, so the project asks you.",
    chooseHome: "Local computer",
    chooseServer: "Dedicated server",
    changedAt: "changed {at}",
    note: "The project takes your word for it and cannot check it: from the inside a local computer and a server look the same. The answer only changes what the project shows you — it changes no access rights.",
  },
  ru: {
    loading: "Проверяю проект…",
    doorSilent: "Проект не ответил. Это значит «неизвестно», а не «ничего не задано».",
    title: "Где размещён ваш проект?",
    currentHome: "Сейчас: локальный компьютер. Приложения вы выбираете сами и за выбор отвечаете сами — приложение работает с вашими правами.",
    currentServer: "Сейчас: выделенный сервер. Сюда можно приглашать других разработчиков, когда приложения будут изолированы в контейнерах.",
    currentUnknown: "Пока не указано. Измерить это нельзя, поэтому проект спрашивает вас.",
    chooseHome: "Локальный компьютер",
    chooseServer: "Выделенный сервер",
    changedAt: "изменено {at}",
    note: "Проект верит вам на слово и проверить это не может: изнутри локальный компьютер и сервер выглядят одинаково. Ответ меняет только то, что проект вам показывает, — права доступа он не меняет.",
  },
}

export function nodePlaceWords(lang: string): NodePlaceWords {
  return DICT[lang] ?? DICT.en
}
