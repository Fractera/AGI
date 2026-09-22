// ДЕРЖАТЕЛЬ ЖИВОЙ СЕССИИ АГЕНТА (267-1, перенос `fractera-memory-starter/lib/fractera/build-session.mjs`).
//
// 🎯 Слова владельца, сказанные о мастерской памяти и перенесённые вместе с ней: «до того как она будет
// запущена она не должна расходовать ресурсы компьютера» · «когда я перехожу в другие вкладки терминал
// должен продолжать работать» · «нужно быть кнопка остановить».
//
// 🔒 СЕССИЯ ОДНА И ЖИВЁТ ДОЛЬШЕ СОКЕТА: сокет только подключён к ней. Уход со страницы закрывает сокет, а
// возврат получает накопленный экран. Хранится в `globalThis` по той же причине, что билет: дверь статуса
// (Next) и мост (`server.js`) — один процесс, два экземпляра модуля.
//
// 🛑 ПЕРЕЗАПУСК УЗЛА (пересборка, `pm2 restart`) УБИВАЕТ СЕССИЮ — процесс `claude` дочерний. Это цена
// держателя внутри сервера сайта, и страница говорит о ней словами, а не прячет.

const KEY = '__agiTerminalSession'
const BUFFER_BYTES = 256 * 1024

function box() {
  if (!globalThis[KEY]) globalThis[KEY] = { session: null }
  return globalThis[KEY]
}

function current() {
  return box().session
}

function register({ pid, proc, cwd, channel = false }) {
  const session = { buffer: '', clients: new Set(), pid, proc, cwd, channel, startedAt: new Date().toISOString() }
  box().session = session
  return session
}

function remember(session, chunk) {
  session.buffer = (session.buffer + chunk).slice(-BUFFER_BYTES)
}

/** Что видно снаружи — факты, без процесса и сокетов. */
function status() {
  const s = box().session
  if (!s) return { running: false }
  return { running: true, pid: s.pid, cwd: s.cwd, channel: Boolean(s.channel), clients: s.clients.size, startedAt: s.startedAt }
}

function closeAll(s, reason) {
  for (const ws of s.clients) {
    try { ws.close(1000, reason) } catch { /* уже закрыт */ }
  }
  s.clients.clear()
}

/** Остановить: убить процесс, закрыть подключённых, забыть сессию. */
function stop(reason = 'stopped') {
  const s = box().session
  if (!s) return { ok: true, was: false }
  box().session = null
  closeAll(s, reason)
  try { s.proc.kill() } catch { /* уже мёртв */ }
  return { ok: true, was: true, pid: s.pid }
}

/** Процесс завершился сам (набрали `exit`, закрыли агента). */
function exited(session) {
  if (box().session !== session) return
  box().session = null
  closeAll(session, 'exited')
}

module.exports = { current, register, remember, status, stop, exited }
