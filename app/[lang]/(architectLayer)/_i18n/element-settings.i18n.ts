// СЛОВА РАЗДЕЛА «НАСТРОЙКИ» (DANGER ZONE) AGI ЭЛЕМЕНТА (325). `en` основа, `ru` перевод; строки выбирает сервер.

type Card = { title: string; text: string; action: string; pending: string }

export type ElementSettingsUi = {
  badge: string
  notBorn: string
  describe: Card
  address: Card
  mirror: Card
  remove: Card
  removeDialog: { title: string; text: string; label: string; confirm: string; deleting: string; cancel: string; mismatch: string; failed: string; riskNever: string; riskAhead: string; riskNone: string }
}

const DICT: Record<string, ElementSettingsUi> = {
  en: {
    badge: "Danger zone",
    notBorn: "The element is not born yet: give birth to it on its home page — its settings appear after that.",
    describe: {
      title: "Capabilities description",
      text: "The element's agent reads its code and writes what the element can do; the node then keeps it as the element's record in the core.",
      action: "Generate the description",
      pending: "Being built (step 325-2).",
    },
    address: {
      title: "Element address",
      text: "Rename the address of the element — in the core and on the internet — with a check that the new name is free. The inner name stays the same.",
      action: "Rename the address",
      pending: "Being built (step 325-3).",
    },
    mirror: {
      title: "Main mirror",
      text: "Connect your own second domain to the root of this element; the current subdomain then redirects to it.",
      action: "Connect the main mirror",
      pending: "Planned (step 324).",
    },
    remove: {
      title: "Delete the element",
      text: "Deletes the element for good: its process, its record in the node, its address on the internet and its folder with the code. Your repository on GitHub is not touched.",
      action: "Delete the element",
      pending: "Being built (step 325-5).",
    },
    removeDialog: {
      title: "Delete this AGI element for good?",
      text: "Its process stops, its address on the internet and its record in the node disappear, and its folder with the code is erased. This cannot be undone. Type its address to confirm:",
      label: "Address",
      confirm: "Delete for good",
      deleting: "Deleting…",
      cancel: "Cancel",
      mismatch: "The address does not match — nothing was deleted.",
      failed: "The deletion did not finish at:",
      riskNever: "The element was never sent to GitHub: all {n} of its commits will be lost.",
      riskAhead: "{n} commit(s) of the element are not in GitHub — they will be lost.",
      riskNone: "Everything the element has is already in GitHub.",
    },
  },
  ru: {
    badge: "Опасная зона",
    notBorn: "Элемент ещё не рождён: родите его на главной — настройки появятся после этого.",
    describe: {
      title: "Описание возможностей",
      text: "Агент элемента читает его код и пишет, что элемент умеет; узел хранит это как запись элемента в ядре.",
      action: "Сгенерировать описание",
      pending: "В работе (подшаг 325-2).",
    },
    address: {
      title: "Адрес элемента",
      text: "Переименовать адрес элемента — в ядре и в интернете — с проверкой, что новое имя свободно. Внутреннее имя не меняется.",
      action: "Переименовать адрес",
      pending: "В работе (подшаг 325-3).",
    },
    mirror: {
      title: "Главное зеркало",
      text: "Подключить второй собственный домен к корню этого элемента; текущий поддомен будет переадресовывать на него.",
      action: "Подключить главное зеркало",
      pending: "Запланировано (шаг 324).",
    },
    remove: {
      title: "Удалить элемент",
      text: "Удаляет элемент насовсем: его процесс, запись в узле, адрес в интернете и папку с кодом. Ваш репозиторий на GitHub не трогается.",
      action: "Удалить элемент",
      pending: "В работе (подшаг 325-5).",
    },
    removeDialog: {
      title: "Удалить этот AGI элемент насовсем?",
      text: "Его процесс остановится, адрес в интернете и запись в узле исчезнут, папка с кодом будет стёрта. Отменить это нельзя. Для подтверждения введите его адрес:",
      label: "Адрес",
      confirm: "Удалить навсегда",
      deleting: "Удаляю…",
      cancel: "Отмена",
      mismatch: "Адрес не совпал — ничего не удалено.",
      failed: "Удаление не закончилось на этапах:",
      riskNever: "Элемент ни разу не выгружался в GitHub: все его коммиты ({n}) будут потеряны.",
      riskAhead: "Коммитов, которых нет в GitHub: {n} — они будут потеряны.",
      riskNone: "Всё, что есть у элемента, уже лежит в GitHub.",
    },
  },
}

export function elementSettingsUi(lang: string): ElementSettingsUi {
  return DICT[lang] ?? DICT.en
}
