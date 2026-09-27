// СЛОВА РАЗДЕЛА «НАСТРОЙКИ» (DANGER ZONE) AGI ЭЛЕМЕНТА (325). `en` основа, `ru` перевод; строки выбирает сервер.

type Card = { title: string; text: string; action: string; pending: string }

export type ElementSettingsUi = {
  badge: string
  notBorn: string
  agentNotBorn: string
  describe: Card
  mirrorCard: {
    current: string; label: string; placeholder: string; attach: string; attaching: string; empty: string; add: string; loadFailed: string; note: string
    kinds: Record<"ready" | "waiting" | "taken" | "current", string>; errors: Record<string, string>
  }
  addressCard: { current: string; label: string; free: string; "bad-shape": string; taken: string; suggest: string; renaming: string; failed: string; note: string }
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
    mirrorCard: {
      current: "Connected:",
      label: "Node domains",
      placeholder: "Choose a domain",
      attach: "Connect",
      attaching: "Connecting…",
      empty: "The node has no extra domains yet — add one on «Domain activation».",
      add: "Add a domain",
      loadFailed: "The list of domains did not load.",
      note: "A domain is added and brought to an active zone on «Domain activation»; here you only choose it. www.<domain> will lead to the root; the old subdomain will lead to the domain.",
      kinds: {
        ready: "free · ready",
        waiting: "free · waiting for name servers (finish it on «Domain activation»)",
        taken: "connected to the element {by}",
        current: "connected to this element",
      },
      errors: {
        "not-in-list": "This domain is not among the node's domains — add it on «Domain activation».",
        taken: "This domain is already connected to another element.",
        pending: "The zone is not active yet — finish the name servers on «Domain activation».",
        "not-visible": "The node's Cloudflare key does not see this zone.",
        "no-key": "The node has no Cloudflare key.",
        "cloudflare-error": "Cloudflare did not answer.",
        "write-failed": "The node could not save the choice.",
        failed: "Connecting did not finish.",
      },
    },
    addressCard: {
      current: "Address in the core:",
      label: "New address",
      free: "The name is free.",
      "bad-shape": "4-24 characters: lowercase Latin letters, digits and single hyphens, starting with a letter.",
      taken: "The name is taken — by a section of the core, another element or a service.",
      suggest: "Free:",
      renaming: "Renaming…",
      failed: "The address was not changed:",
      note: "The inner name {id} stays: the folder, the process and the data do not move. The address on the internet stays {internet}.",
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
      text: "Rename the address of the element's pages in the core, with a check that the new name is free. The inner name (id) stays the same; the old address leads to the new one.",
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
    mirrorCard: {
      current: "Подключён:",
      label: "Домены узла",
      placeholder: "Выберите домен",
      attach: "Подключить",
      attaching: "Подключаю…",
      empty: "У узла пока нет дополнительных доменов — добавьте домен на «Активации домена».",
      add: "Добавить домен",
      loadFailed: "Список доменов не загрузился.",
      note: "Домен добавляется и доводится до активной зоны на «Активации домена», здесь — только выбор. www.<домен> будет вести на корень; старый поддомен — на домен.",
      kinds: {
        ready: "свободен · готов",
        waiting: "свободен · ждёт серверов имён (довести на «Активации домена»)",
        taken: "подключён к элементу {by}",
        current: "подключён к этому элементу",
      },
      errors: {
        "not-in-list": "Этого домена нет среди доменов узла — добавьте его на «Активации домена».",
        taken: "Этот домен уже подключён к другому элементу.",
        pending: "Зона ещё не активна — доведите серверы имён на «Активации домена».",
        "not-visible": "Ключ Cloudflare узла не видит эту зону.",
        "no-key": "У узла нет ключа Cloudflare.",
        "cloudflare-error": "Cloudflare не ответил.",
        "write-failed": "Узел не смог сохранить выбор.",
        failed: "Подключение не завершилось.",
      },
    },
    addressCard: {
      current: "Адрес в ядре:",
      label: "Новый адрес",
      free: "Имя свободно.",
      "bad-shape": "4–24 символа: строчные латинские буквы, цифры и одиночные дефисы, первая — буква.",
      taken: "Имя занято — разделом ядра, другим элементом или службой.",
      suggest: "Свободны:",
      renaming: "Переименовываю…",
      failed: "Адрес не изменён:",
      note: "Внутреннее имя {id} остаётся: папка, процесс и данные не переезжают. Адрес в интернете остаётся прежним — {internet}.",
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
      text: "Переименовать адрес страниц элемента в ядре с проверкой, что новое имя свободно. Внутреннее имя (id) не меняется; прежний адрес ведёт на новый.",
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
