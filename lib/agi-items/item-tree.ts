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
// 472 (владелец 2026-10-13): «в наличии или отсутствие этих инструментов таких как чат H2H его состояние как правда или ложь должны
// передаваться в own-service-props.json». Флаги паспорта элемента `messengers` — h2a · h2h · a2a; `needs` — пункт есть, только когда
// флаг включён; `unless` — пункт есть, только когда флаг ВЫКЛЮЧЕН (Telegram-бот остаётся в «Строительстве» у элементов без H2A).
export type Messenger = "h2a" | "h2h" | "a2a"
export type TreePage = {
  slug: string; words: Record<"en" | "ru", TreeWords>; pages?: TreePage[]; needs?: "catalog" | Messenger; unless?: Messenger
  doc?: { file: string; folder?: boolean; deep?: boolean }
  about?: Record<"en" | "ru", string[]>; group?: TreeGroup
}

const w = (enTitle: string, enLead: string, ruTitle: string, ruLead: string): Record<"en" | "ru", TreeWords> => ({
  en: { title: enTitle, lead: enLead },
  ru: { title: ruTitle, lead: ruLead },
})

// 435-3, слово владельца 2026-10-08: «API и MCP … уважить в один раскрывающийся список техническое описание»; «каталог …
// переносится также внутрь».
// 451-2 (владелец 2026-10-11): i2i и f2f — строительный процесс, их вкладки — группами внутри «Строительства».
export type TreeGroup = "technical" | "i2i" | "f2f"
export const TREE_GROUPS: Record<TreeGroup, Record<"en" | "ru", string>> = {
  technical: { en: "Technical description", ru: "Техническое описание" },
  i2i: { en: "Inside the node (i2i)", ru: "Внутри узла (i2i)" },
  f2f: { en: "Exchange with Fractera (f2f)", ru: "Обмен с Fractera (f2f)" },
}

// 451-2: вкладки, переехавшие в «Строительство»; старый адрес переадресуется на новый (ссылки и закладки не ломаются).
export const MOVED_PAGES: Record<string, string> = {
  "connectors/catalog": "build/catalog",
  "connectors/api": "build/api",
  "connectors/mcp": "build/mcp",
  "web3-store": "build",
  "web3-store/find": "build/find",
  "web3-store/publish": "build/publish",
}

// 472: что у элемента есть — для условий `needs`/`unless`. Один ответ для меню, маршрута и списка страниц раздела.
export type TreeContext = { catalog: boolean; messengers: Record<Messenger, boolean> }
export function treeVisible(p: TreePage, c: TreeContext): boolean {
  if (p.needs === "catalog" && !c.catalog) return false
  if (p.needs && p.needs !== "catalog" && !c.messengers[p.needs]) return false
  if (p.unless && c.messengers[p.unless]) return false
  return true
}
// 472: у элемента с H2A бот живёт в H2A — старый адрес ведёт туда (у элемента без H2A бот остаётся в «Строительстве»).
export const MOVED_WITH: Record<string, { to: string; when: Messenger }> = {
  "build/telegram": { to: "h2a/telegram", when: "h2a" },
}

// 472-2: дашборд раздела — счётчики, таблица и под ней надпись про терминал (страница элемента, `element-dashboard.i18n.ts`).
const dashboard = (en: string, ru: string): TreePage => ({ slug: "dashboard", words: w("Dashboard", en, "Дашборд", ru) })

// 435-1: что такое элемент и узел — одними словами для обоих разделов, где человеку это нужно знать.
const ELEMENT_AND_NODE = {
  en: "An element is one self-contained thing in your node: a site, an app, an agent or a service. It has its own folder, its own address on the internet, its own repository and its own agent that builds it. To other elements it is also a microservice: it answers its neighbours and asks them for help. Your node is all your elements on this computer together with the core that links them; the node belongs to you and works without Fractera.",
  ru: "Элемент — это одна самостоятельная вещь вашего узла: сайт, приложение, агент или служба. У него своя папка, свой адрес в интернете, свой репозиторий и свой агент, который его строит. Для других элементов он ещё и микросервис: отвечает соседям и просит их о помощи. Узел — это все ваши элементы на этом компьютере вместе с ядром, которое их связывает; узел принадлежит вам и работает без Fractera.",
}

export const ITEM_TREE: TreePage[] = [
  { slug: "preview", words: w("Live site", "The element's own site as it runs now and a visitor sees it.", "Живой сайт", "Сайт элемента таким, каким он работает сейчас и каким его видит посетитель.") }, // 393: «Preview» → «Живой сайт» (владелец 2026-10-04)
  // 472 (владелец 2026-10-13): «Под вкладкой живой сайт создадим вкладку h2A … Ниже … H2H … Ну и ниже ты размещаешь нашего а2а».
  {
    slug: "h2a",
    needs: "h2a",
    words: w("H2A", "How you talk to this element's agent.", "H2A", "Как вы общаетесь с агентом этого элемента."),
    about: {
      en: [
        "This section is about how a person talks to their own agent inside this element. Here are the ways to reach it: Telegram works by default, and you can build any other messenger with the terminal.",
        "The native chat is a conversation with the element's agent right here, for those who would rather not use Telegram.",
      ],
      ru: [
        "Здесь рассказывается о том, как человек общается с собственным агентом внутри этого элемента. Здесь собраны способы связи: по умолчанию работает Telegram, а любые другие мессенджеры вы можете создать с помощью терминала.",
        "Нативный чат — разговор с агентом элемента прямо здесь, для тех, кто не хочет пользоваться Telegram.",
      ],
    },
    pages: [
      {
        slug: "native-chat",
        words: w("Native chat", "Talk to the element's agent right here, without Telegram.", "Нативный чат", "Разговор с агентом элемента прямо здесь, без Telegram."),
        about: {
          en: ["This chat will replace Telegram for those who do not want to use it: you write to the element's agent on this page. It is programmed in the next steps."],
          ru: ["Этот чат заменит Telegram тем, кто не хочет им пользоваться: вы пишете агенту элемента прямо на этой странице. Он программируется следующими шагами."],
        },
      },
      { slug: "telegram", needs: "h2a", words: w("Telegram bot", "A bot that talks to the same agent session.", "Telegram бот", "Бот, который говорит с той же сессией агента.") },
      dashboard("Who you talk to through this element's agent, in short.", "С кем вы общаетесь через агента этого элемента — коротко."),
    ],
  },
  {
    slug: "h2h",
    needs: "h2h",
    words: w("H2H", "Talking to other people — through the agents.", "H2H", "Общение с другими людьми — через агентов."),
    about: {
      en: [
        "Here is the native way for people to talk to each other: your close friends or acquaintances who run their own agent on Fractera.",
        "The connection goes without any outside server — unlike WhatsApp, for example — and is encrypted with SSL (TLS) certificates, so your conversations stay fully confidential for as long as the SSL standards themselves stay reliable.",
        "Its special feature is reaching important people you could never contact otherwise. The messenger starts with a preliminary conversation through your agent: it contacts the important person's agent and tries to prove why you need to talk. That agent brings the request to its owner with its assessment, and the person decides. If they agree, they appear in your contact list and you talk to them just as you would to a friend.",
        "Above is the native messenger; below is the Telegram bot.",
      ],
      ru: [
        "Здесь — нативный способ связи между людьми: это могут быть ваши близкие друзья или знакомые, которые развернули своего агента в инфраструктуре Fractera.",
        "Соединение идёт без какого-либо внешнего сервера — в отличие, например, от WhatsApp — и шифруется сертификатами SSL (TLS), поэтому ваши разговоры остаются полностью конфиденциальными, пока надёжны сами стандарты SSL.",
        "Особенность этого способа — возможность связаться с важными людьми, до которых иначе не достучаться. Мессенджер начинает с предварительного разговора через вашего агента: он связывается с агентом важного человека и старается доказать, зачем вам нужен разговор. Тот агент приносит обращение своему владельцу со своей оценкой, а решает сам человек. Если он согласен, он появляется в вашем списке контактов, и вы общаетесь с ним так же, как с другом.",
        "Выше — нативный мессенджер, ниже — Telegram-бот.",
      ],
    },
    pages: [
      {
        slug: "native",
        words: w("Native messenger", "Your contacts and conversations with them, with no outside server.", "Нативный мессенджер", "Ваши контакты и разговоры с ними — без внешнего сервера."),
        about: {
          en: ["Contacts you already know, and the people whose agents agreed to bring your request — each with its conversation. It is programmed in the next steps."],
          ru: ["Контакты, которых вы знаете, и люди, чьи агенты согласились передать ваше обращение, — у каждого свой разговор. Мессенджер программируется следующими шагами."],
        },
      },
      {
        slug: "telegram",
        words: w("Telegram bot", "Talking to people through Telegram.", "Telegram бот", "Общение с людьми через Telegram."),
        about: {
          en: ["How Telegram serves conversations between people is still being decided."],
          ru: ["Как Telegram будет служить разговорам людей — ещё решается."],
        },
      },
      dashboard("Your contacts and conversations, in short.", "Ваши контакты и разговоры — коротко."),
    ],
  },
  // 472: A2A — сразу под H2H, выше «Строительства» (владелец: «Ну и ниже ты размещаешь нашего а2а страницу»).
  {
    // 406-4 (владелец 2026-10-05, карта меню 406-2): «Коннекторы» → «Связи (A2A)»; адрес раздела прежний. 451-2 (2026-10-11): «A2A» — только рабочий процесс.
    slug: "connectors",
    // 435-3 (владелец 2026-10-08): главная раздела объясняет элемент, узел и два рода сведений — рабочий процесс.
    words: w("A2A", "What this element does for other agents, to whom, at what price — and the deals it made.", "A2A", "Что этот элемент делает для других агентов, кому и по какой цене — и сделки, которые он заключил."),
    about: {
      en: [
        ELEMENT_AND_NODE.en,
        "Here this element's agent talks to other agents. We are building a messenger in which the element has counterparts — agents it talks to: the chat with each one opens the history of your dealings, and tables and summaries appear right in the conversation. We move from working with tables to working through chat.",
        "This section is the working process over a2a: what this element does for other agents once it runs — what it can do, what it returns, who may use it, at what price and with what limit — and the deals it has made.",
        "Over a2a a Fractera element meets Lagrix exactly like any other framework, site or agent without a UI: no advantage, no handicap. How elements of this node agree on connectors (i2i) and how whole elements are exchanged with other Fractera projects (f2f) is the build process — those tabs are in «Build».",
      ],
      ru: [
        ELEMENT_AND_NODE.ru,
        "Здесь агент этого элемента общается с другими агентами. Мы строим мессенджер, в котором у элемента есть контрагенты — собеседники-агенты: в чате с каждым открывается история общения, а таблицы и сводки появляются прямо в разговоре. От работы с таблицами мы переходим к работе через чат.",
        "Этот раздел — рабочий процесс по a2a: что элемент делает для других агентов, когда уже работает, — что умеет, что возвращает, кому доступно, по какой цене и с каким лимитом, — и сделки, которые он заключил.",
        "По a2a элемент Fractera встречается с Lagrix ровно как любой другой фреймворк, сайт или агент без интерфейса: без преимуществ и недостатков. Как элементы этого узла договариваются о connector (i2i) и как элементы целиком обмениваются с другими проектами Fractera (f2f) — строительный процесс, эти вкладки в «Строительстве».",
      ],
    },
    pages: [
      // 472 (владелец 2026-10-13): сверху — нативное взаимодействие, Telegram и дашборд; прежние страницы — ниже (выбор «Оставить ниже новых»).
      {
        slug: "native", needs: "a2a",
        words: w("Native messenger", "The element's counterparts — other agents — and the history with each of them.", "Нативный мессенджер", "Контрагенты элемента — другие агенты — и история общения с каждым."),
        about: {
          en: ["Each counterpart is a chat: what was asked, what was done, the deal and its result — tables and summaries right in the conversation. It is programmed in the next steps."],
          ru: ["Каждый контрагент — это чат: что спросили, что сделали, сделка и её итог — таблицы и сводки прямо в разговоре. Мессенджер программируется следующими шагами."],
        },
      },
      {
        slug: "telegram", needs: "a2a",
        words: w("Telegram", "Following the element's dealings with other agents in Telegram.", "Telegram", "Следить за делами элемента с другими агентами в Telegram."),
        about: {
          en: ["How Telegram serves the element's work with other agents is still being decided."],
          ru: ["Как Telegram будет служить работе элемента с другими агентами — ещё решается."],
        },
      },
      { ...dashboard("Counterparts and deals of this element, in short.", "Контрагенты и сделки этого элемента — коротко."), needs: "a2a" },
      { slug: "a2a", words: w("A2A", "The showcase: what the element can do, what it returns, to whom and on what terms.", "A2A", "Витрина: что элемент умеет, что возвращает, кому и на каких условиях.") },
      // 436-2 (владелец 2026-10-09: «вкладка заказа … целиком относится к вкладке a2a»): «Процесс → Заказы» → «Связи (A2A) → Сделки».
      { slug: "deals", words: w("Deals", "Work this element did for other agents over A2A: a summary of each deal and the conversation behind it.", "Сделки", "Работа, которую элемент сделал для других агентов по A2A: сводка каждой сделки и беседа за ней.") },
    ],
  },
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
      // 472: у элемента с H2A бот переехал в H2A (`MOVED_WITH`); здесь он остаётся для элементов без H2A.
      { slug: "telegram", unless: "h2a", words: w("Telegram bot", "A bot that talks to the same agent session.", "Telegram бот", "Бот, который говорит с той же сессией агента.") },
      { slug: "environment", words: w("Environment variables", "Keys and settings the element reads at start.", "Переменные окружения", "Ключи и настройки, которые элемент читает при старте.") },
      // 451-2 (владелец 2026-10-11): i2i — элементы узла договариваются о connector через API; f2f — обмен элементами через Lagrix.
      // 452 (владелец 2026-10-11: «ты не создал для них страниц … коротко понятно ты ввёл человека в курс дела»): вводная страница группы.
      {
        slug: "i2i",
        group: "i2i",
        words: w("How i2i works", "How the elements of this node agree to work together without asking a model every time.", "Как работает i2i", "Как элементы этого узла договариваются работать вместе, не спрашивая модель каждый раз."),
        about: {
          en: [
            "i2i is how the elements of one node work together. The core keeps the catalog of every element and what it can do; an element that lacks something finds the neighbour who can.",
            "The first time, the two agents talk as in A2A: what is needed, in what form, with what answer. Then they fix the agreement as a connector — one plain API call between the elements. From then on the work runs over that call, and no language model is asked again: it is faster, costs no subscription and gives the same answer every time.",
            "This is the build process: a connector is code the element's agent writes and you accept like any other change. The tabs of this group show what the node and this element offer for it: the catalog, the element's HTTP doors (API) and its tools for agents (MCP).",
          ],
          ru: [
            "i2i — это то, как элементы одного узла работают вместе. Ядро держит каталог всех элементов и того, что каждый умеет; элемент, которому чего-то не хватает, находит соседа, который это умеет.",
            "В первый раз два агента разговаривают как в A2A: что нужно, в каком виде, с каким ответом. Затем договорённость закрепляется как connector — один обычный вызов API между элементами. Дальше работа идёт по этому вызову, и языковую модель больше не спрашивают: так быстрее, не тратится подписка, и ответ каждый раз один и тот же.",
            "Это строительный процесс: connector — код, который пишет агент элемента и который вы принимаете, как любую другую правку. Вкладки этой группы показывают, что для этого есть у узла и у элемента: каталог, HTTP-двери элемента (API) и его инструменты для агентов (MCP).",
          ],
        },
      },
      { slug: "api", group: "i2i", words: w("API", "The element's HTTP doors.", "API", "HTTP-двери элемента.") },
      { slug: "mcp", group: "i2i", words: w("MCP", "The element's tools for agents over MCP.", "MCP", "Инструменты элемента для агентов по MCP.") },
      // 435-3, выбор владельца «Показать оба»: сверху элементы этого узла, ниже — каталог самого элемента, если он его объявляет.
      { slug: "catalog", group: "i2i", words: w("Catalog", "The elements of this node in short, and what this element can give away — where i2i connectors start.", "Каталог", "Элементы этого узла коротко и что умеет отдать этот элемент — отсюда начинаются connector i2i.") },
      {
        slug: "f2f",
        group: "f2f",
        words: w("How f2f works", "How whole elements travel between Fractera projects through Lagrix.", "Как работает f2f", "Как элементы целиком переходят между проектами Fractera через Lagrix."),
        about: {
          en: [
            "f2f is how Fractera projects exchange whole elements — a site, an app, an agent or a service with its code and design — so that a builder can take a ready element instead of building it again.",
            "It goes through Lagrix, an open network with no central server. An element is announced there with a signed announcement, the same way agents are; independent super-nodes collect the announcements and build search results by open rules that are the same for everyone (Lagrix document 17).",
            "What f2f adds is a technical card: what the element is made of, so that another project can install it — the starter and version it was born from, the framework, the services it needs, its doors, the names (never the values) of its environment variables, its licence and where its code is (Lagrix document 20). Keys, passwords and personal data never travel.",
            "If an exchange is paid, Lagrix settles it like any deal: the money waits in an escrow contract, the provider receives 95% when the deal closes, 5% is the network fee (Lagrix document 04). Fractera has no advantage in Lagrix: for the network it is one project among others.",
            "The tabs of this group: find a ready element in other Fractera projects, or offer this one. Documents: https://github.com/lagrix-dev/lagrix",
          ],
          ru: [
            "f2f — это то, как проекты Fractera обмениваются элементами целиком — сайтом, приложением, агентом или службой с их кодом и оформлением, — чтобы строитель мог взять готовый элемент, а не строить его заново.",
            "Обмен идёт через Lagrix — открытую сеть без центрального сервера. Элемент объявляется там подписанным объявлением, так же как агенты; независимые супер-узлы собирают объявления и строят выдачу по открытым правилам, одинаковым для всех (документ Lagrix 17).",
            "f2f добавляет техническую карточку: из чего сделан элемент, чтобы другой проект мог его поставить, — стартовый шаблон и версия, из которых он рождён, фреймворк, нужные ему службы, его двери, имена (никогда не значения) переменных окружения, лицензия и где лежит код (документ Lagrix 20). Ключи, пароли и персональные данные не передаются никогда.",
            "Если обмен платный, Lagrix рассчитывает его как любую сделку: деньги ждут в контракте условного депонирования, исполнитель получает 95 % при закрытии, 5 % — комиссия сети (документ Lagrix 04). У Fractera в Lagrix нет преимуществ: для сети это один проект среди других.",
            "Вкладки этой группы: найти готовый элемент в других проектах Fractera или предложить этот. Документы: https://github.com/lagrix-dev/lagrix",
          ],
        },
      },
      {
        slug: "find",
        group: "f2f",
        words: w("Find a ready element", "Look for a ready element in other Fractera projects through Lagrix (f2f) before building your own.", "Найти готовый элемент", "Найти готовый элемент в других проектах Fractera через Lagrix (f2f), прежде чем строить свой."),
        about: {
          en: ["An element is looked for in two ways: through Lagrix discovery (f2f) — the same discovery as for agents, with the technical characteristics a build needs — and through AI search engines."],
          ru: ["Элемент ищется двумя путями: через обнаружение Lagrix (f2f) — то же, что для агентов, плюс технические характеристики, нужные строительству, — и через ИИ-поисковики."],
        },
      },
      {
        slug: "publish",
        group: "f2f",
        words: w("Offer the element", "Offer this whole element to other Fractera projects through Lagrix (f2f): free or for money.", "Предложить элемент", "Предложить этот элемент целиком другим проектам Fractera через Lagrix (f2f): бесплатно или за деньги."),
        about: {
          en: ["Here the price of the element itself is set — the whole site, app or agent with its code and design. This is not the price of its skills: what the element's work costs others (an article, an image, a message in a dialog) is set in «A2A»."],
          ru: ["Здесь назначается цена самого элемента — сайта, приложения или агента целиком, с его кодом и устройством. Это не цена его навыков: сколько стоит работа элемента для других (статья, изображение, сообщение в диалоге), задаётся в «A2A»."],
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
      // 435-5 (владелец 2026-10-08: «Глоссари это неотъемлемая часть архитектуры документов которые должна существовать в каждом
      // элементе»): полный набор документов элемента — пункты появляются, потому что файлы есть с рождения.
      { slug: "glossary", doc: { file: "development-docs/glossary.md" }, words: w("Glossary", "One meaning per word, with the person's words next to each term.", "Глоссарий", "Одно значение у каждого слова, рядом — как его говорит человек.") },
      { slug: "pre-steps", doc: { file: "development-docs/pre-steps", folder: true }, words: w("Intake", "Building requests not started at once, recorded verbatim.", "Приёмная заявок", "Заявки на строительство, не начатые сразу, — дословно.") },
      { slug: "backlog", doc: { file: "development-docs/backlog.md" }, words: w("Backlog", "Built but not explained, built halfway, or promised.", "Backlog", "Построенное, но не объяснённое, недостроенное или обещанное.") },
      { slug: "cancelled", doc: { file: "development-docs/cancelled.md" }, words: w("Cancelled", "What was dropped, by whose word, and what replaced it.", "Отменённое", "Что отменено, чьим словом и что пришло взамен.") },
      { slug: "anti-patterns", doc: { file: "development-docs/anti-patterns.md" }, words: w("Anti-patterns", "Dead ends already paid for.", "Антипаттерны", "Тупики, за которые уже заплачено.") },
      { slug: "reports", doc: { file: "development-docs/reports", folder: true }, words: w("Reports", "One failure explained, or one finished capability described.", "Отчёты", "Разбор одного отказа или описание готовой способности.") },
      { slug: "proofs", doc: { file: "development-docs/proofs", folder: true }, words: w("Proofs", "How parts of the instruction and skills were proven live.", "Доказательства", "Как части инструкции и навыков доказаны вживую.") },
      { slug: "translation-debt", doc: { file: "development-docs/translation-debt.md" }, words: w("Translation debt", "Texts still in one language, and why.", "Долги по переводам", "Тексты, которые пока на одном языке, и почему.") },
      { slug: "skill-decisions", doc: { file: "development-docs/owner-decisions-on-skill-changes.md" }, words: w("Decisions on skills", "What a self-review proposed and what the person answered.", "Решения о навыках", "Что предложил разбор и что ответил человек.") },
      { slug: "task-add", words: w("Add a task", "A task for the element's agent.", "Добавить задание", "Задание агенту элемента.") },
    ],
  },
  {
    slug: "process",
    words: w("Process", "What the element does while it works.", "Процесс", "Что элемент делает, пока работает."),
    pages: [
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
      // 443-5 (слово владельца 2026-10-11): «настройка домена находится на вкладке опасная зона … её нужно вытащить в настройки,
      // домен. Поместить туда два внутренних раздела главное зеркало и адрес элемента».
      { slug: "domain", words: w("Domain", "The element's main mirror (its own domain) and its address in the core.", "Домен", "Главное зеркало элемента (его собственный домен) и его адрес в ядре.") },
      { slug: "danger-zone", words: w("Danger zone", "The element's description in the core, its links to the node and deleting it.", "Опасная зона", "Описание элемента в ядре, связи с узлом и удаление.") },
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
