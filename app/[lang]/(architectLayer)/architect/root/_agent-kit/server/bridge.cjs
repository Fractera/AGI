// МОСТ ТЕРМИНАЛА СЛУЖБЫ (267-1, перенос `fractera-memory-starter/server.mjs:613–900`; в маршруте службы — 271).
//
// 🔒 СОКЕТ УЗЛА ПРИНАДЛЕЖИТ НЕ МОСТУ, А ОБЩЕМУ ПОДКЛЮЧЕНИЮ `lib/agent-kit/mount.cjs`: событие `upgrade` одно на
// процесс, а копий комплекта столько, сколько служб. Подключение принимает `/pty/<служба>` и отдаёт сокет
// сюда — `onConnection(ws, service)`. Служба приходит из АДРЕСА, а не из сообщения браузера.
//
// 🔒 СПИСОК РЕЖИМОВ ЗАКРЫТЫЙ, СВОБОДНОЙ КОМАНДЫ ПО ПРОВОДУ НЕТ: браузер выбирает режим по имени, а что
// набрать в оболочке, решает сервер.
//
// 🛑 `node-pty` — НАТИВНЫЙ МОДУЛЬ, ЕГО ОТКАЗ ГРОМКИЙ. Сайт поднимается и без терминала, но причина
// печатается в журнал и в сам терминал: молча пропавший терминал читается как «сломали вход в подписку».
// Измерено 2026-09-22: у `node-pty@1.1.0` готовые сборки есть под Windows и macOS, под Linux — нет.

const { existsSync } = require('node:fs')
const { redeemTicket } = require('./ticket.cjs')
const session = require('./session.cjs')
const { serviceDir } = require('./workspace.cjs')
const { claudeBin, resolveBin } = require('./claude-cli.cjs')
const telegram = require('./telegram.cjs')
const { channelLaunch } = telegram
const os = require('node:os')

const INIT_DEADLINE_MS = 10_000
const CLOSE_POLICY = 1008

let pty = null
let ptyLoadError = ''
try {
  pty = require('node-pty')
} catch (err) {
  ptyLoadError = err instanceof Error ? err.message : String(err)
  console.error(`[pty] МОДУЛЬ НЕ ЗАГРУЖЕН: ${ptyLoadError}\n[pty] сайт работает, терминал будет отказывать. Лечение: npm rebuild node-pty`)
}

/**
 * Команда, которую сервер набирает в оболочке короткого терминала. `\r` — Enter и для cmd.exe, и для bash.
 * Агента здесь нет: он запускается файлом `claude` напрямую, без оболочки (см. `startAgent`); личность ему
 * даёт сама папка, а не добавленный промпт.
 */
const MODES = {
  // 🔒 `claude auth login` — ПОДКОМАНДА, А НЕ `/login` ВНУТРИ ИНТЕРФЕЙСА (измерено у чата, 114-2): набирать
  // команду в полноэкранном интерфейсе значило бы зависеть от раскладки. Начинает обмен безусловно — даже
  // у вошедшего, поэтому кнопка на странице зовётся «войти заново», когда вход уже есть.
  login: (bin) => `${bin} auth login\r`,
}

/**
 * Коротких терминалов входа — ОДИН на узел. Каждый `claude auth login` на этой машине сам открывает
 * вкладку в браузере; два входа разом дали бы две вкладки и два кода, из которых годен один
 * (владелец 2026-09-22: «открывается много вкладок на авторизацию»).
 */
const MAX_EPHEMERAL = 1
let ephemeral = 0
/** Службы, чей агент сейчас запускается (ставятся зависимости плагина): второй запуск той же службы отказывает, а не двоит сессию. */
const starting = new Set()

function shellPath() {
  if (process.env.PTY_SHELL) return process.env.PTY_SHELL
  const candidates = process.platform === 'win32'
    ? [process.env.ComSpec, 'C:\\Windows\\System32\\cmd.exe']
    : ['/bin/zsh', '/bin/bash', '/bin/sh']
  for (const c of candidates) if (c && existsSync(c)) return c
  return candidates[candidates.length - 1]
}

// 🔒 ОКРУЖЕНИЕ ОБОЛОЧКИ — БЕЗ СЕКРЕТОВ УЗЛА. Next загружает `.env.local` узла в `process.env`, и там лежат
// ключ Cloudflare, секреты входа и данных. Целиком наследовать нельзя, а собрать с нуля, как в памяти на
// Linux, нельзя тоже: на Windows `claude` ищет вход в `USERPROFILE`, `APPDATA`, `LOCALAPPDATA`, и
// обрезанное окружение даёт агента, который «не вошёл». Поэтому снимается ровно то, что похоже на секрет.
const SECRET = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_KEY|_KEY$|^DATABASE_URL$|^AUTH_)/i
// Метки чужой сессии Claude Code — см. `lib/channel/telegram.cjs` (оплачено живым прогоном 2026-09-22):
// с ними `claude` считает себя вложенной сессией и не поднимает серверы плагинов.
const INHERITED_SESSION = /^(CLAUDECODE|CLAUDE_CODE_.*|CLAUDE_PID|CLAUDE_EFFORT)$/i

function shellEnv(shell) {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === 'string' && !SECRET.test(k) && !INHERITED_SESSION.test(k)) env[k] = v
  }
  // Сервер сайта работает в продакшне; агенту и его сборкам это знание чужое.
  delete env.NODE_ENV
  delete env.PORT
  env.TERM = 'xterm-256color'
  if (process.platform !== 'win32') env.SHELL = shell
  return env
}

/**
 * РОДИТЬ СЕССИЮ АГЕНТА СЛУЖБЫ — одна функция для кнопки в окне терминала и для пробуждения без браузера (узел, шаг 409-1;
 * владелец: «агент должен уметь запускать собственный терминал»). `notice` — строки человеку (в окно терминала или никуда),
 * `wanted` — нужен ли ещё запуск после установки плагина канала (окно закрыли — не рождать).
 */
async function spawnAgent(service, notice = () => {}, wanted = () => true, firstPrompt = '') {
  if (!pty) {
    notice(`[терминал недоступен: node-pty не загружен — ${ptyLoadError}]`)
    return { ok: false, reason: 'pty-unavailable' }
  }
  if (starting.has(service)) return { ok: false, reason: 'starting' }
  const existing = session.current(service)
  if (existing) return { ok: true, session: existing, already: true }
  const cwd = serviceDir(service)
  if (!cwd) {
    notice(`[папка агента не найдена: службы «${String(service ?? '').slice(0, 40)}» нет в реестре узла или на диске]`)
    return { ok: false, reason: 'no-agent-dir' }
  }
  // 🛑 АГЕНТ ЗАПУСКАЕТСЯ ФАЙЛОМ `claude`, А НЕ НАБИРАЕТСЯ В ОБОЛОЧКЕ. ✗ Оплачено владельцем 2026-09-22:
  // на вопросе о доверии он нажал Enter, выбор по умолчанию был «No, exit», `claude` вышел — а оболочка
  // `cmd.exe` осталась жить, индикатор горел «Работает», и слова человека уходили в командную строку
  // Windows («'hello' is not recognized…»). Без оболочки выход агента и есть конец сессии: страница
  // говорит «Агент завершил работу» и снова даёт кнопку запуска.
  const shell = shellPath()
  let env = shellEnv(shell)
  const bin = resolveBin('claude', env.PATH || env.Path)
  if (!bin) {
    notice('[claude не найден ни в PATH, ни в ~/.local/bin — установите Claude Code]')
    return { ok: false, reason: 'no-claude' }
  }
  // 🔒 БОТ TELEGRAM РАБОТАЕТ В ЭТОЙ ЖЕ СЕССИИ (решение владельца 2026-09-22): бот подключён — `claude`
  // запускается с каналом, и всё, что человек пишет в Telegram, видно здесь. Первый запуск ставит
  // зависимости плагина — это может занять минуту, и человек видит, чего ждёт.
  let args = []
  starting.add(service)
  notice('[запускаю агента…]')
  const launch = await channelLaunch(service, env).catch((err) => ({ ok: false, error: err instanceof Error ? err.message : String(err) }))
  starting.delete(service)
  if (launch && !launch.ok) {
    notice(`[бот Telegram не подключится: ${launch.error}]\r\n[агент запускается без него]`)
  } else if (launch) {
    env = launch.env
    args = launch.args
  }
  if (!wanted() || session.current(service)) return { ok: false, reason: 'gone' }
  // 426 (✗ 2026-10-07: первое сообщение из Telegram пропало целиком — вставка по «3 с тишины» ушла раньше, чем Claude Code начал
  // принимать ввод, пока грузился плагин каналов): первое поручение новой сессии — аргументом запуска. `claude "<запрос>"` в
  // интерактивном режиме берёт его первым, когда готов, — момент готовности не угадывается. Многострочный текст с кавычками и
  // кириллицей доходит через node-pty байт в байт (замерено тем же днём).
  if (firstPrompt) args = [...args, firstPrompt]
  let child
  try {
    child = pty.spawn(bin, args, { cols: 120, rows: 32, cwd, env, name: 'xterm-256color' })
  } catch (err) {
    notice(`[claude не запустился: ${err instanceof Error ? err.message : String(err)}]`)
    return { ok: false, reason: 'spawn-failed' }
  }
  const born = session.register({ service, pid: child.pid, proc: child, cwd, channel: args.length > 0 })
  born.taskUrls = new Set()
  child.onData((data) => {
    session.remember(born, data)
    for (const client of born.clients) if (client.readyState === client.OPEN) client.send(data)
    watchPrompt(born)
  })
  child.onExit(() => session.exited(born))
  return { ok: true, session: born }
}

// ── ВОПРОС-РАЗРЕШЕНИЕ НА ЭКРАНЕ → ЗАДАЧА A2A «ЖДЁТ ЧЕЛОВЕКА» (418-4; владелец 2026-10-07: «to do it now») ──────────────────────
// Агент, разбуженный задачей A2A, может встать на вопросе Claude Code «разрешить?» — и до ответа человека не делает ничего, а
// задача у вызывающего выглядит «работает». Здесь экран читается после затишья: вопрос есть — каждой задаче этой сессии уходит
// `{ state: "input-required" }`, вопрос ушёл — `{ state: "working" }`. Только переходы, без таймеров опроса: проверка идёт по
// выводу самого терминала. Признаки — из строк самой программы `claude.exe` (2026-10-07): у каждого диалога разрешения вопрос
// «Do you want to …» и вариант «No, and tell Claude what to do differently»; «Yes, and don't ask again for» — у большинства.
// 🛑 Ink рисует пробелы сдвигом курсора (`ESC[nC`): он заменяется пробелом до снятия управляющих последовательностей.
const PROMPT_QUIET_MS = 800
const plainScreen = (raw) => raw
  .replace(/\x1b\[\d*C/g, ' ')
  .replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, '')
  .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
  .replace(/\x1b[()][0-9A-Za-z]/g, '')
  .replace(/\s+/g, ' ')
/** Висит ли на хвосте экрана вопрос-разрешение Claude Code. */
function promptOnScreen(buffer) {
  const tail = plainScreen(buffer.slice(-4000))
  return /Do you want to /.test(tail) && /(tell Claude what to do differently|Yes, and don't ask again|1\. ?Yes)/.test(tail)
}
function watchPrompt(s) {
  if (!s.taskUrls || s.taskUrls.size === 0) return
  clearTimeout(s.promptTimer)
  s.promptTimer = setTimeout(() => {
    if (session.current(s.service) !== s) return
    const waiting = promptOnScreen(s.buffer)
    if (waiting === Boolean(s.promptWaiting)) return
    s.promptWaiting = waiting
    for (const url of s.taskUrls) void tellTask(url, waiting ? 'input-required' : 'working')
  }, PROMPT_QUIET_MS)
  s.promptTimer.unref?.()
}
/** Дверь задачи вызывающего — только петля этой машины, ключ узла; отказ двери (задача уже закрыта) — не ошибка. */
async function tellTask(url, state) {
  try {
    const u = new URL(url)
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') return
    await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Node-Key': process.env.SETTINGS_SECRET ?? '' },
      body: JSON.stringify({ state }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch { /* дверь недоступна — задача останется в прежнем состоянии */ }
}
/** Запомнить двери задач A2A, которые эта сессия выполняет. */
function rememberTasks(s, urls) {
  if (!s.taskUrls) s.taskUrls = new Set()
  for (const u of urls) if (typeof u === 'string' && u) s.taskUrls.add(u)
}

const MB = 1024 * 1024
/** Память на одну сессию (владелец 2026-10-05: «примерно 300 МБ свободной памяти на один терминал»); переменная — для прибора. */
const perSessionMb = () => Number(process.env.AGENT_SESSION_MB) || 300

/** Вставить текст во вход агента, когда его экран затих (интерфейс поднялся): вставкой в скобках, затем Enter. */
function pasteWhenReady(s, text, { quietMs = 3000, maxMs = 120_000 } = {}) {
  const t0 = Date.now()
  let last = -1
  let since = Date.now()
  const timer = setInterval(() => {
    if (session.current(s.service) !== s) return clearInterval(timer)
    const len = s.buffer.length
    if (len !== last) {
      last = len
      since = Date.now()
    }
    if ((len > 0 && Date.now() - since >= quietMs) || Date.now() - t0 > maxMs) {
      clearInterval(timer)
      s.proc.write(`\x1b[200~${text}\x1b[201~`)
      // 409-3: один Enter через 400 мс терялся у сессии с каналом Telegram (экран владельца: задача стоит во вводе, не
      // отправлена). Повтор безопасен: пустой Enter в Claude Code ничего не делает.
      for (const ms of [400, 2500, 6000]) setTimeout(() => { if (session.current(s.service) === s) s.proc.write('\r') }, ms)
    }
  }, 500)
  timer.unref?.()
}

/**
 * РАЗБУДИТЬ АГЕНТА СЛУЖБЫ БЕЗ БРАУЗЕРА (409-1). Сессия жива — только вставить текст. Свободной памяти меньше нормы на сессию —
 * отказ с цифрами, ничего не рождается (задача ждёт). Открытая потом страница терминала видит этот же экран.
 */
async function wake(service, { text, from, about, declineUrl, confirmed, taskUrls = [] } = {}) {
  const urls = [declineUrl, ...taskUrls].filter(Boolean)
  const live = session.current(service)
  if (live) {
    rememberTasks(live, urls)
    if (text) pasteWhenReady(live, text, { quietMs: 500 })
    return { ok: true, already: true }
  }
  // 409-3: бот элемента подключён — сначала вопрос человеку в Telegram; сессия родится по кнопке «Запустить» (`confirmed`).
  if (!confirmed && telegram.connected(service)) return telegram.askToStart(service, { text, from, about, declineUrl })
  const freeMb = Math.floor(os.freemem() / MB)
  const per = perSessionMb()
  if (freeMb < per) return { ok: false, reason: 'memory', freeMb, perSessionMb: per }
  const r = await spawnAgent(service, undefined, undefined, text ? `${text}\n\n${finishRule(service)}` : '')
  if (!r.ok) return { ok: false, reason: r.reason }
  rememberTasks(r.session, urls)
  // 409-5 (владелец: «timeout more then 60 min»): через 60 минут от пробуждения — вопрос «закрыть терминал?». Только для
  // пробуждённых сессий; сама сессия не закрывается — закрывает агент по ответу человека. Переменная — для прибора.
  const born = r.session
  const timer = setTimeout(() => { if (session.current(service) === born) telegram.askToClose(service, 'timeout', { reviewed: Boolean(born.reviewed) }) }, wakeTimeoutMs())
  timer.unref?.()
  return { ok: true, started: true, freeMb, perSessionMb: per }
}

const wakeTimeoutMs = () => Number(process.env.AGENT_WAKE_TIMEOUT_MS) || 60 * 60 * 1000

/**
 * 409-5: как пробуждённому агенту закончить — дописывается к первому вставленному тексту, поэтому знает любой элемент без
 * правки его репозитория. Адрес — порт работающего сервера ядра (`process.env.PORT` этого процесса), не запомненное число.
 */
function finishRule(service) {
  // 🛑 `localhost`, не `127.0.0.1`: сервер ядра слушает `localhost`, на Windows это IPv6 — по `127.0.0.1` вызов агента в 409-5
  // отказал (curl, код 7), агент нашёл адрес сам в `logs/runtime.json` (закон проекта «хост подписки — тот, что слушает сервер»).
  const base = `http://localhost:${process.env.PORT || 24680}/api/agents`
  const door = `${base}/done`
  // 412-4 (владелец 2026-10-06: «в момент закрытия … был бы обязан создать саммари по проделанной работе»): задача A2A — заказ;
  // его сводка без персональных данных пишется ДО сообщения «закончил». Навыка нет у элемента — правило к нему не относится.
  return `${languageRule(service, base)} Если это была задача A2A от другого агента (заказ) и она закрыта — до сообщения узлу сохрани сводку заказа по навыку order-summary (нет такого навыка — пропусти). Когда закончишь и ответишь, сообщи узлу: POST ${door} с заголовком X-Node-Key = SETTINGS_SECRET из .env.local и телом {"service":"${service}"} — человек получит в Telegram вопрос «выключить агента?». Если человек ответит «выключить» (или «закрыть», на любом языке) — тот же запрос с телом {"service":"${service}","close":true}. Если человек ответит «разбор» (на любом языке) — сделай разбор своей работы по навыку self-review (нет такого навыка — скажи человеку, что разбор этому агенту недоступен), предложения пришли ему в Telegram по номерам, прими ответы вида «1 да, 2 нет», а затем снова отправь первый запрос, добавив в тело "reviewed":true — вопрос «выключить?» придёт ещё раз, уже без «разбор». Тело — файлом UTF-8 (curl --data-binary @файл).`
}

/**
 * 411-4 (владелец 2026-10-06: «в своем чате я вижу на своем языке … перешёл на Украинский … следовать продолжать на Украинский но
 * точно не по-китайски»): язык человека — из `person.json` бота элемента; агент пишет человеку на нём и сообщает узлу, когда
 * человек перешёл на другой язык (дверь `person-lang`) — с этого момента и вопросы ядра идут на новом языке.
 */
function languageRule(service, base) {
  const code = telegram.personLang(service)
  let name = code
  try { name = new Intl.DisplayNames(['ru'], { type: 'language' }).of(code) || code } catch { /* код как есть */ }
  return `Язык человека: ${name} (${code}). Всё, что пишешь человеку в Telegram, — на этом языке, на каком бы языке ни пришла задача. Если человек стал писать тебе на другом языке — сообщи узлу: POST ${base}/person-lang с тем же заголовком и телом {"service":"${service}","lang":"<код BCP 47, например uk>"} — и дальше пиши ему на новом языке.`
}

/**
 * АГЕНТ СООБЩИЛ «РАБОТА ЗАКОНЧЕНА» (409-5). Без `close` — человеку в Telegram «Агент <имя> закончил. Выключить его? Ответьте
 * «выключить»» (решение владельца «Ответ текстом»: пока терминал запущен, бота читает плагин и чужие кнопки выбрасывает). С `close`
 * — агент получил «закрыть» от человека и закрывает свой терминал; остановка — после ответа двери, чтобы агент его увидел.
 */
async function done(service, { close = false, reviewed = false } = {}) {
  const live = session.current(service)
  if (!live) return { ok: false, reason: 'no-session' }
  if (close) {
    const t = setTimeout(() => { if (session.current(service) === live) session.stop(service, 'closed-by-agent') }, 1500)
    t.unref?.()
    return { ok: true, closing: true }
  }
  // Владелец 2026-10-06: «делай паузу 5 секунд» — пара «спрашивает / отвечает» уходит в Telegram в фоне, и вопрос «выключить?»
  // её обгонял. Переменная — для прибора.
  await new Promise((r) => setTimeout(r, Number(process.env.AGENT_CLOSE_ASK_DELAY_MS) || 5000))
  // 414 (владелец 2026-10-06: «Он сначала мне предлагает закончить разговор а потом кидает ответы»): 5 с — только чтобы рассылка
  // успела начаться; дальше порядок по событию — ждём, пока пара разговора с этим элементом уйдёт в Telegram (перевод занимает
  // десятки секунд), не дольше 2 минут. Реестр пишет `lib/a2a/telegram-relay.ts` ядра.
  const relay = globalThis.__agiRelayPending?.get(service)
  if (relay) await Promise.race([relay, new Promise((r) => setTimeout(r, 120_000))])
  if (session.current(service) !== live) return { ok: false, reason: 'no-session' }
  // Владелец 2026-10-06: «второй раз не предлагать разбор после первого» — разбор в этой сессии был, строки «разбор» больше нет.
  if (reviewed) live.reviewed = true
  return telegram.askToClose(service, 'done', { reviewed: Boolean(live.reviewed) })
}

// 409-3: кнопка «Запустить» в Telegram рождает сессию этим же путём, уже с подтверждением.
telegram.setStarter((service, opts) => wake(service, { ...opts, confirmed: true }))

/** Принять сокет службы — его отдаёт общее подключение узла (`lib/agent-kit/mount.cjs`). */
function onConnection(ws, service) {
  {
    let attached = null
    let started = false

    const deadline = setTimeout(() => {
      if (!started) ws.close(CLOSE_POLICY, 'no-init')
    }, INIT_DEADLINE_MS)

    function fail(reason) {
      clearTimeout(deadline)
      console.error(`[pty] отказ: ${reason}`)
      ws.close(CLOSE_POLICY, reason)
    }

    /**
     * Подключиться к живой сессии агента или родить её — только по явному запуску.
     * 🛑 Подключение без `start` к спящей сессии ничего не рождает и закрывается с причиной `not-running`:
     * страница, открытая «просто посмотреть», не имеет права поднять процесс.
     */
    async function startAgent(service, wantStart) {
      if (!pty) {
        ws.send(`\r\n[терминал недоступен: node-pty не загружен — ${ptyLoadError}]\r\n`)
        fail('pty-unavailable')
        return
      }
      if (starting.has(service)) {
        fail('starting')
        return
      }
      let s = session.current(service)
      if (!s) {
        if (!wantStart) {
          started = true
          clearTimeout(deadline)
          ws.close(1000, 'not-running')
          return
        }
        started = true
        clearTimeout(deadline)
        // 409-1: запуск — общая функция с пробуждением без браузера (`spawnAgent` ниже).
        const r = await spawnAgent(service, (line) => ws.send(`\r\n${line}\r\n`), () => ws.readyState === ws.OPEN)
        if (!r.ok) {
          fail(r.reason)
          return
        }
        s = r.session
      } else if (s.buffer) {
        // Возврат на страницу показывает прежний экран: сначала накопленное, потом живой поток.
        ws.send(s.buffer)
      }
      s.clients.add(ws)
      attached = s
      started = true
      clearTimeout(deadline)
    }

    /**
     * Короткий терминал входа в подписку (267-2): живёт ровно столько, сколько сокет.
     * 🔒 В отличие от агента, он не переживает уход со страницы: вход — разовое действие, и оставленный
     * без присмотра `claude auth login` просто ждал бы кода вечно.
     */
    let own = null
    function startLogin(service) {
      if (!pty) {
        ws.send(`\r\n[терминал недоступен: node-pty не загружен — ${ptyLoadError}]\r\n`)
        fail('pty-unavailable')
        return
      }
      if (ephemeral >= MAX_EPHEMERAL) {
        fail('too-many-sessions')
        return
      }
      const shell = shellPath()
      try {
        own = pty.spawn(shell, [], { cols: 100, rows: 24, cwd: serviceDir(service) || os.homedir(), env: shellEnv(shell), name: 'xterm-256color' })
      } catch (err) {
        ws.send(`\r\n[оболочка ${shell} не запустилась: ${err instanceof Error ? err.message : String(err)}]\r\n`)
        fail('spawn-failed')
        return
      }
      ephemeral += 1
      started = true
      clearTimeout(deadline)
      const child = own
      child.onData((data) => {
        if (ws.readyState === ws.OPEN) ws.send(data)
      })
      child.onExit(() => {
        if (own === child) own = null
        ephemeral = Math.max(0, ephemeral - 1)
        if (ws.readyState === ws.OPEN) ws.close(1000, 'exited')
      })
      setTimeout(() => {
        try { child.write(MODES.login(claudeBin())) } catch { /* оболочка уже закрыта */ }
      }, 800)
    }

    ws.on('message', (raw) => {
      let msg = null
      try { msg = JSON.parse(raw.toString()) } catch { return }
      if (!msg || typeof msg !== 'object') return

      if (msg.type === 'init') {
        if (started) return
        // Билет одноразовый и живёт минуту; его выдала дверь под ролью архитектора.
        if (!redeemTicket(msg.ticket)) {
          fail('bad-ticket')
          return
        }
        if (msg.mode === 'agent') {
          startAgent(service, msg.start === true)
          return
        }
        if (msg.mode === 'login') {
          startLogin(service)
          return
        }
        fail('unknown-mode')
        return
      }
      const target = attached ? attached.proc : own
      if (!target) return
      if (msg.type === 'stdin' && typeof msg.data === 'string') {
        try { target.write(msg.data) } catch { /* процесс завершён */ }
        return
      }
      if (msg.type === 'resize' && msg.cols && msg.rows) {
        try { target.resize(Number(msg.cols), Number(msg.rows)) } catch { /* процесс завершён */ }
      }
    })

    ws.on('close', () => {
      clearTimeout(deadline)
      // Короткий терминал входа умирает вместе с сокетом.
      if (own) {
        const child = own
        own = null
        try { child.kill() } catch { /* уже мёртв */ }
      }
      // Уход со страницы отключает, но не убивает.
      if (attached) {
        attached.clients.delete(ws)
        attached = null
      }
    })
  }
}

module.exports = { onConnection, spawnAgent, wake, done, finishRule, shellPath, shellEnv, ptyLoadError: () => ptyLoadError, hasPty: () => pty !== null }
