// СЛОВА СТРАНИЦЫ «РАЗВЁРТЫВАНИЯ» РОЖДЁННОГО ЭЛЕМЕНТА (321). `en` основа, `ru` перевод.

export type ElementDeploymentsUi = {
  notBorn: string
  caption: string
  headers: [string, string, string, string]
  running: string
  exported: string
}

const DICT: Record<string, ElementDeploymentsUi> = {
  en: {
    notBorn: "The element is not born yet: give birth to it on its home page — then its versions appear here.",
    caption: "Versions of the element — its own commits, newest first",
    headers: ["Date", "Commit", "Description", "State"],
    running: "running",
    exported: "in GitHub",
  },
  ru: {
    notBorn: "Элемент ещё не рождён: родите его на главной — тогда здесь появятся его версии.",
    caption: "Версии элемента — его собственные коммиты, новые сверху",
    headers: ["Дата", "Коммит", "Описание", "Состояние"],
    running: "работает",
    exported: "в GitHub",
  },
}

export function elementDeploymentsUi(lang: string): ElementDeploymentsUi {
  return DICT[lang] ?? DICT.en
}
