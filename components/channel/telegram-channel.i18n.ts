// СЛОВА РАЗДЕЛА «TELEGRAM-БОТ» — рядом с островком (267-3).
//
// 🔒 ПЕРЕНОС СМЫСЛА МАСТЕРСКОЙ ПАМЯТИ (BotFather → токен → допуск ссылкой → запуск → работа). Там слова
// жили в общем словаре мастерской; здесь — рядом с островком, двумя языками, по закону узла.

export type TelegramChannelWords = {
  loading: string
  forbidden: string
  intro: string

  step1Title: string
  step1Text: string
  step1Points: string[]
  openBotFather: string
  nameLabel: string
  usernameLabel: string
  copy: string
  copied: string

  step2Title: string
  step2Text: string
  tokenLabel: string
  tokenHint: string
  saveToken: string
  saving: string
  /** «Бот @{username} сохранён · токен …{tail}» */
  tokenSaved: string

  step3Title: string
  step3Text: string
  getLink: string
  openLink: string
  waiting: string
  /** «Допущено: {n}» */
  allowedCount: string
  activated: string
  greeting: string

  step4Title: string
  step4Text: string
  notTrusted: string
  openTerminal: string
  start: string
  starting: string
  stop: string
  running: string
  sleeping: string

  step5Title: string
  step5Text: string
  openChat: string
  notes: string[]

  locked: string
  errors: Record<string, string>
}

const DICT: Record<string, TelegramChannelWords> = {
  en: {
    loading: "Asking the node…",
    forbidden: "Only the architect can set up the bot, and only from this computer or your own domain.",
    intro:
      "You write to your own bot in Telegram, and Claude Code answers from the folder of your sign-in service on this computer. The bot, its token and its list of allowed people are yours — nothing passes through Fractera.",

    step1Title: "Create a bot at @BotFather",
    step1Text: "BotFather is Telegram's own bot for making bots. Open it, send /newbot and answer its two questions.",
    step1Points: [
      "First it asks for a name — what people see in the chat header.",
      "Then a username — the address of the bot; it must end with «bot».",
      "At the end BotFather sends a token: a long line with a colon. Copy it for the next step.",
    ],
    openBotFather: "Open @BotFather",
    nameLabel: "A name you can use",
    usernameLabel: "A username you can use",
    copy: "Copy",
    copied: "Copied",

    step2Title: "Bring the token",
    step2Text: "The node checks it with Telegram itself and keeps it on this computer. It is never shown again — only its last four characters.",
    tokenLabel: "Bot token",
    tokenHint: "looks like 123456789:AA… — sent by BotFather",
    saveToken: "Save token",
    saving: "Checking with Telegram…",
    tokenSaved: "Bot @{username} saved · token …{tail}",

    step3Title: "Allow yourself",
    step3Text:
      "The bot answers only people on its list, and strangers get silence. Open the link below in the Telegram where you want to talk to the agent and press Start — the node will notice and add you.",
    getLink: "Get my link",
    openLink: "Open the bot and press Start",
    waiting: "Waiting for you to press Start in Telegram…",
    allowedCount: "Allowed: {n}",
    activated: "You are allowed. The bot greeted you in Telegram.",
    greeting: "Hello! You are on the list. Start the channel on the node page — then I will answer here.",

    step4Title: "Start the channel",
    step4Text:
      "The channel is Claude Code running on this computer and reading your bot. It keeps working after you close this page and after a restart of the computer — until you stop it here.",
    notTrusted:
      "Claude Code has not yet been told it may work in the sign-in service folder. Open the Terminal section, start the agent once and answer «Yes» to the trust question — the bot cannot answer that question for you.",
    openTerminal: "Open the Terminal section",
    start: "Start the channel",
    starting: "Starting…",
    stop: "Stop the channel",
    running: "The channel is running.",
    sleeping: "The channel is stopped. The bot does not answer.",

    step5Title: "Talk",
    step5Text: "Write to the bot. The first answer may take a little longer — the agent is waking up.",
    openChat: "Open the chat",
    notes: [
      "The bot answers while this computer is on and the channel is running.",
      "It spends your Claude subscription — the same limit as the terminal and your own work.",
      "Channels are a research preview by Anthropic: their flags may change.",
    ],

    locked: "Complete the step above first.",
    errors: {
      "empty-token": "Paste the token first.",
      "bad-format": "That does not look like a bot token: digits, a colon, then a long line of letters.",
      "token-rejected": "Telegram does not recognise this token. Copy it from BotFather again.",
      "telegram-unreachable": "Telegram did not answer. Check the internet on this computer.",
      "telegram-refused": "Telegram refused the request.",
      "no-bot-username": "Save the token first.",
      "no-activation": "The link has expired. Get a new one.",
      "channel-running": "Stop the channel first — while it runs, it takes every message itself.",
      "nobody-allowed": "Allow yourself first (step 3) — otherwise the bot would answer nobody.",
      "folder-not-trusted": "Claude Code does not trust the service folder yet — see the note above.",
      "no-launcher": "The channel launcher is missing from this node.",
      "pm2-refused": "The process manager refused to start the channel.",
      "no-token": "Save the token first.",
      network: "The node did not answer.",
    },
  },
  ru: {
    loading: "Спрашиваю узел…",
    forbidden: "Настраивать бота может только архитектор и только с этого компьютера или со своего домена.",
    intro:
      "Вы пишете своему боту в Telegram, а отвечает Claude Code из папки вашей службы входа на этом компьютере. Бот, его токен и список допущенных — ваши; через Fractera не проходит ничего.",

    step1Title: "Создайте бота у @BotFather",
    step1Text: "BotFather — собственный бот Telegram для создания ботов. Откройте его, отправьте /newbot и ответьте на два вопроса.",
    step1Points: [
      "Сначала он спросит имя — его видят в заголовке чата.",
      "Затем имя пользователя — адрес бота; оно обязано оканчиваться на «bot».",
      "В конце BotFather пришлёт токен — длинную строку с двоеточием. Скопируйте её для следующей ступени.",
    ],
    openBotFather: "Открыть @BotFather",
    nameLabel: "Имя, которое можно взять",
    usernameLabel: "Имя пользователя, которое можно взять",
    copy: "Скопировать",
    copied: "Скопировано",

    step2Title: "Принесите токен",
    step2Text: "Узел проверит его у самого Telegram и сохранит на этом компьютере. Больше он не показывается — только четыре последних знака.",
    tokenLabel: "Токен бота",
    tokenHint: "вида 123456789:AA… — его присылает BotFather",
    saveToken: "Сохранить токен",
    saving: "Проверяю у Telegram…",
    tokenSaved: "Бот @{username} сохранён · токен …{tail}",

    step3Title: "Допустите себя",
    step3Text:
      "Бот отвечает только тем, кто в его списке, чужим — молчание. Откройте ссылку ниже в том Telegram, где хотите говорить с агентом, и нажмите «Start» — узел заметит это и внесёт вас в список.",
    getLink: "Получить мою ссылку",
    openLink: "Открыть бота и нажать Start",
    waiting: "Жду, пока вы нажмёте Start в Telegram…",
    allowedCount: "Допущено: {n}",
    activated: "Вы допущены. Бот поздоровался с вами в Telegram.",
    greeting: "Здравствуйте! Вы в списке. Запустите канал на странице узла — и я начну отвечать здесь.",

    step4Title: "Запустите канал",
    step4Text:
      "Канал — это Claude Code, работающий на этом компьютере и читающий вашего бота. Он работает и после закрытия страницы, и после перезагрузки компьютера — пока вы не остановите его здесь.",
    notTrusted:
      "Claude Code ещё не разрешили работать в папке службы входа. Откройте раздел «Терминал», запустите агента один раз и ответьте «Yes» на вопрос о доверии — бот не может ответить на этот вопрос за вас.",
    openTerminal: "Открыть раздел «Терминал»",
    start: "Запустить канал",
    starting: "Запускаю…",
    stop: "Остановить канал",
    running: "Канал работает.",
    sleeping: "Канал остановлен. Бот не отвечает.",

    step5Title: "Говорите",
    step5Text: "Пишите боту. Первый ответ может прийти чуть дольше — агент просыпается.",
    openChat: "Открыть чат",
    notes: [
      "Бот отвечает, пока этот компьютер включён и канал запущен.",
      "Он тратит вашу подписку Claude — тот же лимит, что у терминала и вашей работы.",
      "Каналы — исследовательская версия Anthropic: их флаги могут измениться.",
    ],

    locked: "Сначала пройдите ступень выше.",
    errors: {
      "empty-token": "Сначала вставьте токен.",
      "bad-format": "Это не похоже на токен бота: цифры, двоеточие, затем длинная строка букв.",
      "token-rejected": "Telegram не узнаёт этот токен. Скопируйте его у BotFather заново.",
      "telegram-unreachable": "Telegram не ответил. Проверьте интернет на этом компьютере.",
      "telegram-refused": "Telegram отклонил запрос.",
      "no-bot-username": "Сначала сохраните токен.",
      "no-activation": "Ссылка истекла. Получите новую.",
      "channel-running": "Сначала остановите канал — пока он работает, он забирает все сообщения себе.",
      "nobody-allowed": "Сначала допустите себя (ступень 3) — иначе бот не ответил бы никому.",
      "folder-not-trusted": "Claude Code ещё не доверяет папке службы — см. пояснение выше.",
      "no-launcher": "На этом узле нет запускателя канала.",
      "pm2-refused": "Диспетчер процессов отказался запускать канал.",
      "no-token": "Сначала сохраните токен.",
      network: "Узел не ответил.",
    },
  },
}

/** Слова на выбранном языке; незнакомый язык честно деградирует до английского. */
export function telegramChannelWords(lang: string): TelegramChannelWords {
  return DICT[lang] ?? DICT.en
}
