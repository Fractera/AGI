// ЖИТЕЛЬ КАНАЛА: TELEGRAM → CLAUDE CODE В ПАПКЕ АГЕНТА УЗЛА (267-3).
//
// Замена `fractera-memory-starter/scripts/agent/channel.sh`. Там — `bash` + `screen` + `setsid`, и всё это
// живёт только в Linux. Здесь — node под pm2 и `node-pty`: одинаково на Windows, Linux и macOS (закон
// владельца 2026-09-22: «для Windows и для Linux и для Mac это критически важно на всех слоях»).
//
// 🔒 ЗАПУСКАЕТСЯ КНОПКОЙ СТРАНИЦЫ, А НЕ ОБЩИМ ЗАПУСКОМ УЗЛА: жителя нет в `ecosystem.config.cjs`, иначе
// `pm2 start` узла будил бы бота без спроса. После кнопки `pm2 save` возвращает его после перезагрузки.
//
// 🛑 `--permission-mode auto` ОБЯЗАТЕЛЕН. Вопрос о разрешении ушёл бы в тот же канал, который в этот
// момент ждёт ответа, — сессия встала бы намертво (оплачено двумя часами молчания бота 2026-09-05).
// Режим снимает вопросы, а не запреты: границы держит инструкция папки.
//
// 🔒 ПОСЛЕДНИЙ ЭКРАН ПИШЕТСЯ В ФАЙЛ. У жителя под pm2 любой модальный вопрос равен зависанию, а pm2 при этом
// пишет `online` (закон проекта). Диагностика этого класса — по экрану, поэтому он виден всегда:
// `logs/<житель>.screen.txt`.

const { existsSync, mkdirSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const pty = require('node-pty')
const { agentDir } = require('../lib/terminal/workspace.cjs')
const { PLUGIN, residentName, stateDir, storedToken, cleanEnv, folderTrusted } = require('../lib/channel/telegram.cjs')

const isWindows = process.platform === 'win32'
const SCREEN_BYTES = 64 * 1024
const START =
  'This session is reached from Telegram. Answer the person in their language, briefly. ' +
  'Your folder is the sign-in service of this node.'

function fail(why) {
  console.error(`[канал] ${why}`)
  // Код не ноль: pm2 перезапустит с паузой, а причина останется в журнале.
  process.exit(1)
}

/**
 * Найти исполняемый файл в PATH без оболочки. На Windows — с расширениями из PATHEXT; `claude` из
 * установщика Anthropic лежит в `~/.local/bin`, `bun` — в `~/.bun/bin`, и обе папки добавляются явно:
 * pm2 живёт с окружением, снятым до установки, и нового PATH не видит.
 */
function extraBins() {
  return [path.join(os.homedir(), '.local', 'bin'), path.join(os.homedir(), '.bun', 'bin')]
}
function which(name, dirs) {
  const exts = isWindows ? (process.env.PATHEXT || '.EXE;.CMD').split(';').map((e) => e.toLowerCase()) : ['']
  for (const d of dirs) for (const e of exts) {
    const p = path.join(d, name + e)
    if (existsSync(p)) return p
  }
  return null
}

const cwd = agentDir()
if (!cwd) fail('папки агента нет: службы входа нет в реестре узла или на диске')
if (!storedToken()) fail(`токена нет (${path.join(stateDir(), '.env')}) — сохраните его на странице`)
if (!folderTrusted()) fail(`claude ещё не доверяет папке ${cwd} — ответьте «Yes» в терминале узла`)

const env = cleanEnv()
const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH'
const dirs = [...extraBins(), ...String(env[pathKey] || '').split(path.delimiter).filter(Boolean)]
env[pathKey] = dirs.join(path.delimiter)
env.TELEGRAM_STATE_DIR = stateDir()
env.TERM = 'xterm-256color'

if (!which('bun', dirs)) fail('bun не найден — сервер плагина Telegram запускается им (`.mcp.json` плагина)')
const claude = which('claude', dirs)
if (!claude) fail('claude не найден в PATH и в ~/.local/bin')

const screenFile = path.join(process.cwd(), 'logs', `${residentName()}.screen.txt`)
mkdirSync(path.dirname(screenFile), { recursive: true })

let screen = ''
// 🔒 ФЛАГИ — СТРОКА В СТРОКУ ИЗ `fractera-memory-starter/scripts/agent/channel.sh:79-84`, кроме
// `--settings .claude/settings.build.json` (у папки службы входа такого файла нет).
// 🛑 `--add-dir <папка состояния>` ОБЯЗАТЕЛЕН: папка бота лежит вне рабочей, и без него `claude` спрашивает
// «разрешить чтение вне рабочих директорий?» — плагин каналов этот вопрос не пересылает, и бот молчит
// часами при `online` в pm2 (закон проекта, оплачен 2026-09-05). Пропущен в первой редакции 267-3 и
// найден сверкой с памятью по слову владельца «сделай ровно точно также».
const child = pty.spawn(claude, ['--channels', `plugin:${PLUGIN}`, '--add-dir', stateDir(), '--permission-mode', 'auto', '--append-system-prompt', START], {
  name: 'xterm-256color', cols: 120, rows: 40, cwd, env,
})
console.log(`[канал] claude pid ${child.pid} в ${cwd}; состояние бота ${stateDir()}`)

child.onData((d) => {
  screen = (screen + d).slice(-SCREEN_BYTES)
})
const clean = (s) => s.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
const dump = setInterval(() => {
  try { writeFileSync(screenFile, clean(screen)) } catch { /* журнал не важнее канала */ }
}, 5000)

child.onExit(({ exitCode }) => {
  clearInterval(dump)
  try { writeFileSync(screenFile, clean(screen)) } catch { /* ignore */ }
  fail(`claude завершился с кодом ${exitCode}`)
})

// pm2 останавливает жителя сигналом — `claude` уходит вместе с ним, а не остаётся сиротой.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    try { child.kill() } catch { /* уже мёртв */ }
    process.exit(0)
  })
}
