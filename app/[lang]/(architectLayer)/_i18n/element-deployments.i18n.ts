// СЛОВА СТРАНИЦЫ «РАЗВЁРТЫВАНИЯ» РОЖДЁННОГО ЭЛЕМЕНТА (321). `en` основа, `ru` перевод.

export type ElementDeploymentsUi = {
  notBorn: string
  caption: string
  headers: [string, string, string, string]
  running: string
  exported: string
  rollback: string
  rollbackSoon: string
}

const DICT: Record<string, ElementDeploymentsUi> = {
  en: {
    notBorn: "The element is not born yet: give birth to it on its home page — then its versions appear here.",
    caption: "Versions of the element — its own commits, newest first",
    headers: ["Date", "Commit", "Description", "State"],
    running: "running",
    exported: "in GitHub",
    rollback: "Roll back to a version",
    rollbackSoon: "Rolling back to a chosen version is planned (step 322): the button is shown but does not work yet.",
  },
  ru: {
    notBorn: "Элемент ещё не рождён: родите его на главной — тогда здесь появятся его версии.",
    caption: "Версии элемента — его собственные коммиты, новые сверху",
    headers: ["Дата", "Коммит", "Описание", "Состояние"],
    running: "работает",
    exported: "в GitHub",
    rollback: "Откатить к версии",
    rollbackSoon: "Откат к выбранной версии запланирован (шаг 322): кнопка показана, но пока не работает.",
  },
}

export function elementDeploymentsUi(lang: string): ElementDeploymentsUi {
  return DICT[lang] ?? DICT.en
}
