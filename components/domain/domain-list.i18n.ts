// СЛОВА СПИСКА ДОМЕНОВ УЗЛА (324-1). `en` основа, `ru` перевод; строки выбирает сервер (рисовальщик блока `domainLadder`).

export type DomainListWords = {
  intro: string
  primaryTitle: string
  primaryNone: string
  addTitle: string
  addLabel: string
  add: string
  adding: string
  recheck: string
  rechecking: string
  remove: string
  attachedTo: string
  checkedAt: string
  docsAddSite: string
  docsToken: string
  loadFailed: string
  state: Record<string, string>
  pipe: Record<string, string>
  keyPerms: string[]
  key: Record<string, string>
  errors: Record<string, string>
}

const DICT: Record<string, DomainListWords> = {
  en: {
    intro: "Every AGI element of this project opens on a subdomain of the main domain. Any of them can also become a standalone resource on a domain of its own: add the domain here, then connect it on the element's page — Settings → Main mirror.",
    primaryTitle: "Main domain",
    primaryNone: "not connected yet",
    addTitle: "Add a domain",
    addLabel: "Another domain of yours (the root, without www)",
    add: "Add",
    adding: "Adding…",
    recheck: "Check again",
    rechecking: "Checking…",
    remove: "Remove from the list",
    attachedTo: "Connected to the element",
    checkedAt: "Checked:",
    docsAddSite: "How to add a domain to Cloudflare",
    docsToken: "How to give the node's key access to one more zone",
    loadFailed: "The list of domains did not load.",
    state: {
      active: "Ready: the zone is active in Cloudflare and the node's key sees it. It can be connected to an element (Settings → Main mirror).",
      pending: "The zone is in Cloudflare but not active yet (status: {status}). At your registrar, set these name servers, wait (minutes to a day) and check again:",
      "not-visible": "The node's Cloudflare key does not see this zone. Either add the domain to the same Cloudflare account as the main domain, or — if it is there — give the node's key access to this zone too (the resources the token is authorized to access — see the link below). Then check again.",
      unknown: "Not checked yet.",
    },
    pipe: {
      step1: "1. Zone in Cloudflare",
      step1Done: "The zone exists in the node's Cloudflare account.",
      step1Todo: "The node creates the zone in the Cloudflare account of the main domain itself.",
      createZone: "Create the zone",
      creating: "Creating…",
      noPermission: "The node's Cloudflare key has no right to add domains. Create a key with this right by the button below and paste it — the node will create the zone right after.",
      keySaveAndCreate: "Save the key and create the zone",
      keyLabel: "New Cloudflare key",
      keySave: "Save the key and create the zone",
      keySaving: "Saving…",
      keyOpen: "Open the Cloudflare dashboard",
      keyDocs: "How to create an API token (Cloudflare docs)",
      step2: "2. Name servers at your registrar",
      step2Wait: "Opens after step 1.",
      step2Text: "This is the only step outside the node: at your registrar, replace the name servers of the domain with these two.",
      assigned: "Set these:",
      atRegistrar: "Now the internet sees:",
      nothingYet: "nothing (not measured yet)",
      match: "They match.",
      noMatch: "They do not match yet. After changing them at the registrar, the internet sees the new ones in minutes to a day.",
      check: "Check",
      checking: "Checking…",
      step3: "3. Active",
      step3Wait: "Opens when the name servers match.",
      step3Asked: "The node asked Cloudflare to re-check the zone. Press «Check» again in a few minutes.",
      step3Done: "The zone is active — the domain is ready to be connected to an element (Settings → Main mirror).",
      lastCheck: "Checked at {time}: {what}",
    },
    keyPerms: ["Zone Edit (Zone Write)", "DNS Write", "Cloudflare Tunnel Edit"],
    key: {
      title: "The node's Cloudflare key needs attention",
      none: "The node has no Cloudflare key: it cannot connect or manage domains. Create one key for your Cloudflare account and paste it here.",
      disabled: "Cloudflare says the node's key …{tail} is disabled: the node cannot manage its domains. Create a new key and paste it here.",
      expired: "Cloudflare says the node's key …{tail} has expired: the node cannot manage its domains. Create a new key and paste it here.",
      unverified: "Cloudflare did not confirm the node's key …{tail} just now. If it keeps saying so, create a new key and paste it here.",
      label: "Cloudflare key",
      save: "Save",
      saving: "Checking and saving…",
      failed: "The key was not accepted:",
    },
    errors: {
      "bad-shape": "Not a domain name: labels of Latin letters, digits and hyphens joined by dots, for example mybrand.com.",
      "with-www": "Type the root of the domain without www.",
      primary: "This is the node's main domain or its subdomain — it is already here.",
      exists: "This domain is already in the list.",
      "no-key": "The node has no Cloudflare key yet: connect the main domain first (the first card).",
      attached: "The domain is connected to an element — disconnect it there first.",
      "write-failed": "The list could not be saved.",
      "not-found": "The domain is not in the list.",
      "no-zone-permission": "The key has no right to create zones — see step 1.",
      "no-primary": "Connect the main domain first (the first card).",
      "primary-not-visible": "The node's key does not see the main domain — the key is wrong for this node.",
      unknown: "It did not work:",
    },
  },
  ru: {
    intro: "Каждый AGI элемент этого проекта открывается на поддомене основного домена. Любой из них можно сделать и самостоятельным ресурсом на собственном домене: добавьте домен здесь, а затем подключите его на странице элемента — «Настройки» → «Главное зеркало».",
    primaryTitle: "Основной домен",
    primaryNone: "ещё не подключён",
    addTitle: "Добавить домен",
    addLabel: "Ещё один ваш домен (корень, без www)",
    add: "Добавить",
    adding: "Добавляю…",
    recheck: "Проверить снова",
    rechecking: "Проверяю…",
    remove: "Убрать из списка",
    attachedTo: "Подключён к элементу",
    checkedAt: "Проверено:",
    docsAddSite: "Как добавить домен в Cloudflare",
    docsToken: "Как дать ключу узла доступ ещё к одной зоне",
    loadFailed: "Список доменов не загрузился.",
    state: {
      active: "Готов: зона активна в Cloudflare, и ключ узла её видит. Можно подключать к элементу (Настройки → Главное зеркало).",
      pending: "Зона есть в Cloudflare, но ещё не активна (статус: {status}). У регистратора поставьте эти серверы имён, подождите (от минут до суток) и проверьте снова:",
      "not-visible": "Ключ Cloudflare узла не видит эту зону. Либо добавьте домен в тот же аккаунт Cloudflare, где основной домен, либо — если он там — дайте ключу узла доступ и к этой зоне (ресурсы, к которым у токена есть доступ, — по ссылке ниже). Затем проверьте снова.",
      unknown: "Ещё не проверялся.",
    },
    pipe: {
      step1: "1. Зона в Cloudflare",
      step1Done: "Зона есть в аккаунте Cloudflare узла.",
      step1Todo: "Узел сам создаёт зону в аккаунте Cloudflare основного домена.",
      createZone: "Создать зону",
      creating: "Создаю…",
      noPermission: "У ключа Cloudflare узла нет права добавлять домены. Создайте ключ с этим правом кнопкой ниже и вставьте его — узел сразу создаст зону.",
      keySaveAndCreate: "Сохранить ключ и создать зону",
      keyLabel: "Новый ключ Cloudflare",
      keySave: "Сохранить ключ и создать зону",
      keySaving: "Сохраняю…",
      keyOpen: "Открыть панель Cloudflare",
      keyDocs: "Как создать API-токен (документация Cloudflare)",
      step2: "2. Серверы имён у регистратора",
      step2Wait: "Откроется после ступени 1.",
      step2Text: "Это единственный шаг вне узла: у регистратора замените серверы имён домена на эти два.",
      assigned: "Поставьте эти:",
      atRegistrar: "Сейчас интернет видит:",
      nothingYet: "ничего (ещё не замерено)",
      match: "Совпадают.",
      noMatch: "Пока не совпадают. После замены у регистратора интернет видит новые серверы через время от минут до суток.",
      check: "Проверить",
      checking: "Проверяю…",
      step3: "3. Активна",
      step3Wait: "Откроется, когда серверы имён совпадут.",
      step3Asked: "Узел попросил Cloudflare перепроверить зону. Нажмите «Проверить» ещё раз через несколько минут.",
      step3Done: "Зона активна — домен готов к подключению к элементу (Настройки → Главное зеркало).",
      lastCheck: "Проверено в {time}: {what}",
    },
    keyPerms: ["Zone Edit (Zone Write)", "DNS Write", "Cloudflare Tunnel Edit"],
    key: {
      title: "Ключ Cloudflare узла требует внимания",
      none: "У узла нет ключа Cloudflare: подключать домены и управлять ими он не может. Создайте один ключ для своего аккаунта Cloudflare и вставьте его сюда.",
      disabled: "Cloudflare говорит, что ключ узла …{tail} отключён: узел не может управлять своими доменами. Создайте новый ключ и вставьте его сюда.",
      expired: "Cloudflare говорит, что срок ключа узла …{tail} истёк: узел не может управлять своими доменами. Создайте новый ключ и вставьте его сюда.",
      unverified: "Cloudflare сейчас не подтвердил ключ узла …{tail}. Если так и останется — создайте новый ключ и вставьте его сюда.",
      label: "Ключ Cloudflare",
      save: "Сохранить",
      saving: "Проверяю и сохраняю…",
      failed: "Ключ не принят:",
    },
    errors: {
      "bad-shape": "Это не имя домена: метки из латинских букв, цифр и дефисов через точку, например mybrand.com.",
      "with-www": "Введите корень домена без www.",
      primary: "Это основной домен узла или его поддомен — он уже здесь.",
      exists: "Этот домен уже в списке.",
      "no-key": "У узла ещё нет ключа Cloudflare: сначала подключите основной домен (первая карточка).",
      attached: "Домен подключён к элементу — сначала отключите его там.",
      "write-failed": "Не удалось сохранить список.",
      "not-found": "Этого домена нет в списке.",
      "no-zone-permission": "У ключа нет права создавать зоны — см. ступень 1.",
      "no-primary": "Сначала подключите основной домен (первая карточка).",
      "primary-not-visible": "Ключ узла не видит основной домен — ключ не подходит этому узлу.",
      unknown: "Не получилось:",
    },
  },
}

export function domainListWords(lang: string): DomainListWords {
  return DICT[lang] ?? DICT.en
}
