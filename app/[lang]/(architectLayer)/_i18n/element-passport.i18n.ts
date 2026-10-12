// Слова страниц паспорта элемента (шаг 406-4): «Связи (A2A)», «Сеть (M2M)», «Процесс».

import type { SubscriptionsUi } from "../_components/subscriptions-view.client"
import type { CronUi } from "../_components/cron-calendar.client"

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
  // 435-3: «Каталог» — элементы узла сверху.
  nodeElements: string
  nodeElementsLead: string
  noDescription: string
  thisElement: string
  ownCatalog: string
  // 435-4: витрина A2A на примерных карточках.
  offers: string
  offersLead: string
  example: string
  price: string
  access: string
  limit: string
  forNeighbours: string
  forNeighboursLead: string
  accessRegistered: string
  accessEveryone: string
  unlimited: string
  perDay: string
  perHour: string
  perRequest: string
  perMessage: string
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
  integrations: string
  noIntegrations: string
  apiDocs: string
  /** 463: вкладка «Процесс → Подписки» — внешние платные сервисы (SUBSCRIPTIONS.json элемента). */
  subscriptions: SubscriptionsUi
  /** 465: вкладка «Процесс → Крон автоматизации» — календарь расписания (CRON.json элемента). */
  cron: CronUi
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
    nodeElements: "Elements of this node",
    nodeElementsLead: "Every element on this computer, in short — the list the core keeps so elements can find each other.",
    noDescription: "No description yet.",
    thisElement: "this element",
    ownCatalog: "What this element can give away",
    offers: "What it offers",
    offersLead: "The element's showcase: what it does, what it returns, to whom, at what price and with what limit.",
    example: "example, not for sale",
    price: "Price",
    access: "Available to",
    limit: "Limit",
    forNeighbours: "For neighbours in the node",
    accessRegistered: "registered users",
    accessEveryone: "everyone",
    unlimited: "no limit",
    perDay: "a day",
    perHour: "an hour",
    perRequest: "per request",
    perMessage: "per message",
    forNeighboursLead: "What other elements of this node call to keep the sites working together: free, with the node key.",
    find: "find",
    get: "get",
    contribute: "contribute",
    noContribute: "does not accept contributions",
    card: "The card other elements see",
    cardLead: "Derived from the passport; this is what a search over the node returns.",
    nostr: "Nostr tags",
    lightrag: "Text for LightRAG",
    notSent: "Nothing is sent to the network yet: this is how the element will be announced.",
    networkSoon: "Search in other Fractera projects through Lagrix (f2f) is not available yet. Inside this node see «Build → Inside the node (i2i) → Catalog».",
    process: "What the element does by itself",
    noProcess: "Nothing: it acts only when called.",
    integrations: "Outside services",
    noIntegrations: "None: the element uses no outside service.",
    apiDocs: "API documentation",
    subscriptions: {
      title: "Outside paid services",
      choose: "Choose a service",
      example: "Example",
      exampleNote: "A hard-coded example of how an outside service appears here: nothing is saved and nothing is called.",
      keys: "Keys",
      keysNote: "Keys are not saved from this screen yet: the element reads them from its environment variables (names below).",
      check: "Check",
      checkNotBuilt: "The check for this service is not built yet.",
      payments: "Payment history",
      date: "Date",
      description: "Description",
      amount: "Amount",
      status: "Status",
      docs: "Provider API documentation",
      envName: "Environment variable",
    },
    cron: {
      lead: "Schedules are set by talking to your Claude Code agent — in this element's terminal or in Telegram. Say what you need in your own words: the agent writes the schedule, and it appears here. The element's own server checks the clock once a minute and runs what is due, by the local time of this computer. While the computer is off or the element is stopped, runs are skipped and not made up later.",
      examplesTitle: "For example, tell the agent:",
      examples: [
        "Remind me every day at 10:00 that I have this project",
        "On weekdays at 9:30 send me a reminder in Telegram",
        "Remind me once, on Friday at 18:00",
        "Pause the Monday reminder",
        "Turn off all repeating reminders",
        "What is on my schedule for Friday?",
      ],
      paused: "All repeating reminders are turned off. One-time ones still run. Ask the agent to turn them back on.",
      empty: "This element has no schedule yet. Ask its agent in the terminal or in Telegram, for example: «Remind me every day at 10:00 that I have this project».",
      repeat: { once: "once", daily: "every day", weekdays: "on weekdays", weekly: "every week", monthly: "every month" },
      status: { done: "done", failed: "failed", missed: "skipped", paused: "paused", planned: "planned" },
      event: "Event",
      repeatLabel: "Repeats",
      since: "from",
      until: "until",
      lastRun: "Run",
      noTasks: "Nothing scheduled for this day.",
      prevYear: "Previous year",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      nextYear: "Next year",
    },
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
    nodeElements: "Элементы этого узла",
    nodeElementsLead: "Все элементы на этом компьютере коротко — список, который держит ядро, чтобы элементы находили друг друга.",
    noDescription: "Описания пока нет.",
    thisElement: "этот элемент",
    ownCatalog: "Что умеет отдать этот элемент",
    offers: "Что предлагает",
    offersLead: "Витрина элемента: что он делает, что возвращает, кому, по какой цене и с каким лимитом.",
    example: "пример, не продаётся",
    price: "Цена",
    access: "Кому доступно",
    limit: "Лимит",
    forNeighbours: "Для соседей по узлу",
    accessRegistered: "зарегистрированным пользователям",
    accessEveryone: "всем",
    unlimited: "без ограничений",
    perDay: "в сутки",
    perHour: "в час",
    perRequest: "за запрос",
    perMessage: "за сообщение",
    forNeighboursLead: "То, что вызывают другие элементы этого узла, чтобы сайты работали вместе: бесплатно, по ключу узла.",
    find: "найти",
    get: "получить",
    contribute: "внести",
    noContribute: "вклады не принимает",
    card: "Карточка, которую видят другие элементы",
    cardLead: "Выводится из паспорта; именно её возвращает поиск по узлу.",
    nostr: "Теги Nostr",
    lightrag: "Текст для LightRAG",
    notSent: "В сеть пока ничего не отправляется: так элемент будет объявлен.",
    networkSoon: "Поиск в других проектах Fractera через Lagrix (f2f) пока недоступен. Внутри узла смотрите «Строительство → Внутри узла (i2i) → Каталог».",
    process: "Что элемент делает сам",
    noProcess: "Ничего: действует только по вызову.",
    integrations: "Внешние сервисы",
    noIntegrations: "Нет: элемент не пользуется внешними сервисами.",
    apiDocs: "Документация API",
    subscriptions: {
      title: "Внешние платные сервисы",
      choose: "Выберите сервис",
      example: "Пример",
      exampleNote: "Образец того, как здесь появляется внешний сервис: ничего не сохраняется и не вызывается.",
      keys: "Ключи",
      keysNote: "С этого экрана ключи пока не сохраняются: элемент читает их из своих переменных окружения (имена ниже).",
      check: "Проверить",
      checkNotBuilt: "Проверка этого сервиса ещё не построена.",
      payments: "История платежей",
      date: "Дата",
      description: "Описание",
      amount: "Сумма",
      status: "Статус",
      docs: "Документация API поставщика",
      envName: "Переменная окружения",
    },
    cron: {
      lead: "Расписание ставится разговором с вашим агентом Claude Code — в терминале этого элемента или в Telegram. Скажите своими словами, что нужно: агент запишет расписание, и оно появится здесь. Сервер элемента сверяется с часами раз в минуту и запускает то, чему пришло время, — по местному времени этого компьютера. Пока компьютер выключен или элемент остановлен, запуски пропускаются и потом не догоняются.",
      examplesTitle: "Например, скажите агенту:",
      examples: [
        "Напоминай мне каждый день в 10:00, что у меня есть этот проект",
        "По будням в 9:30 присылай мне напоминание в Telegram",
        "Напомни один раз, в пятницу в 18:00",
        "Поставь на паузу напоминание по понедельникам",
        "Выключи все повторяющиеся напоминания",
        "Что у меня по расписанию на пятницу?",
      ],
      paused: "Все повторяющиеся напоминания выключены. Разовые по-прежнему срабатывают. Чтобы включить, попросите агента.",
      empty: "У этого элемента пока нет расписания. Попросите его агента в терминале или в Telegram, например: «Напоминай мне каждый день в 10:00, что у меня есть этот проект».",
      repeat: { once: "один раз", daily: "каждый день", weekdays: "по будням", weekly: "каждую неделю", monthly: "каждый месяц" },
      status: { done: "выполнено", failed: "ошибка", missed: "пропущено", paused: "на паузе", planned: "запланировано" },
      event: "Событие",
      repeatLabel: "Повтор",
      since: "с",
      until: "до",
      lastRun: "Запуск",
      noTasks: "На этот день ничего не запланировано.",
      prevYear: "Предыдущий год",
      prevMonth: "Предыдущий месяц",
      nextMonth: "Следующий месяц",
      nextYear: "Следующий год",
    },
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
