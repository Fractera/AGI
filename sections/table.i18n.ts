// Подписи панели поиска и полосы страниц у блока «таблица».
//
// Слова перенесены ДОСЛОВНО из образца владельца — раздела «Автоматизации» службы Telegram
// (`fractera-telegrambot-starter/app/[lang]/settings/_i18n/telegram.i18n.ts`, ключ `automations`).
// Отличие одно: подсказка поиска общая («по таблице»), потому что у таблицы нет «названия» и
// «меток» — у неё строки.
//
// Файл лежит в корне `sections/`, а не в `sections/blocks/`: в `blocks/` живут только рендереры.

export type TableUi = {
  search: string
  searchDo: string
  reset: string
  empty: string
  /** `{from}`, `{to}`, `{total}` */
  shown: string
  perPage: string
  first: string
  prev: string
  next: string
  last: string
  /** `{n}`, `{of}` */
  page: string
}

const UI: Record<string, TableUi> = {
  en: {
    search: 'Search the table',
    searchDo: 'Search',
    reset: 'Reset filters',
    empty: 'Nothing matches this filter.',
    shown: 'Showing {from}-{to} of {total}',
    perPage: 'Per page',
    first: 'First page',
    prev: 'Back',
    next: 'Forward',
    last: 'Last page',
    page: 'Page {n} of {of}',
  },
  ru: {
    search: 'Поиск по таблице',
    searchDo: 'Найти',
    reset: 'Сбросить отбор',
    empty: 'Под этот отбор ничего не попало.',
    shown: 'Показано {from}-{to} из {total}',
    perPage: 'На странице',
    first: 'Первая страница',
    prev: 'Назад',
    next: 'Вперёд',
    last: 'Последняя страница',
    page: 'Страница {n} из {of}',
  },
}

export function tableUi(lang: string): TableUi {
  return UI[lang] ?? UI.en
}
