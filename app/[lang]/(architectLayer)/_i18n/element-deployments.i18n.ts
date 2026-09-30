// СЛОВА СТРАНИЦЫ «РАЗВЁРТЫВАНИЯ» РОЖДЁННОГО ЭЛЕМЕНТА (321). `en` основа, `ru` перевод.

export type ElementDeploymentsUi = {
  notBorn: string
  caption: string
  headers: [string, string, string, string]
  running: string
  exported: string
  rollback: string
  rollbackSoon: string
  /** 344-3: копия публичных страниц в Cloudflare. */
  copyOk: string
  copyFailed: string
  copyNoWorkers: string
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
    copyOk: "Copy of the public pages in Cloudflare: {time}, {files} files. {host} stays visible while this computer is off. It is renewed by itself after «Accept» and «Deploy».",
    copyFailed: "The copy of the public pages in Cloudflare was not renewed ({time}): {reason}. Visitors see the previous copy, if there is one.",
    copyNoWorkers: "the node's Cloudflare key has no rights to Workers — renew the key in Domain and hosting → Domain activation",
  },
  ru: {
    notBorn: "Элемент ещё не рождён: родите его на главной — тогда здесь появятся его версии.",
    caption: "Версии элемента — его собственные коммиты, новые сверху",
    headers: ["Дата", "Коммит", "Описание", "Состояние"],
    running: "работает",
    exported: "в GitHub",
    rollback: "Откатить к версии",
    rollbackSoon: "Откат к выбранной версии запланирован (шаг 322): кнопка показана, но пока не работает.",
    copyOk: "Копия публичных страниц в Cloudflare: {time}, файлов — {files}. {host} виден, когда этот компьютер выключен. Копия обновляется сама после «Принять» и «Развернуть».",
    copyFailed: "Копия публичных страниц в Cloudflare не обновилась ({time}): {reason}. Посетители видят прежнюю копию, если она есть.",
    copyNoWorkers: "у ключа Cloudflare узла нет прав на Workers — обновите ключ в «Домен и хостинг → Активация домена»",
  },
}

export function elementDeploymentsUi(lang: string): ElementDeploymentsUi {
  return DICT[lang] ?? DICT.en
}
