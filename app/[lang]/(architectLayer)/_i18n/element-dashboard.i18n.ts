// ДАШБОРД РАЗДЕЛОВ H2A · H2H · A2A ЭЛЕМЕНТА (шаг 472-2). Слово владельца 2026-10-13: «на каждую из этих трёх слоев мы добавляем вкладку
// дашборд … минимальный интерфейс количество собеседников, количество сделок они же будет таблица а под таблицей будет надпись в
// зависимости от ваших потребностей используйте терминал для того чтобы разработать тот интерфейс который вам нужен».

export type ElementDashboardUi = {
  counterparts: string
  deals: string
  headers: [string, string, string]
  empty: string
  note: string
  terminal: string
}

const en: ElementDashboardUi = {
  counterparts: "Counterparts",
  deals: "Deals",
  headers: ["Counterpart", "Deals", "Last"],
  empty: "No counterparts yet.",
  note: "Depending on your needs, use the terminal to build the interface you want here: the dashboard stays yours to shape.",
  terminal: "Open the terminal",
}

const ru: ElementDashboardUi = {
  counterparts: "Собеседники",
  deals: "Сделки",
  headers: ["Собеседник", "Сделки", "Последняя"],
  empty: "Собеседников пока нет.",
  note: "В зависимости от ваших потребностей используйте терминал, чтобы разработать здесь нужный вам интерфейс: дашборд остаётся под ваши задачи.",
  terminal: "Открыть терминал",
}

export const elementDashboardUi = (lang: string): ElementDashboardUi => (lang === "ru" ? ru : en)
