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
  },
}

export function agiDraftsUi(lang: string): AgiDraftsUi {
  return DICT[lang] ?? DICT.en
}
