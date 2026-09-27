// СЛОВА РАЗДЕЛА «НАСТРОЙКИ» (DANGER ZONE) AGI ЭЛЕМЕНТА (325). `en` основа, `ru` перевод; строки выбирает сервер.

type Card = { title: string; text: string; action: string; pending: string }

export type ElementSettingsUi = {
  badge: string
  notBorn: string
  describe: Card
  address: Card
  mirror: Card
  remove: Card
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
  },
}

export function elementSettingsUi(lang: string): ElementSettingsUi {
  return DICT[lang] ?? DICT.en
}
