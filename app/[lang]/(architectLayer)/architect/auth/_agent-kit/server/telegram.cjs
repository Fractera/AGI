// КАНАЛ TELEGRAM → CLAUDE CODE В ПАПКЕ АГЕНТА УЗЛА (267-3).
//
// Перенос `fractera-memory-starter/lib/channel/{telegram,identity,activation}.mjs` с двумя переменами:
//   1. `bash`, `setsid`, `HOME=/root` → ничего из этого: пути строятся `path.join` от `os.homedir()`;
//   2. папка состояния — `<узел>/data/services/<служба>/channel/telegram`, а не внутри папки службы: та —
//      клон её репозитория, и файлы бота сделали бы его грязным (закон узла о данных служб).
//
// 🔒 ОДНА СЛУЖБА — ОДНА СЕССИЯ CLAUDE CODE, И БОТ РАБОТАЕТ В НЕЙ (решение владельца 2026-09-22). Отдельного
// жителя под pm2 больше нет: терминал узла запускает `claude --channels …`, поэтому всё, что человек пишет в
// Telegram, видно в терминале, а без Telegram он продолжает ту же работу там. Запуск и остановка — ТОЛЬКО во
// вкладке «Терминал»; страница бота лишь показывает состояние.
// 🪦 До этого решения житель `scripts/agent-channel.cjs` держал ВТОРОЙ `claude` для бота — переписку в
// терминале не видел никто, а кнопки «Запустить/Остановить канал» управляли не тем, что человек видел.
//
// 🔒 ПЛАГИН ОФИЦИАЛЬНЫЙ: `telegram@claude-plugins-official`, сервер запускается `bun run` (первоисточник —
// `.mcp.json` плагина). `TELEGRAM_STATE_DIR` — своя папка на экземпляр, дословно из его README: «To run
// multiple bots on one machine… point TELEGRAM_STATE_DIR at a different directory per instance».
//
// 🔒 ПОКА ТЕРМИНАЛ ВЫКЛЮЧЕН, БОТА ЧИТАЕТ УЗЕЛ (`startIdlePoller(service)`, зовёт `lib/agent-kit/mount.cjs`). Он делает две вещи:
// впускает по ссылке `t.me/<бот>?start=<метка>` и на любое сообщение допущенного отвечает системным
// сообщением о состоянии — раньше, чем человек поймёт, что ему никто не отвечает. У бота один
// опрашиватель: как только терминал запущен с каналом, узел замолкает и бота читает плагин.

const { spawn } = require('node:child_process')
const { randomBytes } = require('node:crypto')
const { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { serviceDir } = require('./workspace.cjs')
const session = require('./session.cjs')
const { claudeAuthState, extraBins, resolveBin } = require('./claude-cli.cjs')

const ROOT = process.cwd()
const PLUGIN = 'telegram@claude-plugins-official'
const TOKEN_SHAPE = /^\d{6,}:[A-Za-z0-9_-]{30,}$/
const ACTIVATION_LIFETIME_MS = 60 * 60 * 1000
const IDLE_POLL_MS = 4000

const stateDir = (service) => path.join(ROOT, 'data', 'services', service, 'channel', 'telegram')
const envFile = (service) => path.join(stateDir(service), '.env')
const accessFile = (service) => path.join(stateDir(service), 'access.json')
const botFile = (service) => path.join(stateDir(service), 'bot.json')
const activationFile = (service) => path.join(stateDir(service), 'activation.json')
const messagesFile = (service) => path.join(stateDir(service), 'messages.json')

function readJson(file, fallback) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return fallback }
}

/** Файлы с секретом — только владельцу. На Windows права задаёт ACL папки пользователя, `chmod` там пуст. */
function writeSecret(file, text) {
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, text, { mode: 0o600 })
  try { chmodSync(file, 0o600) } catch { /* Windows */ }
}

function storedToken(service) {
  try {
    const line = readFileSync(envFile(service), 'utf8').split(/\r?\n/).find((l) => l.startsWith('TELEGRAM_BOT_TOKEN='))
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
async function saveToken(service, raw) {
  const token = String(raw ?? '').trim()
  if (!token) return { ok: false, error: 'empty-token' }
  if (!TOKEN_SHAPE.test(token)) return { ok: false, error: 'bad-format' }
  const me = await tg(token, 'getMe')
  if (me.description === 'unreachable') return { ok: false, error: 'telegram-unreachable' }
  if (!me.ok || !me.result?.username) return { ok: false, error: 'token-rejected' }
  mkdirSync(stateDir(service), { recursive: true })
  writeFileSync(botFile(service), JSON.stringify({ name: me.result.first_name ?? '', username: me.result.username }, null, 2))
  writeSecret(envFile(service), `TELEGRAM_BOT_TOKEN=${token}\n`)
  if (!existsSync(accessFile(service))) {
    writeSecret(accessFile(service), JSON.stringify({ dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {} }, null, 2))
  }
  return { ok: true, tail: token.slice(-4), username: me.result.username }
}

function access(service) {
  const a = readJson(accessFile(service), {})
  return { allowed: Array.isArray(a.allowFrom) ? a.allowFrom.map(String) : [] }
}

/** Ссылка допуска: одна метка на час, повторный запрос отдаёт ту же. */
function activationLink(service) {
  const bot = readJson(botFile(service), {})
  if (!bot.username) return { ok: false, error: 'no-bot-username' }
  let nonce = ''
  const a = readJson(activationFile(service), null)
  if (a?.nonce && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS) nonce = a.nonce
  if (!nonce) {
    nonce = randomBytes(12).toString('hex')
    writeSecret(activationFile(service), JSON.stringify({ createdAt: Date.now(), nonce }))
  }
  return { ok: true, url: `https://t.me/${bot.username}?start=${nonce}` }
}

/** Служба узла с папкой — единственные имена, от которых строятся пути и запускается агент. */
function isService(service) {
  return serviceDir(service) !== null
}

// ── СЕССИЯ ТЕРМИНАЛА С КАНАЛОМ ───────────────────────────────────────────────

/** Бот работает, если сессия терминала жива И запущена с каналом (запущенная до допуска — без него). */
function running(service) {
  const s = session.current(service)
  return Boolean(s && s.channel)
}

/** Терминал жив без канала — его запустили до того, как бот был подключён. */
function terminalWithoutChannel(service) {
  const s = session.current(service)
  return Boolean(s && !s.channel)
}

/**
 * 🛑 ЗАВИСИМОСТИ ПЛАГИНА СТАВЯТСЯ ДО ЗАПУСКА `claude`. ✗ Оплачено живым прогоном владельца 2026-09-22: сервер
 * плагина при ПЕРВОМ старте сам делает `bun install`, а `claude` ждёт подключения сервера 30 с (журнал
 * `--debug mcp`). Первая установка в них не укладывалась — бот молчал. Путь плагина — из
 * `~/.claude/plugins/installed_plugins.json`: у каждой машины он свой. Асинхронно — сервер сайта не встаёт.
 */
function preparePlugin(env) {
  return new Promise((resolve) => {
    const reg = readJson(path.join(os.homedir(), '.claude', 'plugins', 'installed_plugins.json'), {})
    const installPath = reg.plugins?.[PLUGIN]?.[0]?.installPath ?? ''
    if (!installPath) return resolve({ ok: false, error: `плагин ${PLUGIN} не установлен: claude plugin install ${PLUGIN}` })
    if (existsSync(path.join(installPath, 'node_modules'))) return resolve({ ok: true })
    const bun = resolveBin('bun', env.PATH || env.Path)
    if (!bun) return resolve({ ok: false, error: 'bun не найден — сервер плагина Telegram запускается им' })
    const child = spawn(bun, ['install', '--no-summary'], { cwd: installPath, env, windowsHide: true })
    let out = ''
    child.stdout.on('data', (d) => { out += d })
    child.stderr.on('data', (d) => { out += d })
    const timer = setTimeout(() => child.kill(), 300_000)
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve(code === 0 ? { ok: true } : { ok: false, error: `bun install в ${installPath} не удался: ${out.slice(-300)}` })
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      resolve({ ok: false, error: `bun install не запустился: ${err.message}` })
    })
  })
}

/**
 * Как запустить `claude` терминала, чтобы бот работал в нём. Нет токена или никого не допустили — `null`:
 * терминал запускается обычным агентом.
 * 🛑 `--permission-mode auto` ОБЯЗАТЕЛЕН: запрос разрешения ушёл бы в тот же канал, который ждёт ответа, и
 * сессия встала бы намертво, пока человек пишет с телефона (оплачено двумя часами молчания бота 2026-09-05).
 * 🛑 `--add-dir` папки состояния: без него — вопрос политики путей, который плагин не пересылает (закон проекта).
 */
async function channelLaunch(service, env) {
  if (!storedToken(service) || access(service).allowed.length === 0) return null
  const pathKey = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH'
  const dirs = [...extraBins(), ...String(env[pathKey] || '').split(path.delimiter).filter(Boolean)]
  const withBins = { ...env, [pathKey]: dirs.join(path.delimiter), TELEGRAM_STATE_DIR: stateDir(service) }
  const ready = await preparePlugin(withBins)
  if (!ready.ok) return { ok: false, error: ready.error }
  return {
    ok: true,
    env: withBins,
    args: ['--channels', `plugin:${PLUGIN}`, '--add-dir', stateDir(service), '--permission-mode', 'auto'],
  }
}

// ── СИСТЕМНОЕ СООБЩЕНИЕ О СОСТОЯНИИ ───────────────────────────────────────────

/**
 * Тексты сообщения приносит страница бота на языке человека и с адресами разделов от того адреса, на котором
 * она открыта (на своём домене это публичные ссылки для телефона). Узел их хранит, потому что отвечает боту и
 * тогда, когда страница закрыта.
 */
function saveMessages(service, raw) {
  const pick = (v) => String(v ?? '').slice(0, 1000)
  const m = { active: pick(raw?.active), inactive: pick(raw?.inactive), noSubscription: pick(raw?.noSubscription) }
  if (!m.active || !m.inactive || !m.noSubscription) return { ok: false, error: 'bad-messages' }
  mkdirSync(stateDir(service), { recursive: true })
  writeFileSync(messagesFile(service), JSON.stringify(m, null, 2))
  return { ok: true }
}

const FALLBACK = {
  active: 'This message was sent by your node. Your terminal is active — write, Claude Code answers.',
  inactive: 'This message was sent by your node. Your terminal is not active — Claude Code will not answer. Open the node terminal and start the agent.',
  noSubscription: 'This message was sent by your node. Claude Code on this computer is not signed in to a subscription. Sign in first, then start the agent in the terminal.',
}

function claudeSignedIn() {
  return new Promise((resolve) => setImmediate(() => resolve(claudeAuthState().loggedIn)))
}

/** Состояние словами: подписка не подключена → сначала она; иначе — активен ли терминал. */
async function statusMessage(service) {
  const m = { ...FALLBACK, ...readJson(messagesFile(service), {}) }
  if ((await claudeSignedIn()) === false) return m.noSubscription
  return running(service) ? m.active : m.inactive
}

// ── УЗЕЛ ЧИТАЕТ БОТА, ПОКА ТЕРМИНАЛ ВЫКЛЮЧЕН ─────────────────────────────────

const idleKey = (service) => `__agiTelegramIdle:${service}`

async function idleTick(service) {
  const token = storedToken(service)
  if (!token || running(service)) return
  const got = await tg(token, 'getUpdates', { allowed_updates: ['message'], timeout: 0 })
  // 409 — бота читает кто-то другой (канал только что поднялся): уступаем без шума.
  if (!got.ok || !Array.isArray(got.result) || got.result.length === 0) return
  if (running(service)) return
  const updates = got.result
  await tg(token, 'getUpdates', { offset: updates[updates.length - 1].update_id + 1, timeout: 0 })

  const a = readJson(activationFile(service), null)
  const nonce = a && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS ? a.nonce : ''
  const answered = new Set()
  for (const u of updates) {
    const msg = u.message
    if (!msg || msg.chat?.type !== 'private' || !msg.from) continue
    const sender = String(msg.from.id)
    if (nonce && typeof msg.text === 'string' && msg.text.trim() === `/start ${nonce}`) {
      const acc = { dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {}, ...readJson(accessFile(service), {}) }
      if (!acc.allowFrom.map(String).includes(sender)) acc.allowFrom.push(sender)
      writeSecret(accessFile(service), JSON.stringify(acc, null, 2))
      rmSync(activationFile(service), { force: true })
    } else if (!access(service).allowed.includes(sender)) {
      // Чужим узел не отвечает: список допущенных — единственная граница бота.
      continue
    }
    if (answered.has(msg.chat.id)) continue
    answered.add(msg.chat.id)
    await tg(token, 'sendMessage', { chat_id: msg.chat.id, text: await statusMessage(service), disable_web_page_preview: true })
  }
}

/**
 * Запускается один раз на службу общим подключением узла (`lib/agent-kit/mount.cjs`), не дверью Next.
 * 🔒 У КАЖДОЙ КОПИИ СВОЙ ОПРОС ТОЛЬКО СВОЕЙ СЛУЖБЫ (271): обход всех служб из каждой копии дал бы по
 * опрашивателю на копию — у бота был бы не один читатель.
 */
function startIdlePoller(service) {
  const key = idleKey(service)
  if (globalThis[key]) return
  let busy = false
  globalThis[key] = setInterval(async () => {
    if (busy) return
    busy = true
    try { await idleTick(service) } catch (err) { console.error(`[telegram] узел не прочитал бота: ${err instanceof Error ? err.message : err}`) }
    busy = false
  }, IDLE_POLL_MS)
  globalThis[key].unref?.()
}

/** Имя и ручка для BotFather от ОДНОГО случайного кода: хвосты должны совпадать. */
function suggestion(service) {
  const ccid = Math.random().toString(16).slice(2, 6)
  const title = service.charAt(0).toUpperCase() + service.slice(1)
  const tail = `_Fractera_${ccid}_bot`
  return { name: `${title}-Fractera-${ccid}`, username: `${title.replace(/[^A-Za-z0-9]/g, '').slice(0, 32 - tail.length)}${tail}` }
}

function channelState(service) {
  const token = storedToken(service)
  const bot = readJson(botFile(service), {})
  return {
    service,
    configured: Boolean(token),
    tail: token ? token.slice(-4) : null,
    botName: bot.name ?? null,
    botUsername: bot.username ?? null,
    allowed: access(service).allowed.length,
    running: running(service),
    terminalWithoutChannel: terminalWithoutChannel(service),
    stateDir: stateDir(service),
    suggestion: suggestion(service),
  }
}

module.exports = {
  PLUGIN, isService, stateDir, storedToken, saveToken, activationLink, saveMessages, channelLaunch,
  running, channelState, startIdlePoller,
}
