// ОБЩЕЕ ПОДКЛЮЧЕНИЕ КОМПЛЕКТОВ АГЕНТА К УЗЛУ (271).
//
// 🔒 ЕДИНСТВЕННОЕ, ЧТО ОТ КОМПЛЕКТА ЖИВЁТ ВНЕ МАРШРУТОВ, И ПОЧЕМУ. Событие `upgrade` HTTP-сервера и таймеры
// опроса ботов — одни на процесс Node, а копий комплекта столько, сколько служб. Поэтому здесь нет ни строки о
// конкретной службе: список копий находится ОБХОДОМ ПАПОК при старте — `architect/<служба>/_agent-kit/server/
// entry.cjs`. Удалили папку службы — после перезапуска узла её нет ни здесь, ни где-либо ещё (закон владельца
// 2026-09-22: «если я удалю маршрут, все его кишки удалятся автоматически»).
//
// 🔒 СОКЕТ ОТБИРАЕТСЯ У NEXT ЯВНО. ✗ Оплачено у чата и памяти днём отладки: Next вешает свой обработчик
// `upgrade` при первом запросе и закрывает сокет, если его маршрутизатор что-то сматчил, — первое соединение
// живёт, следующие рвутся кодом 1006. Лечение: дать Next привязаться сейчас и тут же снять его обработчик;
// всё, кроме `/pty/<служба>`, возвращается ему.
//
// 🔒 СЛУЖБА — ИЗ АДРЕСА СОКЕТА И ИЗ ИМЕНИ ПАПКИ, А НЕ ИЗ СООБЩЕНИЯ БРАУЗЕРА.

const { existsSync, readdirSync } = require('node:fs')
const path = require('node:path')
const { WebSocketServer } = require('ws')

// 🛑 КОРЕНЬ — `process.cwd()`, как у всего узла: `server.js` запускается из корня проекта.
const ARCHITECT = path.join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect')
const PTY_PATH = /^\/pty\/([a-z][a-z0-9-]{0,39})$/

/** Копии комплекта, найденные на диске: `{ <служба>: entry }`. */
function findKits() {
  const kits = {}
  let names = []
  try { names = readdirSync(ARCHITECT) } catch { return kits }
  for (const name of names) {
    const entry = path.join(ARCHITECT, name, '_agent-kit', 'server', 'entry.cjs')
    if (!existsSync(entry)) continue
    try {
      kits[name] = require(entry)
    } catch (err) {
      // Сломанная копия одной службы не роняет узел и остальные службы — но называется громко.
      console.error(`[agent-kit] копия службы «${name}» не загрузилась: ${err instanceof Error ? err.message : err}`)
    }
  }
  return kits
}

/** Подключить все найденные копии: сокет `/pty/<служба>` и опрос ботов. Зовёт `server.js` одной строкой. */
function mountAgentKits(server, app) {
  const kits = findKits()
  const names = Object.keys(kits)
  console.log(`[agent-kit] службы с агентом: ${names.length ? names.join(', ') : 'нет'}`)

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
    const hit = pathname.match(PTY_PATH)
    if (hit) {
      const kit = kits[hit[1]]
      if (!kit) {
        socket.destroy()
        return
      }
      wss.handleUpgrade(req, socket, head, (ws) => kit.onConnection(ws, hit[1]))
      return
    }
    const upgrade = typeof app.getUpgradeHandler === 'function' ? app.getUpgradeHandler() : null
    if (upgrade) upgrade(req, socket, head)
    else socket.destroy()
  })

  for (const name of names) {
    try { kits[name].startIdlePoller(name) } catch (err) {
      console.error(`[agent-kit] опрос бота службы «${name}» не начался: ${err instanceof Error ? err.message : err}`)
    }
  }
}

module.exports = { mountAgentKits, findKits }
