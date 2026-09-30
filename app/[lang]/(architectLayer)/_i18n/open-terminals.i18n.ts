// СЛОВА ПОЛОСЫ «ТЕРМИНАЛЫ, КОТОРЫЕ НАГРУЖАЮТ ВАШ КОМПЬЮТЕР» (узел, шаг 345). Серверный словарь: макет слоя берёт его по языку и
// отдаёт островку пропсом. Заголовок — слова владельца 2026-09-22 (черновик 267-5): «терминалы которые создают нагрузку на ваш
// компьютер».

export type OpenTerminalsUi = {
  title: string
  since: string
  channel: string
  open: string
  close: string
  confirm: string
  confirmYes: string
  cancel: string
  failed: string
}

const en: OpenTerminalsUi = {
  title: "Terminals loading your computer:",
  since: "since",
  channel: "Telegram",
  open: "Open terminal",
  close: "Close",
  confirm: "The agent will be interrupted mid-work. Close?",
  confirmYes: "Yes, close",
  cancel: "Cancel",
  failed: "Could not close the terminal. Try again.",
}

const ru: OpenTerminalsUi = {
  title: "Терминалы, которые нагружают ваш компьютер:",
  since: "с",
  channel: "Telegram",
  open: "Открыть терминал",
  close: "Закрыть",
  confirm: "Агент будет прерван посреди работы. Закрыть?",
  confirmYes: "Да, закрыть",
  cancel: "Отмена",
  failed: "Не удалось закрыть терминал. Попробуйте ещё раз.",
}

export function openTerminalsUi(lang: string): OpenTerminalsUi {
  return lang === "ru" ? ru : en
}
