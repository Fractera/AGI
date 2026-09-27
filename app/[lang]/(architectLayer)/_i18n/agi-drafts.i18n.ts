// СЛОВА ЧЕРНОВИКОВ ЭЛЕМЕНТОВ (314-1): кнопка «Создать микросервис», карточки главной группы, окно удаления.
// `en` основа, `ru` перевод; слой архитектора двуязычен.

export type AgiDraftsUi = {
  create: string
  creating: string
  createFailed: string
  draftBadge: string
  sectionPages: string
  portTitle: string
  portLine: string
  addressTitle: string
  addressLine: string
  note: string
  delete: string
  deleteTitle: string
  deleteText: string
  deleteLabel: string
  deleteConfirm: string
  deleting: string
  deleteMismatch: string
  deleteFailed: string
  cancel: string
  elementBadge: string
  portLineBorn: string
  noteBorn: string
  birth: string
  birthTitle: string
  birthText: string
  birthConfirm: string
  birthStarting: string
  birthRunning: string
  birthDone: string
  birthFailed: string
  birthInterrupted: string
  birthRepeat: string
}

const DICT: Record<string, AgiDraftsUi> = {
  en: {
    create: "Create a microservice",
    creating: "Creating…",
    createFailed: "The microservice was not created: the node could not write the draft.",
    draftBadge: "Draft",
    sectionPages: "Pages of this section",
    portTitle: "Port on this machine",
    portLine: "No port assigned yet: the draft has no process of its own.",
    addressTitle: "Address on the internet",
    addressLine: "The subdomain has not been created yet.",
    note: "This is the name the microservice will live under. The port and the subdomain are assigned in a later step.",
    delete: "Delete",
    deleteTitle: "Delete this microservice?",
    deleteText: "Its group of pages disappears from the architect layer. Type its address to confirm:",
    deleteLabel: "Address",
    deleteConfirm: "Delete for good",
    deleting: "Deleting…",
    deleteMismatch: "The address does not match — nothing was deleted.",
    deleteFailed: "Nothing was deleted: the node refused.",
    cancel: "Cancel",
    elementBadge: "Element",
    portLineBorn: "The element's own process answers on this port.",
    noteBorn: "The element is born from the item template and lives as its own project. Its subdomain is connected with «Address on the internet».",
    birth: "Give birth to the element",
    birthTitle: "Give birth to this element?",
    birthText: "The node downloads the item template, gives this draft its own copy, a port, a build and a process. It takes about three minutes and a lot of memory; the page may be closed — the birth goes on.",
    birthConfirm: "Give birth",
    birthStarting: "Starting…",
    birthRunning: "The element is being born:",
    birthDone: "The element is born.",
    birthFailed: "The birth stopped:",
    birthInterrupted: "The birth process ended without a result (the node restarted or ran out of memory).",
    birthRepeat: "Nothing of the draft is lost. To repeat the installation run in the node folder: npm run services:install -- --only",
  },
  ru: {
    create: "Создать микросервис",
    creating: "Создаю…",
    createFailed: "Микросервис не создан: узел не смог записать черновик.",
    draftBadge: "Черновик",
    sectionPages: "Страницы раздела",
    portTitle: "Порт на этой машине",
    portLine: "Порт ещё не назначен: у черновика нет своего процесса.",
    addressTitle: "Адрес в интернете",
    addressLine: "Поддомен ещё не создан.",
    note: "Под этим именем будет жить микросервис. Порт и поддомен назначаются следующим шагом.",
    delete: "Удалить",
    deleteTitle: "Удалить этот микросервис?",
    deleteText: "Его группа страниц исчезнет из слоя архитектора. Для подтверждения введите его адрес:",
    deleteLabel: "Адрес",
    deleteConfirm: "Удалить навсегда",
    deleting: "Удаляю…",
    deleteMismatch: "Адрес не совпал — ничего не удалено.",
    deleteFailed: "Ничего не удалено: узел отказал.",
    cancel: "Отмена",
    elementBadge: "Элемент",
    portLineBorn: "На этом порту отвечает собственный процесс элемента.",
    noteBorn: "Элемент рождён из шаблона и живёт самостоятельным проектом. Поддомен подключается кнопкой «Адрес в интернете».",
    birth: "Родить элемент",
    birthTitle: "Родить этот элемент?",
    birthText: "Узел скачает шаблон элемента и даст черновику свою копию, порт, сборку и процесс. Это около трёх минут и много памяти; страницу можно закрыть — рождение продолжится.",
    birthConfirm: "Родить",
    birthStarting: "Запускаю…",
    birthRunning: "Элемент рождается:",
    birthDone: "Элемент родился.",
    birthFailed: "Рождение остановилось:",
    birthInterrupted: "Процесс рождения закончился без результата (узел перезапускался или не хватило памяти).",
    birthRepeat: "Черновик цел. Повторить установку можно в папке узла: npm run services:install -- --only",
  },
}

export function agiDraftsUi(lang: string): AgiDraftsUi {
  return DICT[lang] ?? DICT.en
}
