// СЛОВА СПИСКА ДОМЕНОВ УЗЛА (324-1). `en` основа, `ru` перевод; строки выбирает сервер (рисовальщик блока `domainLadder`).

export type DomainListWords = {
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
  errors: Record<string, string>
}

const DICT: Record<string, DomainListWords> = {
  en: {
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
    errors: {
      "bad-shape": "Not a domain name: labels of Latin letters, digits and hyphens joined by dots, for example mybrand.com.",
      "with-www": "Type the root of the domain without www.",
      primary: "This is the node's main domain or its subdomain — it is already here.",
      exists: "This domain is already in the list.",
      "no-key": "The node has no Cloudflare key yet: connect the main domain first (the first card).",
      attached: "The domain is connected to an element — disconnect it there first.",
      "write-failed": "The list could not be saved.",
      "not-found": "The domain is not in the list.",
      unknown: "It did not work:",
    },
  },
  ru: {
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
    errors: {
      "bad-shape": "Это не имя домена: метки из латинских букв, цифр и дефисов через точку, например mybrand.com.",
      "with-www": "Введите корень домена без www.",
      primary: "Это основной домен узла или его поддомен — он уже здесь.",
      exists: "Этот домен уже в списке.",
      "no-key": "У узла ещё нет ключа Cloudflare: сначала подключите основной домен (первая карточка).",
      attached: "Домен подключён к элементу — сначала отключите его там.",
      "write-failed": "Не удалось сохранить список.",
      "not-found": "Этого домена нет в списке.",
      unknown: "Не получилось:",
    },
  },
}

export function domainListWords(lang: string): DomainListWords {
  return DICT[lang] ?? DICT.en
}
