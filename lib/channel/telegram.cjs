// КАНАЛ TELEGRAM → CLAUDE CODE В ПАПКЕ АГЕНТА УЗЛА (267-3).
//
// Перенос `fractera-memory-starter/lib/channel/{telegram,identity,activation}.mjs` с тремя переменами, и
// каждая продиктована законом владельца «Windows, Linux и macOS на всех слоях»:
//   1. `screen` → житель pm2 `scripts/agent-channel.cjs`, держащий `claude` в `node-pty`: `screen` есть
//      только в Linux, pm2 и node-pty — на всех трёх;
//   2. `bash`, `setsid`, `HOME=/root` → ничего из этого: пути строятся `path.join` от `os.homedir()`;
//   3. папка состояния — `<узел>/data/services/<служба>/channel/telegram`, а не внутри папки службы: та —
//      клон её репозитория, и файлы бота сделали бы его грязным (закон узла о данных служб).
//
// 🔒 ПЛАГИН ОФИЦИАЛЬНЫЙ: `telegram@claude-plugins-official`, сервер запускается `bun run` (первоисточник —
// `.mcp.json` плагина). `TELEGRAM_STATE_DIR` — своя папка на экземпляр, дословно из его README: «To run
// multiple bots on one machine… point TELEGRAM_STATE_DIR at a different directory per instance».
//
// 🔒 ДОПУСК БЕЗ ВВОДА КОДА — как в памяти: страница даёт ссылку `t.me/<бот>?start=<метка>`, узел находит
// это сообщение через `getUpdates` и вносит отправителя в `access.json` плагина. Делается это ДО запуска
// канала: у бота один опрашиватель, и работающий канал забрал бы сообщение себе (Telegram ответил бы 409).

const { spawnSync } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { agentDir, agentService } = require('../terminal/workspace.cjs')

const ROOT = process.cwd()
const PLUGIN = 'telegram@claude-plugins-official'
const TOKEN_SHAPE = /^\d{6,}:[A-Za-z0-9_-]{30,}$/
const ACTIVATION_LIFETIME_MS = 60 * 60 * 1000
const isWindows = process.platform === 'win32'

const residentName = () => `fractera-agent-channel-${agentService()}`
const stateDir = () => path.join(ROOT, 'data', 'services', agentService(), 'channel', 'telegram')
const envFile = () => path.join(stateDir(), '.env')
const accessFile = () => path.join(stateDir(), 'access.json')
const botFile = () => path.join(stateDir(), 'bot.json')
const activationFile = () => path.join(stateDir(), 'activation.json')

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}

/** Файлы с секретом — только владельцу. На Windows права задаёт ACL папки пользователя, `chmod` там пуст. */
function writeSecret(file, text) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, text, { mode: 0o600 })
  try { chmodSync(file, 0o600) } catch { /* Windows */ }
}

function storedToken() {
  try {
    const line = readFileSync(envFile(), 'utf8').split(/\r?\n/).find((l) => l.startsWith('TELEGRAM_BOT_TOKEN='))
    return line ? line.slice('TELEGRAM_BOT_TOKEN='.length).trim() : ''
  } catch {
    return ''
  }
}

async function tg(token, method, params = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(10_000),
    })
    return (await res.json().catch(() => null)) ?? { ok: false }
  } catch {
    return { ok: false, description: 'unreachable' }
  }
}

/** Сохранить токен, проверив его у самого Telegram (`getMe`): форма ещё не значит «рабочий». */
async function saveToken(raw) {
  const token = String(raw ?? '').trim()
  if (!token) return { ok: false, error: 'empty-token' }
  if (!TOKEN_SHAPE.test(token)) return { ok: false, error: 'bad-format' }
  const me = await tg(token, 'getMe')
  if (me.description === 'unreachable') return { ok: false, error: 'telegram-unreachable' }
  if (!me.ok || !me.result?.username) return { ok: false, error: 'token-rejected' }
  mkdirSync(stateDir(), { recursive: true })
  writeFileSync(botFile(), JSON.stringify({ name: me.result.first_name ?? '', username: me.result.username }, null, 2))
  writeSecret(envFile(), `TELEGRAM_BOT_TOKEN=${token}\n`)
  if (!existsSync(accessFile())) {
    writeSecret(accessFile(), JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }, null, 2))
  }
  return { ok: true, tail: token.slice(-4), username: me.result.username }
}

function access() {
  const a = readJson(accessFile(), {})
  return { allowed: Array.isArray(a.allowFrom) ? a.allowFrom : [] }
}

/** Ссылка допуска: одна метка на час, повторный запрос отдаёт ту же. */
function activationLink() {
  const bot = readJson(botFile(), {})
  if (!bot.username) return { ok: false, error: 'no-bot-username' }
  let nonce = ''
  const a = readJson(activationFile(), null)
  if (a?.nonce && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS) nonce = a.nonce
  if (!nonce) {
    nonce = randomBytes(12).toString('hex')
    writeSecret(activationFile(), JSON.stringify({ createdAt: Date.now(), nonce }))
  }
  return { ok: true, url: `https://t.me/${bot.username}?start=${nonce}` }
}

/** Пришло ли `/start <метка>`. Нашлось — отправитель допущен, ему уходит приветствие. */
async function checkActivation(greeting) {
  const token = storedToken()
  if (!token) return { ok: false, error: 'no-token' }
  if (running()) return { ok: false, error: 'channel-running' }
  const a = readJson(activationFile(), null)
  const nonce = a && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS ? a.nonce : ''
  if (!nonce) return { ok: false, error: 'no-activation' }

  const got = await tg(token, 'getUpdates', { allowed_updates: ['message'], timeout: 0 })
  if (got.error_code === 401) return { ok: false, error: 'token-rejected' }
  if (got.error_code === 409) return { ok: true, activated: false }
  if (!got.ok) return { ok: false, error: got.description === 'unreachable' ? 'telegram-unreachable' : 'telegram-refused' }
  const updates = Array.isArray(got.result) ? got.result : []
  const hit = updates.find((u) => u.message?.chat?.type === 'private' && typeof u.message.text === 'string' && u.message.text.trim() === `/start ${nonce}`)
  if (updates.length > 0) await tg(token, 'getUpdates', { offset: updates[updates.length - 1].update_id + 1, timeout: 0 })
  if (!hit) return { ok: true, activated: false }

  const sender = String(hit.message.from.id)
  const acc = { dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {}, ...readJson(accessFile(), {}) }
  if (!acc.allowFrom.includes(sender)) acc.allowFrom.push(sender)
  writeSecret(accessFile(), JSON.stringify(acc, null, 2))
  rmSync(activationFile(), { force: true })
  const text = String(greeting ?? '').slice(0, 500)
  if (text) await tg(token, 'sendMessage', { chat_id: hit.message.chat.id, text })
  return { ok: true, activated: true }
}

/**
 * Доверяет ли `claude` папке агента. Первый запуск в новой папке спрашивает «Is this a project you trust?»
 * — у жителя под pm2 ответить некому, и канал завис бы молча (измерено в 267-1). Ответ хранится в
 * `~/.claude.json` → `projects[<путь>].hasTrustDialogAccepted`; путь записывается то прямыми, то обратными
 * косыми, поэтому сравнение — без учёта вида косой и регистра на Windows.
 */
function folderTrusted() {
  const dir = agentDir()
  if (!dir) return false
  const j = readJson(path.join(os.homedir(), '.claude.json'), {})
  const norm = (p) => {
    const s = String(p).replace(/\\/g, '/').replace(/\/+$/, '')
    return isWindows ? s.toLowerCase() : s
  }
  const want = norm(dir)
  return Object.entries(j.projects ?? {}).some(([k, v]) => norm(k) === want && v?.hasTrustDialogAccepted === true)
}

// ── pm2 ─────────────────────────────────────────────────────────────────────
// 🛑 ОКРУЖЕНИЕ ДЛЯ pm2 ОЧИЩАЕТСЯ: pm2 сохраняет окружение жителя в свой снимок открытым текстом, а в
// `process.env` узла Next положил `.env.local` — ключ Cloudflare и секреты входа.
// 🛑 На Windows `pm2` — это `pm2.cmd`, и node не запускает `.cmd` без оболочки (закон узла); аргументы
// здесь константы и пути узла, чужого текста в них нет.
const SECRET = /(SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|API_KEY|_KEY$|^DATABASE_URL$|^AUTH_)/i
function cleanEnv() {
  const env = {}
  for (const [k, v] of Object.entries(process.env)) if (typeof v === 'string' && !SECRET.test(k)) env[k] = v
  delete env.NODE_ENV
  delete env.PORT
  return env
}

function pm2(args) {
  const r = spawnSync(isWindows ? 'pm2.cmd' : 'pm2', args, {
    cwd: ROOT, encoding: 'utf8', shell: isWindows, windowsHide: true, timeout: 60_000, env: cleanEnv(),
  })
  return { ok: r.status === 0, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** Жив ли житель — спрашивается у pm2, а не у нашей памяти о том, что мы запускали. */
function running() {
  const r = pm2(['jlist'])
  try {
    const list = JSON.parse(r.out.slice(r.out.indexOf('[')))
    return list.some((p) => p.name === residentName() && p.pm2_env?.status === 'online')
  } catch {
    return false
  }
}

function start() {
  if (!storedToken()) return { ok: false, error: 'no-token' }
  if (access().allowed.length === 0) return { ok: false, error: 'nobody-allowed' }
  if (!folderTrusted()) return { ok: false, error: 'folder-not-trusted' }
  const script = path.join(ROOT, 'scripts', 'agent-channel.cjs')
  if (!existsSync(script)) return { ok: false, error: 'no-launcher' }
  // Один опрашиватель на бота: прежний житель снимается ДО старта, а не после.
  pm2(['delete', residentName()])
  const s = pm2([
    'start', script, '--name', residentName(), '--cwd', ROOT,
    '--time', '--restart-delay', '10000', '--max-restarts', '10',
    '--output', path.join(ROOT, 'logs', `${residentName()}-out.log`),
    '--error', path.join(ROOT, 'logs', `${residentName()}-err.log`),
  ])
  if (!s.ok) return { ok: false, error: 'pm2-refused', detail: s.out.slice(-300) }
  // Снимок — чтобы бот пережил перезагрузку компьютера так же, как сайт.
  pm2(['save'])
  return { ok: true }
}

function stop() {
  pm2(['delete', residentName()])
  pm2(['save'])
  return { ok: true }
}

/** Имя и ручка для BotFather от ОДНОГО случайного кода: хвосты должны совпадать. */
function suggestion() {
  const ccid = Math.random().toString(16).slice(2, 6)
  const title = agentService().charAt(0).toUpperCase() + agentService().slice(1)
  const tail = `_Fractera_${ccid}_bot`
  return { name: `${title}-Fractera-${ccid}`, username: `${title.replace(/[^A-Za-z0-9]/g, '').slice(0, 32 - tail.length)}${tail}` }
}

function channelState() {
  const token = storedToken()
  const bot = readJson(botFile(), {})
  return {
    service: agentService(),
    configured: Boolean(token),
    tail: token ? token.slice(-4) : null,
    botName: bot.name ?? null,
    botUsername: bot.username ?? null,
    allowed: access().allowed.length,
    trusted: folderTrusted(),
    running: running(),
    stateDir: stateDir(),
    suggestion: suggestion(),
  }
}

module.exports = {
  PLUGIN, residentName, stateDir, storedToken, saveToken, activationLink, checkActivation,
  folderTrusted, running, start, stop, channelState, cleanEnv,
}
