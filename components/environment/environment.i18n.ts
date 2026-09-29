// СЛОВА ВКЛАДКИ «ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ» (336-1). `en` основа, `ru` перевод; строки выбирает сервер и передаёт острову пропсом.
export type EnvironmentUi = {
  set: string
  notSet: string
  unknown: string
  newValue: string
  save: string
  saving: string
  saved: string
  errors: Record<string, string>
  failed: string
  coreKeyUsed: string
  elementRestart: string
  dupTitle: string
  dupText: string
  dupYes: string
  dupNo: string
  dupDone: string
  empty: string
  editableHint: string
}

const DICT: Record<"en" | "ru", EnvironmentUi> = {
  en: {
    set: "Set",
    notSet: "Not set",
    unknown: "Checking…",
    newValue: "New value",
    save: "Check and save",
    saving: "Checking the key with OpenAI…",
    saved: "Saved. OpenAI accepted the key.",
    errors: {
      "bad-format": "This does not look like an OpenAI key: it starts with sk-.",
      "key-rejected": "OpenAI rejected this key. Nothing was saved.",
      "probe-failed": "Could not reach OpenAI to check the key. Nothing was saved.",
      "temporary-address": "Keys are not saved through a temporary public address.",
    },
    failed: "Not saved:",
    coreKeyUsed: "The core has its own key, and voice input uses it. A key here serves this element's own features.",
    elementRestart: "The element reads its variables at start: its own features see a new key after the element restarts.",
    dupTitle: "Copy the key to the core too?",
    dupText: "The core has no OpenAI key. With it, voice input works for every element of this node, not only this one.",
    dupYes: "Copy to the core",
    dupNo: "Only this element",
    dupDone: "The core has the key now.",
    empty: "No list of variables: this folder has no example file.",
    editableHint: "Only this key is changed here. Secrets are issued by the installer; NEXT_PUBLIC_ values are baked into the build.",
  },
  ru: {
    set: "Задана",
    notSet: "Не задана",
    unknown: "Проверяю…",
    newValue: "Новое значение",
    save: "Проверить и сохранить",
    saving: "Проверяю ключ у OpenAI…",
    saved: "Сохранено. OpenAI принял ключ.",
    errors: {
      "bad-format": "Это не похоже на ключ OpenAI: он начинается с sk-.",
      "key-rejected": "OpenAI отклонил этот ключ. Ничего не сохранено.",
      "probe-failed": "Не удалось связаться с OpenAI для проверки ключа. Ничего не сохранено.",
      "temporary-address": "Через временный публичный адрес ключи не сохраняются.",
    },
    failed: "Не сохранено:",
    coreKeyUsed: "У ядра есть свой ключ, и голосовой ввод берёт его. Ключ здесь — для собственных возможностей элемента.",
    elementRestart: "Элемент читает переменные при старте: его собственные возможности увидят новый ключ после перезапуска элемента.",
    dupTitle: "Продублировать ключ в ядро?",
    dupText: "У ядра нет ключа OpenAI. С ним голосовой ввод заработает у всех элементов узла, а не только у этого.",
    dupYes: "Продублировать в ядро",
    dupNo: "Только этому элементу",
    dupDone: "Теперь ключ есть и у ядра.",
    empty: "Списка переменных нет: в этой папке нет файла-примера.",
    editableHint: "Здесь меняется только этот ключ. Секреты выдаёт установщик, значения NEXT_PUBLIC_ запекаются в сборку.",
  },
}

export function environmentUi(lang: string): EnvironmentUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
