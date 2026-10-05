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
async function spawnAgent(service, notice = () => {}, wanted = () => true) {
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
  let child
  try {
    child = pty.spawn(bin, args, { cols: 120, rows: 32, cwd, env, name: 'xterm-256color' })
  } catch (err) {
    notice(`[claude не запустился: ${err instanceof Error ? err.message : String(err)}]`)
    return { ok: false, reason: 'spawn-failed' }
  }
  const born = session.register({ service, pid: child.pid, proc: child, cwd, channel: args.length > 0 })
  child.onData((data) => {
    session.remember(born, data)
    for (const client of born.clients) if (client.readyState === client.OPEN) client.send(data)
  })
  child.onExit(() => session.exited(born))
  return { ok: true, session: born }
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
async function wake(service, { text, from, about, declineUrl, confirmed } = {}) {
  const live = session.current(service)
  if (live) {
    if (text) pasteWhenReady(live, text, { quietMs: 500 })
    return { ok: true, already: true }
  }
  // 409-3: бот элемента подключён — сначала вопрос человеку в Telegram; сессия родится по кнопке «Запустить» (`confirmed`).
  if (!confirmed && telegram.connected(service)) return telegram.askToStart(service, { text, from, about, declineUrl })
  const freeMb = Math.floor(os.freemem() / MB)
  const per = perSessionMb()
  if (freeMb < per) return { ok: false, reason: 'memory', freeMb, perSessionMb: per }
  const r = await spawnAgent(service)
  if (!r.ok) return { ok: false, reason: r.reason }
  if (text) pasteWhenReady(r.session, `${text}\n\n${finishRule(service)}`)
  // 409-5 (владелец: «timeout more then 60 min»): через 60 минут от пробуждения — вопрос «закрыть терминал?». Только для
  // пробуждённых сессий; сама сессия не закрывается — закрывает агент по ответу человека. Переменная — для прибора.
  const born = r.session
  const timer = setTimeout(() => { if (session.current(service) === born) telegram.askToClose(service, 'timeout') }, wakeTimeoutMs())
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
  const door = `http://localhost:${process.env.PORT || 24680}/api/agents/done`
  return `Когда закончишь и ответишь, сообщи узлу: POST ${door} с заголовком X-Node-Key = SETTINGS_SECRET из .env.local и телом {"service":"${service}"} — человек получит в Telegram вопрос «закрыть терминал?». Если человек ответит «закрыть» — тот же запрос с телом {"service":"${service}","close":true}. Тело — файлом UTF-8 (curl --data-binary @файл).`
}

/**
 * АГЕНТ СООБЩИЛ «РАБОТА ЗАКОНЧЕНА» (409-5). Без `close` — человеку в Telegram «Работа закончена. Закрыть терминал? Ответьте
 * «закрыть»» (решение владельца «Ответ текстом»: пока терминал запущен, бота читает плагин и чужие кнопки выбрасывает). С `close`
 * — агент получил «закрыть» от человека и закрывает свой терминал; остановка — после ответа двери, чтобы агент его увидел.
 */
function done(service, { close = false } = {}) {
  const live = session.current(service)
  if (!live) return { ok: false, reason: 'no-session' }
  if (close) {
    const t = setTimeout(() => { if (session.current(service) === live) session.stop(service, 'closed-by-agent') }, 1500)
    t.unref?.()
    return { ok: true, closing: true }
  }
  return telegram.askToClose(service, 'done')
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

module.exports = { onConnection, spawnAgent, wake, done, shellPath, shellEnv, ptyLoadError: () => ptyLoadError, hasPty: () => pty !== null }
