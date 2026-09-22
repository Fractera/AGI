// СЛОВА ТЕРМИНАЛА АГЕНТА — рядом с самим островком (267-1).
//
// 🔒 ПЕРЕНОС СМЫСЛА МАСТЕРСКОЙ ПАМЯТИ, А НЕ ЕЁ ТЕКСТА: там терминал строит службу памяти, здесь — службу
// входа узла. Предупреждение о риске и слова «спит / работает / остановлен» — те же по смыслу, потому что
// те же по поведению.

export type AgentTerminalWords = {
  folderLabel: string
  noFolder: string
  /** подсказка первого запуска: выбор по умолчанию в вопросе о доверии — «No, exit» (владелец нажал Enter и вышел) */
  firstRun: string
  warnTitle: string
  warnBody: string
  warnPoints: string[]
  sleepingTitle: string
  sleepingBody: string
  start: string
  starting: string
  running: string
  keepsRunning: string
  clear: string
  stop: string
  stopped: string
  exited: string
  offline: string
  forbidden: string
}

const DICT: Record<string, AgentTerminalWords> = {
  en: {
    folderLabel: "The agent starts in:",
    noFolder: "This service is not installed on this node, so the agent has no folder to live in.",
    firstRun: "First start: Claude Code asks whether you trust this folder, and «No, exit» is selected by default. Press ↓ to choose «Yes, I trust this folder», then Enter.",
    warnTitle: "This is a real command line of this computer",
    warnBody:
      "Claude Code here works inside the folder of this service and can change its files. A service broken here stays broken for everyone who uses it — including you on the public address.",
    warnPoints: [
      "Your way back: run the node in development mode on this computer — sign-in is lifted there — and return to the last working state.",
      "Rebuilding or restarting the node ends this session; the agent starts again from the button.",
      "The agent uses your Claude subscription — the same limit as your work at the computer and the Telegram bot.",
    ],
    sleepingTitle: "The terminal is asleep",
    sleepingBody: "Nothing runs until you press the button: no process, no load on the computer.",
    start: "Start the agent",
    starting: "Starting…",
    running: "Running",
    keepsRunning: "Leaving this page does not stop it.",
    clear: "Clear the screen",
    stop: "Stop",
    stopped: "Stopped.",
    exited: "The agent has finished.",
    offline: "The connection to the node was lost.",
    forbidden: "The terminal is open only to the architect, and only from this computer or your own domain.",
  },
  ru: {
    folderLabel: "Агент запускается в папке:",
    noFolder: "На этом узле нет этой службы, и агенту негде жить.",
    firstRun: "Первый запуск: Claude Code спросит, доверяете ли вы этой папке, и по умолчанию выбрано «No, exit». Нажмите ↓, чтобы выбрать «Yes, I trust this folder», затем Enter.",
    warnTitle: "Это настоящая командная строка этого компьютера",
    warnBody:
      "Claude Code здесь работает в папке этой службы и может менять её файлы. Сломанная здесь служба сломана для всех, кто ею пользуется, — и для вас на публичном адресе тоже.",
    warnPoints: [
      "Путь назад: запустите узел в режиме разработки на этом компьютере — там вход снят — и вернитесь к последнему рабочему состоянию.",
      "Пересборка или перезапуск узла завершает эту сессию; агент запускается заново кнопкой.",
      "Агент тратит вашу подписку Claude — тот же лимит, что и ваша работа за компьютером и Telegram-бот.",
    ],
    sleepingTitle: "Терминал спит",
    sleepingBody: "Пока вы не нажали кнопку, ничего не запущено: ни процесса, ни нагрузки на компьютер.",
    start: "Запустить агента",
    starting: "Запускаю…",
    running: "Работает",
    keepsRunning: "Уход с этой страницы его не останавливает.",
    clear: "Очистить экран",
    stop: "Остановить",
    stopped: "Остановлен.",
    exited: "Агент завершил работу.",
    offline: "Связь с узлом потеряна.",
    forbidden: "Терминал открыт только архитектору и только с этого компьютера или со своего домена.",
  },
}

/** Слова на выбранном языке; незнакомый язык честно деградирует до английского. */
export function agentTerminalWords(lang: string): AgentTerminalWords {
  return DICT[lang] ?? DICT.en
}
