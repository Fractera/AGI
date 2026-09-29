// ЗАМОК РАЗВЁРТЫВАНИЯ, КОТОРЫЙ НЕ ВРЁТ (узел, шаг 337-1).
//
// `logs/deploy-state.json` пишет `scripts/deploy-elements.mjs`; пока там `running`, второе развёртывание получает отказ,
// а страница показывает ход. ✗ Оплачено 2026-09-29: развёртывание mzjce начато в 16:40:14Z, пересборка ядра перезапустила
// его в 16:41:05Z, pm2 убил отсоединённого потомка — и `running: true` осталось навсегда: вечный спиннер, мёртвые кнопки.
//
// 🔒 ЖИВ ЛИ ПРОЦЕСС — ИЗМЕРЯЕТСЯ ПРИ КАЖДОМ ЧТЕНИИ, А НЕ ПОМНИТСЯ. Запись несёт `pid`; читающий проверяет его сигналом 0.
// Мёртв — запись исправляется на «прервано» тут же, без таймеров и без опроса: исправляет тот, кто спросил.
// Запись без `pid` (до 337) не трогается: жив ли её процесс, знать нечем.

const { readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

// 🛑 `process.cwd()`, А НЕ `__dirname`: в собранном сервере Next `__dirname` модуля указывает внутрь сборки, и дверь
// читала несуществующий файл — `deployment: null`, замок молчал (замерено 337). Корень узла — рабочая папка у всех
// троих: сервера ядра, `serve.mjs` (npm из корня) и скриптов развёртывания (их запускают с `cwd` корня).
const STATE = join(process.cwd(), 'logs', 'deploy-state.json')

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    // EPERM — процесс есть, но чужой: он жив.
    return e && e.code === 'EPERM'
  }
}

function readRaw() {
  try {
    return JSON.parse(readFileSync(STATE, 'utf8'))
  } catch {
    return null
  }
}

/** Состояние развёртывания; осиротевшая запись (running, а процесса нет) исправляется на «прервано» и сохраняется. */
function readState() {
  const s = readRaw()
  if (!s || !s.running || !Number.isInteger(s.pid) || pidAlive(s.pid)) return s
  const done = new Set((s.results || []).map((r) => r.id))
  const cut = s.current || (s.queue || []).find((id) => !done.has(id)) || null
  const fixed = {
    ...s,
    running: false,
    current: null,
    finishedAt: new Date().toISOString(),
    results: [
      ...(s.results || []),
      ...(cut ? [{ id: cut, ok: false, seconds: 0, note: 'прервано: процесс развёртывания исчез, работает прежняя сборка' }] : []),
    ],
  }
  try { writeFileSync(STATE, JSON.stringify(fixed, null, 2) + '\n') } catch { /* прочитали — и так вернём исправленное */ }
  return fixed
}

function isRunning() {
  const s = readState()
  return Boolean(s && s.running)
}

module.exports = { STATE, pidAlive, readState, isRunning }
