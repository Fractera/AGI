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
// 435 (владелец 2026-10-08): `about` — абзацы под заголовком страницы, когда одной строки `lead` мало; `group` — страница уходит
// в раскрывающуюся группу раздела (в меню и в списке страниц раздела), её адрес не меняется.
export type TreePage = {
  slug: string; words: Record<"en" | "ru", TreeWords>; pages?: TreePage[]; needs?: "catalog"; doc?: { file: string; folder?: boolean; deep?: boolean }
  about?: Record<"en" | "ru", string[]>; group?: TreeGroup
}

const w = (enTitle: string, enLead: string, ruTitle: string, ruLead: string): Record<"en" | "ru", TreeWords> => ({
  en: { title: enTitle, lead: enLead },
  ru: { title: ruTitle, lead: ruLead },
})

// 435-3, слово владельца 2026-10-08: «API и MCP … уважить в один раскрывающийся список техническое описание»; «каталог …
// переносится также внутрь».
export type TreeGroup = "technical"
export const TREE_GROUPS: Record<TreeGroup, Record<"en" | "ru", string>> = {
  technical: { en: "Technical description", ru: "Техническое описание" },
}

// 435-1: что такое элемент и узел — одними словами для обоих разделов, где человеку это нужно знать.
const ELEMENT_AND_NODE = {
  en: "An element is one self-contained thing in your node: a site, an app, an agent or a service. It has its own folder, its own address on the internet, its own repository and its own agent that builds it. To other elements it is also a microservice: it answers its neighbours and asks them for help. Your node is all your elements on this computer together with the core that links them; the node belongs to you and works without Fractera.",
  ru: "Элемент — это одна самостоятельная вещь вашего узла: сайт, приложение, агент или служба. У него своя папка, свой адрес в интернете, свой репозиторий и свой агент, который его строит. Для других элементов он ещё и микросервис: отвечает соседям и просит их о помощи. Узел — это все ваши элементы на этом компьютере вместе с ядром, которое их связывает; узел принадлежит вам и работает без Fractera.",
}

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
      { slug: "deployments", words: w("Preview & Deploy", "See a new version before visitors do, deploy it, or go back to a working one.", "Предпросмотр и развёртывание", "Посмотреть новую версию до посетителей, развернуть её или вернуться к работающей.") },
      { slug: "telegram", words: w("Telegram bot", "A bot that talks to the same agent session.", "Telegram бот", "Бот, который говорит с той же сессией агента.") },
      { slug: "environment", words: w("Environment variables", "Keys and settings the element reads at start.", "Переменные окружения", "Ключи и настройки, которые элемент читает при старте.") },
    ],
  },
  {
    // 406-4 (владелец 2026-10-05, карта меню 406-2): «Коннекторы» → «Связи (A2A)»; адрес раздела прежний.
    slug: "connectors",
    // 435-3 (владелец 2026-10-08): главная раздела объясняет элемент, узел и два рода сведений — рабочий процесс.
    words: w("Links (A2A)", "How elements find each other, and to whom this element gives its work.", "Связи (A2A)", "Как элементы находят друг друга и кому этот элемент даёт свою работу."),
    about: {
      en: [
        ELEMENT_AND_NODE.en,
        "This section holds two kinds of information. The first is how elements find each other inside the node: the core keeps the list of every element and what it can do, and an element that lacks something finds the neighbour who can and talks to it directly.",
        "The second is how and to whom this element gives access to its work: what it can do, what it returns, who may use it, at what price and with what limit.",
        "All of this is the working process — what the element does once it runs. The technical details — HTTP doors, MCP tools and the catalog — are collected below in «Technical description».",
      ],
      ru: [
        ELEMENT_AND_NODE.ru,
        "Здесь два рода сведений. Первый — как элементы находят друг друга внутри узла: ядро держит список всех элементов и того, что каждый умеет, и элемент, которому чего-то не хватает, находит соседа, который это умеет, и обращается к нему напрямую.",
        "Второй — как и кому этот элемент даёт доступ к своей работе: что он умеет, что возвращает, кому это доступно, по какой цене и с каким лимитом.",
        "Всё это — рабочий процесс: то, что элемент делает, когда уже работает. Технические подробности — HTTP-двери, инструменты MCP и каталог — собраны ниже в «Техническом описании».",
      ],
    },
    pages: [
      { slug: "a2a", words: w("A2A", "The showcase: what the element can do, what it returns, to whom and on what terms.", "A2A", "Витрина: что элемент умеет, что возвращает, кому и на каких условиях.") },
      { slug: "api", group: "technical", words: w("API", "The element's HTTP doors.", "API", "HTTP-двери элемента.") },
      { slug: "mcp", group: "technical", words: w("MCP", "The element's tools for agents over MCP.", "MCP", "Инструменты элемента для агентов по MCP.") },
      // 435-3, выбор владельца «Показать оба»: сверху элементы этого узла, ниже — каталог самого элемента, если он его объявляет.
      { slug: "catalog", group: "technical", words: w("Catalog", "The elements of this node in short, and what this element can give away.", "Каталог", "Элементы этого узла коротко и что умеет отдать этот элемент.") },
    ],
  },
  {
    // 406-4: «Web3 store» → «Сеть (M2M)»; адрес раздела прежний.
    slug: "web3-store",
    // 435-2 (владелец 2026-10-08): раздел — строительный процесс: распространение и продажа элемента целиком.
    words: w("Network (M2M)", "Here the element goes beyond your computer: find the same kind of element on the network, or offer this one.", "Сеть (M2M)", "Здесь элемент выходит за пределы вашего компьютера: найти в сети такой же элемент или предложить этот."),
    about: {
      en: [
        ELEMENT_AND_NODE.en,
        "The network is the nodes of other people. People come here for one of two things: to find a ready element before building their own, or to offer this element to others — free or for money.",
        "Everything in this section is the build process: it is about the element as a whole, not about what it does while it works. What it can do and on what terms is in «Links (A2A)».",
      ],
      ru: [
        ELEMENT_AND_NODE.ru,
        "Сеть — это узлы других людей. Сюда приходят с одной из двух целей: найти готовый элемент, прежде чем строить свой, или предложить этот элемент другим — бесплатно или за деньги.",
        "Всё в этом разделе — строительный процесс: речь об элементе целиком, а не о том, что он делает, когда работает. Что он умеет и на каких условиях — в разделе «Связи (A2A)».",
      ],
    },
    pages: [
      {
        slug: "find",
        words: w("Find in the network", "Look for a ready element on other nodes before building your own.", "Найти в сети", "Найти готовый элемент на других узлах, прежде чем строить свой."),
        about: {
          en: ["An element is looked for in two ways: through AI search engines built on Cloudflare, and through Fractera's own search, where nodes find each other directly, without a central server."],
          ru: ["Элемент ищется двумя путями: через ИИ-поисковики на базе Cloudflare и через собственный поиск Fractera, где узлы находят друг друга напрямую, без центрального сервера."],
        },
      },
      {
        slug: "publish",
        words: w("Offer to the network", "Offer this whole element to other people: share it free or sell it.", "Отправить в сеть", "Предложить этот элемент целиком другим людям: распространять бесплатно или продавать."),
        about: {
          en: ["Here the price of the element itself is set — the whole site, app or agent with its code and design. This is not the price of its skills: what the element's work costs others (an article, an image, a message in a dialog) is set in «Links (A2A)»."],
          ru: ["Здесь назначается цена самого элемента — сайта, приложения или агента целиком, с его кодом и устройством. Это не цена его навыков: сколько стоит работа элемента для других (статья, изображение, сообщение в диалоге), задаётся в «Связи (A2A)»."],
        },
      },
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
      // 416 (владелец 2026-10-06): навыки и хуки вернулись в меню — из настоящих папок агента элемента, чтобы смотреть их во время
      // разработки (убраны в 406-4 заглушками, без объяснения владельцу).
      { slug: "skills", doc: { file: ".claude/skills", folder: true, deep: true }, words: w("Skills", "The skills the element's agent carries: when each is used and how.", "Навыки", "Навыки агента элемента: когда каждый вызывается и как работает.") },
      { slug: "hooks", doc: { file: ".claude/hooks", folder: true }, words: w("Hooks", "Commands the agent's tools run on their own events.", "Хуки", "Команды, которые инструменты агента запускают на своих событиях.") },
      { slug: "passport", doc: { file: "OWN-SERVICE-PROPS.json" }, words: w("Passport", "What the element is, can do and needs: its A2A card, integrations and cron.", "Паспорт", "Что элемент такое, что умеет и что ему нужно: визитка A2A, интеграции и крон.") },
      // 417 (владелец 2026-10-06): новый паспорт строится рядом со старым, объекты переносятся по одному — папка с JSON, README
      // и сервером; страница показывает README (зачем файл) и JSON.
      { slug: "own-service-props", doc: { file: "OWN-SERVICE-PROPS", folder: true }, words: w("New passport", "What the element tells the outside about itself: why the file exists, and the file.", "Новый паспорт", "Что элемент сообщает о себе снаружи: зачем этот файл и сам файл.") },
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
