// Слова страниц паспорта элемента (шаг 406-4): «Связи (A2A)», «Сеть (M2M)», «Процесс».

export type ElementPassportUi = {
  none: string
  problems: string
  describeHint: string
  doors: string
  noHttp: string
  noMcp: string
  method: string
  path: string
  key: string
  callers: string
  everyone: string
  capability: string
  input: string
  output: string
  errors: string
  can: string
  needs: string
  noNeeds: string
  from: string
  catalogNone: string
  catalogDoors: string
  find: string
  get: string
  contribute: string
  noContribute: string
  card: string
  cardLead: string
  nostr: string
  lightrag: string
  notSent: string
  networkSoon: string
  process: string
  noProcess: string
  fingerprint: string
  accepts: string
  returns: string
  examples: string
  published: string
  publishedLead: string
  registry: string
  warnings: string
}

const DICT: Record<"en" | "ru", ElementPassportUi> = {
  en: {
    none: "This element has not described itself yet: its passport has no `a2a` section.",
    problems: "The passport does not pass the guard:",
    describeHint: "The element's agent describes it: npm run check:passport in the element's folder shows what is missing.",
    doors: "Doors offered to neighbours",
    noHttp: "No HTTP doors are offered.",
    noMcp: "No MCP tools are offered.",
    method: "Method",
    path: "Path",
    key: "Key",
    callers: "Who may call",
    everyone: "every element of the node",
    capability: "Capability",
    input: "Request example",
    output: "Answer example",
    errors: "Refusals",
    can: "What it can do",
    needs: "What it needs from neighbours",
    noNeeds: "Nothing.",
    from: "from",
    catalogNone: "This element offers no catalog.",
    catalogDoors: "Catalog doors",
    find: "find",
    get: "get",
    contribute: "contribute",
    noContribute: "does not accept contributions",
    card: "The card other elements see",
    cardLead: "Derived from the passport; this is what a search over the node returns.",
    nostr: "Nostr tags",
    lightrag: "Text for LightRAG",
    notSent: "Nothing is sent to the network yet: this is how the element will be announced.",
    networkSoon: "Search on other nodes is not available yet. Inside this node use the Links (A2A) of each element.",
    process: "What the element does by itself",
    noProcess: "Nothing: it acts only when called.",
    fingerprint: "Passport fingerprint",
    accepts: "Accepts",
    returns: "Returns",
    examples: "Asked like",
    published: "Published A2A card",
    publishedLead: "What any A2A client gets at /.well-known/agent-card.json of the element (Google A2A v1.0).",
    registry: "Entry in the node registry",
    warnings: "Notes:",
  },
  ru: {
    none: "Элемент ещё не описал себя: в его паспорте нет раздела `a2a`.",
    problems: "Паспорт не проходит сторожа:",
    describeHint: "Описывает элемент его агент: npm run check:passport в папке элемента покажет, чего не хватает.",
    doors: "Двери, которые элемент предлагает соседям",
    noHttp: "HTTP-дверей элемент не предлагает.",
    noMcp: "Инструментов MCP элемент не предлагает.",
    method: "Метод",
    path: "Путь",
    key: "Ключ",
    callers: "Кто вправе вызывать",
    everyone: "любой элемент узла",
    capability: "Способность",
    input: "Пример запроса",
    output: "Пример ответа",
    errors: "Отказы",
    can: "Что умеет",
    needs: "Что нужно от соседей",
    noNeeds: "Ничего.",
    from: "у",
    catalogNone: "Каталога у элемента нет.",
    catalogDoors: "Двери каталога",
    find: "найти",
    get: "получить",
    contribute: "внести",
    noContribute: "вклады не принимает",
    card: "Карточка, которую видят другие элементы",
    cardLead: "Выводится из паспорта; именно её возвращает поиск по узлу.",
    nostr: "Теги Nostr",
    lightrag: "Текст для LightRAG",
    notSent: "В сеть пока ничего не отправляется: так элемент будет объявлен.",
    networkSoon: "Поиск на других узлах пока недоступен. Внутри узла смотрите «Связи (A2A)» каждого элемента.",
    process: "Что элемент делает сам",
    noProcess: "Ничего: действует только по вызову.",
    fingerprint: "Отпечаток паспорта",
    accepts: "Принимает",
    returns: "Возвращает",
    examples: "Как просят",
    published: "Опубликованная визитка A2A",
    publishedLead: "Что получает любой клиент A2A по адресу /.well-known/agent-card.json элемента (Google A2A v1.0).",
    registry: "Запись в реестре узла",
    warnings: "Заметки:",
  },
}

export function elementPassportUi(lang: string): ElementPassportUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
