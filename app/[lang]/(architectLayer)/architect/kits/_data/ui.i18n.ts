// СЛОВА ВКЛАДКИ «ГОТОВЫЕ РЕШЕНИЯ» (270).
//
// 🔒 ОДНА ЗАПИСЬ — ОДНО РЕШЕНИЕ. Страница рисует их аккордеоном: в полосе — коротко (что это, как встроить,
// параметры), в окне по иконке книги — всё. Новое решение = новая запись здесь и в `_components`.
// 🔒 Зарегистрирован в `scripts/check-i18n.mjs` тем же коммитом, что и создан (закон 236-1).

export type KitDetailsSection = { heading: string; text?: string; items?: string[]; table?: { headers: string[]; rows: string[][] } }

export type KitWords = {
  summary: string
  intro: string
  embedLabel: string
  command: string
  paramsHeaders: string[]
  params: string[][]
  sample: string
  detailsTitle: string
  details: KitDetailsSection[]
}

export type KitsUi = {
  agentKit: KitWords
}

const UI: Record<string, KitsUi> = {
  en: {
    agentKit: {
      summary: 'Service agent: Claude Code, terminal and Telegram bot',
      intro:
        'Gives a service its own Claude Code agent: a subscription page, a terminal where the agent is started and stopped, and a Telegram bot that works inside the same session — everything written in Telegram shows in the terminal.',
      embedLabel: 'How to embed',
      command: 'npm run agent-kit:add -- <service>\nnpm run serve:rebuild',
      paramsHeaders: ['Parameter', 'What it is'],
      params: [
        ['<service>', 'the service id from MICROSERVICES.json; it needs the folder microservices/<service> and its own page group architect/<service>/'],
        ['--force', 'overwrite pages that are already embedded'],
      ],
      sample: 'Live sample: [Sign-in → Telegram bot](/en/architect/auth/telegram).',
      detailsTitle: 'Service agent — in detail',
      details: [
        {
          heading: 'What the service gets',
          items: [
            '**Claude Code subscription** — signing in to the subscription; one per computer, the same for every service.',
            '**Terminal** — a live Claude Code in the service folder; it is started and stopped only here.',
            '**Telegram bot** — the service bot; it works inside the terminal session.',
          ],
        },
        {
          heading: 'How it works',
          items: [
            'One service — one Claude Code session and one bot.',
            'When the bot is connected, the terminal starts Claude Code with the Telegram channel: everything from Telegram shows in the terminal, and without Telegram the work goes on there.',
            'While the terminal is off, the node reads the bot itself and answers with a status message and links: the subscription is not connected, or the terminal is not active.',
            'Step 4 of the bot page only shows the state — a yellow or green card with a button to the terminal; there are no start buttons there.',
          ],
        },
        {
          heading: 'Parameters and doors',
          table: {
            headers: ['Where', 'What for'],
            rows: [
              ['agentKitContent(page, service, lang) — lib/agent-kit/content.ts', 'the blocks of a page: claude-code · terminal · telegram'],
              ['/api/terminal/session?service=<service>', 'terminal state and stop'],
              ['/api/channel/telegram?service=<service>', 'token, admission link, message texts, bot state'],
              ['socket /pty, init { mode: agent, service }', 'start of the session and connection to it'],
              ['data/services/<service>/channel/telegram', 'token, allowed people, texts — outside git'],
            ],
          },
        },
        {
          heading: 'What the service needs',
          items: [
            'An entry in MICROSERVICES.json and the folder microservices/<service>.',
            'Its own page group architect/<service>/ — the command puts the pages into it.',
            'On the computer: Claude Code, Bun and the telegram@claude-plugins-official plugin; the plugin dependencies are installed by themselves on the first start.',
          ],
        },
        {
          heading: 'Good to know',
          items: [
            'The first start in a new folder asks whether you trust it — answer «Yes» in the terminal of that service.',
            'A restart or rebuild of the node ends the sessions — the agent is started again.',
            'Telegram channels are an Anthropic research preview: their flags may change.',
          ],
        },
        {
          heading: 'Where it is embedded',
          text: '[Sign-in](/en/architect/auth/terminal) and [Data](/en/architect/data/terminal).',
        },
      ],
    },
  },
  ru: {
    agentKit: {
      summary: 'Агент службы: Claude Code, терминал и Telegram-бот',
      intro:
        'Даёт службе собственного агента Claude Code: страницу подписки, терминал, в котором агента запускают и останавливают, и Telegram-бота, работающего в той же сессии, — всё написанное в Telegram видно в терминале.',
      embedLabel: 'Как встроить',
      command: 'npm run agent-kit:add -- <служба>\nnpm run serve:rebuild',
      paramsHeaders: ['Параметр', 'Что это'],
      params: [
        ['<служба>', 'имя службы из MICROSERVICES.json; у неё должны быть папка microservices/<служба> и своя группа страниц architect/<служба>/'],
        ['--force', 'перезаписать уже встроенные страницы'],
      ],
      sample: 'Живой образец: [Авторизация → Telegram-бот](/ru/architect/auth/telegram).',
      detailsTitle: 'Агент службы — подробно',
      details: [
        {
          heading: 'Что появляется у службы',
          items: [
            '**Подписка Claude Code** — вход в подписку; одна на весь компьютер, у всех служб одна и та же.',
            '**Терминал** — живой Claude Code в папке службы; запускают и останавливают его только здесь.',
            '**Telegram-бот** — бот службы; работает внутри сессии терминала.',
          ],
        },
        {
          heading: 'Как это работает',
          items: [
            'Одна служба — одна сессия Claude Code и один бот.',
            'Бот подключён — терминал запускает Claude Code с каналом Telegram: всё из Telegram видно в терминале, а без Telegram работа продолжается там же.',
            'Пока терминал выключен, бота читает сам узел и отвечает сообщением о состоянии со ссылками: подписка не подключена или терминал неактивен.',
            'Шаг 4 страницы бота только показывает состояние — жёлтая или зелёная карточка с кнопкой в терминал; кнопок запуска там нет.',
          ],
        },
        {
          heading: 'Параметры и двери',
          table: {
            headers: ['Где', 'Зачем'],
            rows: [
              ['agentKitContent(страница, служба, язык) — lib/agent-kit/content.ts', 'блоки страницы: claude-code · terminal · telegram'],
              ['/api/terminal/session?service=<служба>', 'состояние и остановка терминала'],
              ['/api/channel/telegram?service=<служба>', 'токен, ссылка допуска, тексты сообщений, состояние бота'],
              ['сокет /pty, init { mode: agent, service }', 'запуск сессии и подключение к ней'],
              ['data/services/<служба>/channel/telegram', 'токен, допущенные, тексты — вне git'],
            ],
          },
        },
        {
          heading: 'Что нужно службе',
          items: [
            'Запись в MICROSERVICES.json и папка microservices/<служба>.',
            'Своя группа страниц architect/<служба>/ — команда кладёт страницы в неё.',
            'На компьютере: Claude Code, Bun и плагин telegram@claude-plugins-official; зависимости плагина ставятся сами при первом запуске.',
          ],
        },
        {
          heading: 'Что знать заранее',
          items: [
            'Первый запуск в новой папке спрашивает, доверяете ли вы ей, — ответьте «Yes» в терминале этой службы.',
            'Перезапуск или пересборка узла завершает сессии — агента запускают снова.',
            'Каналы Telegram — исследовательская версия Anthropic: их флаги могут измениться.',
          ],
        },
        {
          heading: 'Где встроено',
          text: '[Авторизация](/ru/architect/auth/terminal) и [Данные](/ru/architect/data/terminal).',
        },
      ],
    },
  },
}

export function kitsUi(lang: string): KitsUi {
  return UI[lang] ?? UI.en
}
