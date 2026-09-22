// МОСТ ТЕРМИНАЛА: СОКЕТ `/pty` НА СЕРВЕРЕ УЗЛА (267-1, перенос `fractera-memory-starter/server.mjs:613–900`).
//
// 🔒 СОБЫТИЕ `upgrade` ПРИНАДЛЕЖИТ МОСТУ ЦЕЛИКОМ, И ЭТО ОТБИРАЕТСЯ ЯВНО. ✗ Оплачено у чата и памяти днём
// отладки: Next вешает свой обработчик `upgrade` при первом запросе и закрывает сокет, если его
// маршрутизатор что-то сматчил, — первое соединение живёт, следующие рвутся кодом 1006. Лечение: дать Next
// привязаться сейчас и тут же снять его обработчик; всё, кроме `/pty`, возвращается ему.
//
// 🔒 СПИСОК РЕЖИМОВ ЗАКРЫТЫЙ, СВОБОДНОЙ КОМАНДЫ ПО ПРОВОДУ НЕТ: браузер выбирает режим по имени, а что
// набрать в оболочке, решает сервер.
//
// 🛑 `node-pty` — НАТИВНЫЙ МОДУЛЬ, ЕГО ОТКАЗ ГРОМКИЙ. Сайт поднимается и без терминала, но причина
// печатается в журнал и в сам терминал: молча пропавший терминал читается как «сломали вход в подписку».
// Измерено 2026-09-22: у `node-pty@1.1.0` готовые сборки есть под Windows и macOS, под Linux — нет.

const { WebSocketServer } = require('ws')
const { existsSync } = require('node:fs')
const { redeemTicket } = require('./ticket.cjs')
const session = require('./session.cjs')
const { serviceDir } = require('./workspace.cjs')
const { claudeBin, resolveBin } = require('./claude-cli.cjs')
const { channelLaunch } = require('../channel/telegram.cjs')
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

/** Подключить мост к HTTP-серверу узла. */
function attachTerminal(server, app) {
  if (typeof app.setupWebSocketHandler === 'function') app.setupWebSocketHandler(server)
  server.removeAllListeners('upgrade')

  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', (req, socket, head) => {
    let pathname = ''
    try {
      ({ pathname } = new URL(req.url || '/', 'http://localhost'))
    } catch {
      socket.destroy()
      return
    }
    if (pathname === '/pty') {
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req))
      return
    }
    const upgrade = typeof app.getUpgradeHandler === 'function' ? app.getUpgradeHandler() : null
    if (upgrade) upgrade(req, socket, head)
    else socket.destroy()
  })

  wss.on('connection', (ws) => {
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
        const cwd = serviceDir(service)
        if (!cwd) {
          ws.send(`\r\n[папка агента не найдена: службы «${String(service ?? '').slice(0, 40)}» нет в реестре узла или на диске]\r\n`)
          fail('no-agent-dir')
          return
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
          ws.send('\r\n[claude не найден ни в PATH, ни в ~/.local/bin — установите Claude Code]\r\n')
          fail('no-claude')
          return
        }
        // 🔒 БОТ TELEGRAM РАБОТАЕТ В ЭТОЙ ЖЕ СЕССИИ (решение владельца 2026-09-22): бот подключён — `claude`
        // запускается с каналом, и всё, что человек пишет в Telegram, видно здесь. Первый запуск ставит
        // зависимости плагина — это может занять минуту, и человек видит, чего ждёт.
        let args = []
        starting.add(service)
        started = true
        clearTimeout(deadline)
        ws.send('\r\n[запускаю агента…]\r\n')
        const launch = await channelLaunch(service, env).catch((err) => ({ ok: false, error: err instanceof Error ? err.message : String(err) }))
        starting.delete(service)
        if (launch && !launch.ok) {
          ws.send(`\r\n[бот Telegram не подключится: ${launch.error}]\r\n[агент запускается без него]\r\n`)
        } else if (launch) {
          env = launch.env
          args = launch.args
        }
        if (ws.readyState !== ws.OPEN || session.current(service)) {
          fail('gone')
          return
        }
        let child
        try {
          child = pty.spawn(bin, args, { cols: 120, rows: 32, cwd, env, name: 'xterm-256color' })
        } catch (err) {
          ws.send(`\r\n[claude не запустился: ${err instanceof Error ? err.message : String(err)}]\r\n`)
          fail('spawn-failed')
          return
        }
        s = session.register({ service, pid: child.pid, proc: child, cwd, channel: args.length > 0 })
        const born = s
        child.onData((data) => {
          session.remember(born, data)
          for (const client of born.clients) if (client.readyState === client.OPEN) client.send(data)
        })
        child.onExit(() => session.exited(born))
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
          startAgent(msg.service, msg.start === true)
          return
        }
        if (msg.mode === 'login') {
          startLogin(msg.service)
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
  })
}

module.exports = { attachTerminal, shellPath, shellEnv, ptyLoadError: () => ptyLoadError, hasPty: () => pty !== null }
