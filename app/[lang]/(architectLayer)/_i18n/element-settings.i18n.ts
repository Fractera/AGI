// СЛОВА РАЗДЕЛА «НАСТРОЙКИ» (DANGER ZONE) AGI ЭЛЕМЕНТА (325). `en` основа, `ru` перевод; строки выбирает сервер.

type Card = { title: string; text: string; action: string; pending: string }

export type ElementSettingsUi = {
  badge: string
  notBorn: string
  agentNotBorn: string
  describe: Card
  describeCard: { empty: string; take: string; taking: string; taken: string; takenAt: string; how: string; errors: Record<string, string> }
  address: Card
  mirror: Card
  remove: Card
  removeDialog: { title: string; text: string; label: string; confirm: string; deleting: string; cancel: string; mismatch: string; failed: string; riskNever: string; riskAhead: string; riskNone: string }
}

const DICT: Record<string, ElementSettingsUi> = {
  en: {
    badge: "Danger zone",
    notBorn: "The element is not born yet: give birth to it on its home page — its settings appear after that.",
    agentNotBorn: "The element is not born yet: give birth to it on its home page — then its agent, Claude Code, can be started here.",
    describe: {
      title: "Capabilities description",
      text: "The element's agent reads its code and writes what the element can do; the node then keeps it as the element's record in the core.",
      action: "Generate the description",
      pending: "Being built (step 325-2).",
    },
    describeCard: {
      empty: "The core has no description of this element yet.",
      take: "Take into the core",
      taking: "Taking…",
      taken: "The description is now the element's record in the core.",
      takenAt: "Taken into the core:",
      how: "1. Generate — the element's terminal opens with the task; start the agent and send it. 2. When the agent has written and committed the description — take it into the core.",
      errors: {
        "passport-unreadable": "The element's passport OWN-SERVICE-PROPS.json cannot be read.",
        "summary-missing": "The passport has no summary — the agent has not written it yet.",
        "summary-not-written": "The summary in the passport is still the template's or the birth's one — the agent has not written its own yet.",
        "provides-missing": "The passport names no capabilities (provides is empty).",
        "provides-bad-shape": "The capability names in provides have the wrong shape: 1-20 unique names, lowercase words joined by hyphens.",
        "registry-failed": "The node's registry could not be written.",
        unknown: "The description was not taken:",
      },
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
    agentNotBorn: "Элемент ещё не рождён: родите его на главной — тогда здесь можно будет запустить его агента, Claude Code.",
    describe: {
      title: "Описание возможностей",
      text: "Агент элемента читает его код и пишет, что элемент умеет; узел хранит это как запись элемента в ядре.",
      action: "Сгенерировать описание",
      pending: "В работе (подшаг 325-2).",
    },
    describeCard: {
      empty: "В ядре пока нет описания этого элемента.",
      take: "Забрать в ядро",
      taking: "Забираю…",
      taken: "Описание стало записью элемента в ядре.",
      takenAt: "Забрано в ядро:",
      how: "1. «Сгенерировать» — откроется терминал элемента с заданием; запустите агента и отправьте его. 2. Когда агент напишет и закоммитит описание — заберите его в ядро.",
      errors: {
        "passport-unreadable": "Паспорт элемента OWN-SERVICE-PROPS.json не читается.",
        "summary-missing": "В паспорте нет описания (summary) — агент его ещё не написал.",
        "summary-not-written": "Описание в паспорте всё ещё шаблонное или записанное при рождении — агент своё ещё не написал.",
        "provides-missing": "В паспорте не названо ни одной возможности (provides пуст).",
        "provides-bad-shape": "Имена возможностей в provides неверной формы: 1–20 разных имён, строчные слова через дефис.",
        "registry-failed": "Не удалось записать реестр узла.",
        unknown: "Описание не забрано:",
      },
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
