// ДЕРЕВО СТРАНИЦ ОДНОГО AGI ITEM (шаг 314-1). Структура — слово владельца 2026-09-26: Preview · строительство · коннекторы ·
// web3 store · проектирование продукта · документы · процесс («Последний раздел подписки исправь на вот этот вот»).
//
// 🔒 ОДИН ФАЙЛ — И МЕНЮ, И МАРШРУТ, И ЗАГЛУШКИ. Список разделов, объявленный второй раз где-то ещё, разойдётся молча:
// добавили страницу — в меню она есть, а маршрут отвечает 404, или наоборот.
// 🔒 ДВА УРОВНЯ ПОД ЭЛЕМЕНТОМ: разделы и их страницы; с шага 320 левое меню раскрывает и страницы раздела (третий уровень),
// а раздел по-прежнему перечисляет их справа.
// Слова — `en` основа, `ru` перевод; пока у страниц только заглушка: заголовок и описание.

export type TreeWords = { title: string; lead: string }
// 412-2: `doc` — страница показывает файл (или папку) элемента; пункт есть, только пока этот файл существует
// (`lib/agi-items/element-docs.ts`).
export type TreePage = {
  slug: string; words: Record<"en" | "ru", TreeWords>; pages?: TreePage[]; needs?: "catalog"; doc?: { file: string; folder?: boolean }
}

const w = (enTitle: string, enLead: string, ruTitle: string, ruLead: string): Record<"en" | "ru", TreeWords> => ({
  en: { title: enTitle, lead: enLead },
  ru: { title: ruTitle, lead: ruLead },
})

export const ITEM_TREE: TreePage[] = [
  { slug: "preview", words: w("Live site", "The element's own site as it runs now and a visitor sees it.", "Живой сайт", "Сайт элемента таким, каким он работает сейчас и каким его видит посетитель.") }, // 393: «Preview» → «Живой сайт» (владелец 2026-10-04)
  {
    slug: "build",
    words: w("Build", "Everything the element's agent needs to build it.", "Строительство", "Всё, что нужно агенту элемента, чтобы его строить."),
    pages: [
      // 384-1, слово владельца 2026-10-03: «перевести её вверх самый вверх выше чем подписка Claude Code Agent».
      { slug: "github", words: w("GitHub", "The element's own repository.", "GitHub", "Собственный репозиторий элемента.") },
      { slug: "subscription", words: w("Claude Code subscription", "Signing the element's agent in to the Claude Code subscription.", "Подписка Claude Code", "Вход агента элемента в подписку Claude Code.") },
      { slug: "terminal", words: w("Terminal", "A live Claude Code in the element's folder: started and stopped here.", "Терминал", "Живой Claude Code в папке элемента: запускается и останавливается здесь.") },
      // Владелец 2026-10-01: «кнопку развёртывания мы находим внизу а это очень важная кнопка … подними её вверх и установи сразу
      // под кнопкой терминал».
      { slug: "deployments", words: w("Deployments", "Versions of the element and a way back to a working one.", "Развёртывания", "Версии элемента и путь назад к работающей.") },
      { slug: "telegram", words: w("Telegram bot", "A bot that talks to the same agent session.", "Telegram бот", "Бот, который говорит с той же сессией агента.") },
      { slug: "environment", words: w("Environment variables", "Keys and settings the element reads at start.", "Переменные окружения", "Ключи и настройки, которые элемент читает при старте.") },
    ],
  },
  {
    // 406-4 (владелец 2026-10-05, карта меню 406-2): «Коннекторы» → «Связи (A2A)»; адрес раздела прежний.
    slug: "connectors",
    words: w("Links (A2A)", "What this element offers its neighbours, what it needs from them, and how to reach it.", "Связи (A2A)", "Что элемент предлагает соседям, что ему нужно от них и как к нему обратиться."),
    pages: [
      { slug: "api", words: w("API", "The element's HTTP doors.", "API", "HTTP-двери элемента.") },
      { slug: "mcp", words: w("MCP", "The element's tools for agents over MCP.", "MCP", "Инструменты элемента для агентов по MCP.") },
      { slug: "a2a", words: w("A2A", "What the element can do, what it needs from neighbours, and who may call it.", "A2A", "Что элемент умеет, что ему нужно от соседей и кто вправе его вызывать.") },
      // 406-4: виден только у элемента, чей паспорт объявляет каталог (`a2a.catalog`).
      { slug: "catalog", needs: "catalog", words: w("Catalog", "What the element can give away: find, get, contribute.", "Каталог", "Что элемент умеет отдать: найти, получить, внести.") },
    ],
  },
  {
    // 406-4: «Web3 store» → «Сеть (M2M)»; адрес раздела прежний.
    slug: "web3-store",
    words: w("Network (M2M)", "Not found in this node is not «does not exist»: the way out to other nodes.", "Сеть (M2M)", "Не нашлось в узле — не значит, что не существует: выход к другим узлам."),
    pages: [
      { slug: "find", words: w("Find in the network", "Look for a ready element on other nodes before building one.", "Найти в сети", "Найти готовый элемент на других узлах, прежде чем строить свой.") },
      { slug: "publish", words: w("Offer to the network", "How this element will be announced to other nodes.", "Отправить в сеть", "Как этот элемент будет объявлен другим узлам.") },
    ],
  },
  {
    slug: "product-design",
    words: w("Product design", "What the element should become, before its code.", "Проектирование продукта", "Каким должен стать элемент — до его кода."),
    pages: [
      { slug: "quiz", words: w("Product quiz", "Questions that shape the element.", "Продуктовый квиз", "Вопросы, из которых складывается элемент.") },
      { slug: "from-nextjs", words: w("Move from another Next.js", "Bringing an existing Next.js project into the element.", "Переезд из другого Next.js", "Перенос существующего проекта Next.js в элемент.") },
      { slug: "from-framework", words: w("Move from another framework", "Bringing a project built on another framework.", "Переезд из другого фреймворка", "Перенос проекта на другом фреймворке.") },
    ],
  },
  {
    slug: "documents",
    words: w("Documents", "The element's instruction and the record of its development.", "Документы", "Инструкция элемента и запись о его разработке."),
    // 412-2 (владелец 2026-10-06): документы разработки вернулись — из настоящих файлов элемента, а не заглушками.
    pages: [
      { slug: "instruction", doc: { file: "CLAUDE.md" }, words: w("Main instruction", "What the element's agent reads first.", "Главная инструкция", "То, что агент элемента читает первым.") },
      { slug: "passport", doc: { file: "OWN-SERVICE-PROPS.json" }, words: w("Passport", "What the element is, can do and needs: its A2A card, integrations and cron.", "Паспорт", "Что элемент такое, что умеет и что ему нужно: визитка A2A, интеграции и крон.") },
      { slug: "readme", doc: { file: "development-docs/README.md" }, words: w("Documents index", "Every development document, who writes it and when it is opened.", "Оглавление документов", "Все документы разработки: кто пишет и когда открывать.") },
      { slug: "current-step", doc: { file: "development-docs/current-step.md" }, words: w("Current step", "Where the work stands now; the agent reads it on every wake.", "Текущий шаг", "Где работа сейчас; агент читает его при каждом пробуждении.") },
      { slug: "steps-new", doc: { file: "development-docs/steps-new", folder: true }, words: w("Steps: planned", "Steps the person agreed to and not started yet.", "Шаги: план", "Согласованные и ещё не начатые шаги.") },
      { slug: "steps-done", doc: { file: "development-docs/steps-done", folder: true }, words: w("Steps: done", "Closed steps with their commit and proof.", "Шаги: завершённые", "Закрытые шаги с коммитом и доказательством.") },
      { slug: "anti-patterns", doc: { file: "development-docs/anti-patterns.md" }, words: w("Anti-patterns", "Dead ends already paid for.", "Антипаттерны", "Тупики, за которые уже заплачено.") },
      { slug: "skill-decisions", doc: { file: "development-docs/owner-decisions-on-skill-changes.md" }, words: w("Decisions on skills", "What a self-review proposed and what the person answered.", "Решения о навыках", "Что предложил разбор и что ответил человек.") },
      { slug: "task-add", words: w("Add a task", "A task for the element's agent.", "Добавить задание", "Задание агенту элемента.") },
    ],
  },
  {
    slug: "process",
    words: w("Process", "What the element does while it works.", "Процесс", "Что элемент делает, пока работает."),
    pages: [
      // 412-6 (владелец 2026-10-06): заказы — работа элемента для других по A2A; сводки вне git, без персональных данных.
      { slug: "orders", words: w("Orders", "Work the element did for other agents: a summary of each order and the conversation behind it.", "Заказы", "Работа, которую элемент сделал для других агентов: сводка каждого заказа и беседа за ней.") },
      { slug: "subscriptions", words: w("Subscriptions", "Outside services this element may use.", "Подписки", "Внешние сервисы, которыми может пользоваться элемент.") },
      { slug: "cron", words: w("Cron automations", "Work that runs on a schedule.", "Крон автоматизации", "Работа, которая идёт по расписанию.") },
    ],
  },
  // 325 (слово владельца 2026-09-27): обязательная страница внизу — «Настройки», так называемый Danger zone. Всегда последняя.
  {
    slug: "settings",
    words: w("Settings", "The element's danger zone and the settings of its own site.", "Настройки", "Опасная зона элемента и настройки его собственного сайта."),
    // 328 (слово владельца 2026-09-28): «на вкладке настройки увидеть выпадающий список … страница настройки, которые уже
    // существуют, и страница конфигуратора». Конфигуратор живёт в самом элементе (выбор «б» 324-8) — страница ядра открывает
    // его на главном адресе в новой вкладке (выбор «б» 2026-09-28: во встроенном окне свой домен не получил бы билет входа).
    pages: [
      { slug: "danger-zone", words: w("Danger zone", "The element's description in the core, its address, its main mirror, links to the node and deleting it.", "Опасная зона", "Описание элемента в ядре, его адрес, главное зеркало, связи с узлом и удаление.") },
      { slug: "site-settings", words: w("Site settings", "The name, texts, search settings, images and languages of the element's own site.", "Настройки сайта", "Название, тексты, настройки для поиска, картинки и языки собственного сайта элемента.") },
    ],
  },
]

export type TreeLang = "en" | "ru"
export const treeLang = (lang: string): TreeLang => (lang === "ru" ? "ru" : "en")

/** Страница дерева по пути `[раздел, страница?]`; нет такой — `null`. */
export function findTreePage(path: string[]): { section: TreePage; page: TreePage | null } | null {
  if (path.length === 0 || path.length > 2) return null
  const section = ITEM_TREE.find((s) => s.slug === path[0])
  if (!section) return null
  if (path.length === 1) return { section, page: null }
  const page = section.pages?.find((p) => p.slug === path[1]) ?? null
  return page ? { section, page } : null
}
