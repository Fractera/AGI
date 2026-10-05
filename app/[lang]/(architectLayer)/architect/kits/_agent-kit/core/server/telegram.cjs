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
// 409-3: раз в 3 с (владелец 2026-10-05) — нажатие «Запустить» узел видит не позже чем через 3 с.
const IDLE_POLL_MS = 3000

const stateDir = (service) => path.join(ROOT, 'data', 'services', service, 'channel', 'telegram')
const envFile = (service) => path.join(stateDir(service), '.env')
const accessFile = (service) => path.join(stateDir(service), 'access.json')
const botFile = (service) => path.join(stateDir(service), 'bot.json')
const activationFile = (service) => path.join(stateDir(service), 'activation.json')
const messagesFile = (service) => path.join(stateDir(service), 'messages.json')
const pendingFile = (service) => path.join(ROOT, 'data', 'services', service, 'wake', 'pending.json')

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
    args: ['--channels', `plugin:${PLUGIN}`, '--add-dir', stateDir(service), '--permission-mode', 'auto', ...githubRule(service)],
  }
}

/**
 * 374-4 (слово владельца 2026-10-02: «работу через Telegram бот, коммит автоматически всегда» — «коммит и сразу отправка в
 * GitHub»; в терминале — «нельзя запрещать делать коммит по требованию»). Правило дописывается к запуску агента ЭЛЕМЕНТА: агент
 * узла (`workspace: node`) правит само ядро, его отправка в GitHub — не этот путь. Один комплект на все элементы — правило
 * получают все, без правки репозиториев элементов. Команда — скрипт ядра по абсолютному пути (дверь «Отправить» по петле).
 */
function githubRule(service) {
  const manifestFile = path.join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect', String(service), 'agent-kit.json')
  try {
    if (JSON.parse(readFileSync(manifestFile, 'utf8')).workspace === 'node') return []
  } catch { /* общая копия [item] или служба без манифеста — элемент */ }
  const script = path.join(process.cwd(), 'scripts', 'element-github-push.mjs')
  return ['--append-system-prompt', `GitHub rule of this AGI ITEM (node step 374). When a task comes through the Telegram channel, finish it, commit your changes and immediately send them to GitHub by running: node "${script}" ${service} — then tell the person the line it printed (===GITHUB_PUSH_OK=== or the reason). For a task typed in this terminal, commit as your instructions say and send to GitHub only when the person asks — with the same command.`]
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
  const got = await tg(token, 'getUpdates', { allowed_updates: ['message', 'callback_query'], timeout: 0 })
  // 409 — бота читает кто-то другой (канал только что поднялся): уступаем без шума.
  if (!got.ok || !Array.isArray(got.result) || got.result.length === 0) return
  if (running(service)) return
  const updates = got.result
  await tg(token, 'getUpdates', { offset: updates[updates.length - 1].update_id + 1, timeout: 0 })

  const a = readJson(activationFile(service), null)
  const nonce = a && Date.now() - a.createdAt < ACTIVATION_LIFETIME_MS ? a.nonce : ''
  const answered = new Set()
  for (const u of updates) {
    if (u.callback_query) { await onButton(service, token, u.callback_query); continue }
    const msg = u.message
    if (!msg || msg.chat?.type !== 'private' || !msg.from) continue
    const sender = String(msg.from.id)
    let activated = false
    if (nonce && typeof msg.text === 'string' && msg.text.trim() === `/start ${nonce}`) {
      const acc = { dmPolicy: 'allowlist', allowFrom: [], groups: {}, pending: {}, ...readJson(accessFile(service), {}) }
      if (!acc.allowFrom.map(String).includes(sender)) acc.allowFrom.push(sender)
      writeSecret(accessFile(service), JSON.stringify(acc, null, 2))
      rmSync(activationFile(service), { force: true })
      activated = true
    } else if (!access(service).allowed.includes(sender)) {
      // Чужим узел не отвечает: список допущенных — единственная граница бота.
      continue
    }
    // 409-4 (владелец 2026-10-05: агент просыпается «и на сообщение в Telegram», с подтверждением до старта): текст
    // допущенного при выключенном терминале — не «терминал не активен», а тот же вопрос с кнопками; после «Запустить» агент
    // получает это сообщение. Команды (`/…`), не текст и неподключённая подписка — прежнее сообщение о состоянии.
    const said = typeof msg.text === 'string' ? msg.text.trim() : ''
    if (!activated && said && !said.startsWith('/') && (await claudeSignedIn()) !== false) {
      const who = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || sender
      await askToStart(service, { text: humanPrompt(msg.chat.id, who, said), from: who, about: said, kind: 'human' })
      continue
    }
    if (answered.has(msg.chat.id)) continue
    answered.add(msg.chat.id)
    await tg(token, 'sendMessage', { chat_id: msg.chat.id, text: await statusMessage(service), disable_web_page_preview: true })
  }
}

// ── ПОДТВЕРЖДЕНИЕ ЗАПУСКА В TELEGRAM (409-3) ──────────────────────────────────
//
// Владелец 2026-10-05: «запрос → подтверждение в Telegram → сессия → предложение закрыть»; «ждём без предела, проверка
// каждые 3 с»; бота нет — старт сразу. Бот элемента подключён (токен И хотя бы один допущенный — то же определение, что у
// рассылки 408-5) и сессии нет — `wake` не рождает сессию, а зовёт `askToStart`: допущенным уходит вопрос с кнопками
// «Запустить» / «Не сейчас», запросы копятся в `data/services/<id>/wake/pending.json` (переживают перезапуск узла). Нажатие
// приходит опросу узла (`idleTick`, `callback_query`) — пока терминал выключен, бота читает только он. «Запустить» → `starter`
// (его кладёт bridge.cjs: `wake` с подтверждением) и все накопленные тексты во вход агента. «Не сейчас» → запросы сняты,
// каждому вызывающему, оставившему `declineUrl`, — ответ «человек не стал запускать» (иначе его задача ждала бы вечно).

/** Подключён ли бот службы: токен и хотя бы один допущенный. */
function connected(service) {
  return Boolean(storedToken(service)) && access(service).allowed.length > 0
}

/** Язык человека этого бота — по его системным сообщениям (как у рассылки 408-6): кириллица → ru. */
function botLang(service) {
  try { return /[а-яё]/i.test(readFileSync(messagesFile(service), 'utf8')) ? 'ru' : 'en' } catch { return 'en' }
}

/** `<адрес>.<зона>` элемента — как подпись рассылки 408-5. */
function named(service) {
  let address = service
  try {
    const a = JSON.parse(readFileSync(path.join(ROOT, 'data', 'services', service, 'address.json'), 'utf8')).address
    if (typeof a === 'string' && a) address = a
  } catch { /* адрес = id */ }
  try {
    const zone = JSON.parse(readFileSync(path.join(ROOT, 'logs', 'domain.json'), 'utf8')).zone
    if (typeof zone === 'string' && zone && !address.includes('.')) return `${address}.${zone}`
  } catch { /* без зоны */ }
  return address
}

const ASK = {
  en: {
    title: (who) => `${who}: asking to start the terminal.`, from: 'From', about: 'Task', go: 'Start', no: 'Not now',
    started: 'Terminal started — the agent got the task.', declined: 'Not started.',
    memory: (f, n) => `Not started: not enough free memory (${f} MB free, ${n} MB needed). Press «Start» again later.`,
    failed: (r) => `Not started: ${r}. Press «Start» again.`,
    declineText: 'The person chose not to start the agent terminal now.',
    titleHuman: (who) => `${who}: the terminal is off. Start it and pass your message to the agent?`, message: 'Your message',
    startedHuman: 'Terminal started — the agent got your message.',
  },
  ru: {
    title: (who) => `${who}: просят запустить терминал.`, from: 'Кто', about: 'Задача', go: 'Запустить', no: 'Не сейчас',
    started: 'Терминал запущен — агент получил задачу.', declined: 'Не запущено.',
    memory: (f, n) => `Не запущено: не хватает свободной памяти (свободно ${f} МБ, нужно ${n} МБ). Нажмите «Запустить» позже.`,
    failed: (r) => `Не запущено: ${r}. Нажмите «Запустить» ещё раз.`,
    declineText: 'Человек не стал сейчас запускать терминал агента.',
    titleHuman: (who) => `${who}: терминал выключен. Запустить его и передать агенту ваше сообщение?`, message: 'Ваше сообщение',
    startedHuman: 'Терминал запущен — агент получил ваше сообщение.',
  },
}

/** 409-4: что вставить агенту из сообщения человека — кто, откуда и как ответить (инструмент reply канала Telegram). */
function humanPrompt(chatId, who, said) {
  return `Сообщение из Telegram от ${who} (chat_id ${chatId}), пока терминал был выключен: ${said} — ответь ему в Telegram инструментом reply канала (chat_id ${chatId}).`
}

const allHuman = (items) => items.length > 0 && items.every((it) => it.kind === 'human')

const cutText = (t, n) => (t.length > n ? `${t.slice(0, n - 1)}…` : t)

function askText(service, items, lang) {
  const t = ASK[lang]
  const lines = [(allHuman(items) ? t.titleHuman : t.title)(named(service))]
  for (const it of items.slice(-5)) {
    if (it.kind === 'human') { lines.push(`${t.message}: ${cutText(it.about, 300)}`); continue }
    if (it.from) lines.push(`${t.from}: ${it.from}`)
    if (it.about) lines.push(`${t.about}: ${cutText(it.about, 300)}`)
  }
  return cutText(lines.join('\n'), 3500)
}

const buttons = (p, lang) => ({
  inline_keyboard: [[{ text: ASK[lang].go, callback_data: `wake:${p.id}:go` }, { text: ASK[lang].no, callback_data: `wake:${p.id}:no` }]],
})

let starter = null
/** bridge.cjs кладёт сюда запуск с подтверждением — без круговой зависимости модулей. */
function setStarter(fn) { starter = fn }

/**
 * Спросить человека в Telegram, запускать ли терминал. Запрос уже висит — задача добавляется к нему и вопрос обновляется,
 * а не шлётся вторым. Возвращает `{ ok, pending: true, asked }` (`asked` — сколько чатов получили вопрос).
 */
async function askToStart(service, { text, from, about, declineUrl, kind = 'call' } = {}) {
  const token = storedToken(service)
  const file = pendingFile(service)
  const p = readJson(file, null) ?? { id: randomBytes(6).toString('hex'), createdAt: new Date().toISOString(), items: [], asked: [] }
  p.items.push({ kind, text: text ?? '', from: from ?? '', about: about ?? '', declineUrl: declineUrl ?? '', at: new Date().toISOString() })
  const lang = botLang(service)
  const body = askText(service, p.items, lang)
  if (p.asked.length === 0) {
    for (const chat of access(service).allowed) {
      const r = await tg(token, 'sendMessage', { chat_id: chat, text: body, reply_markup: buttons(p, lang), disable_web_page_preview: true })
      if (r.ok && r.result?.message_id) p.asked.push({ chat, messageId: r.result.message_id })
    }
  } else {
    for (const a of p.asked) {
      await tg(token, 'editMessageText', { chat_id: a.chat, message_id: a.messageId, text: body, reply_markup: buttons(p, lang), disable_web_page_preview: true })
    }
  }
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(p, null, 2))
  return { ok: true, pending: true, asked: p.asked.length }
}

/** Заменить вопрос итогом во всех чатах; `keep` — оставить кнопки (нажать «Запустить» ещё раз). */
async function closeAsk(service, token, p, outcome, keep, lang) {
  const text = `${askText(service, p.items, lang)}\n\n${outcome}`
  for (const a of p.asked) {
    await tg(token, 'editMessageText', { chat_id: a.chat, message_id: a.messageId, text, ...(keep ? { reply_markup: buttons(p, lang) } : {}) })
  }
}

/** Ответ вызывающему «человек не стал запускать» — его дверью задачи, ключом узла, только по петле. */
async function declineCaller(url, text) {
  try {
    const u = new URL(url)
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') return
    await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Node-Key': process.env.SETTINGS_SECRET ?? '' },
      body: JSON.stringify({ text, failed: true }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch { /* вызывающий недоступен — его задача останется ждать */ }
}

/** Нажатие кнопки вопроса. Только допущенный и только действующий запрос. */
async function onButton(service, token, q) {
  const sender = String(q.from?.id ?? '')
  const m = /^wake:([0-9a-f]+):(go|no)$/.exec(String(q.data ?? ''))
  const p = readJson(pendingFile(service), null)
  if (!access(service).allowed.includes(sender) || !m || !p || p.id !== m[1]) {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id })
    return
  }
  const lang = botLang(service)
  const t = ASK[lang]
  if (m[2] === 'no') {
    await tg(token, 'answerCallbackQuery', { callback_query_id: q.id, text: t.declined })
    rmSync(pendingFile(service), { force: true })
    await closeAsk(service, token, p, t.declined, false, lang)
    for (const it of p.items) if (it.declineUrl) await declineCaller(it.declineUrl, t.declineText)
    return
  }
  await tg(token, 'answerCallbackQuery', { callback_query_id: q.id, text: t.go })
  const text = p.items.map((it) => it.text).filter(Boolean).join('\n\n')
  const out = typeof starter === 'function' ? await starter(service, { text: text || undefined }) : { ok: false, reason: 'no-starter' }
  if (out.ok) {
    rmSync(pendingFile(service), { force: true })
    await closeAsk(service, token, p, allHuman(p.items) ? t.startedHuman : t.started, false, lang)
  } else {
    const why = out.reason === 'memory' ? t.memory(out.freeMb, out.perSessionMb) : t.failed(String(out.reason ?? 'unknown'))
    await closeAsk(service, token, p, why, true, lang)
  }
}

// ── ПРЕДЛОЖЕНИЕ ЗАКРЫТЬ ТЕРМИНАЛ (409-5) ──────────────────────────────────────
//
// Пока терминал запущен, бота читает плагин каналов, и чужие кнопки он выбрасывает (server.ts 0.0.7: принимает только
// `perm:…`). Поэтому вопрос — текстом, без кнопок (владелец 2026-10-05: «Ответ текстом»): ответ «закрыть» получает агент через
// канал и закрывает свой терминал дверью ядра (`POST /api/agents/done` с `close`). Бота нет — ничего не шлётся и ничего не
// закрывается: закрывать без ответа человека нельзя.

const CLOSE = {
  en: {
    done: (who) => `${who}: the work is done. Close the terminal? Reply «close» — the agent will close it.`,
    timeout: (who) => `${who}: the terminal has been running for 60 minutes since it was woken. Close it? Reply «close» — the agent will close it.`,
  },
  ru: {
    done: (who) => `${who}: работа закончена. Закрыть терминал? Ответьте «закрыть» — агент закроет его сам.`,
    timeout: (who) => `${who}: терминал работает 60 минут с пробуждения. Закрыть его? Ответьте «закрыть» — агент закроет его сам.`,
  },
}

async function askToClose(service, why) {
  if (!connected(service)) return { ok: true, asked: 0, reason: 'no-telegram' }
  const token = storedToken(service)
  const text = CLOSE[botLang(service)][why === 'timeout' ? 'timeout' : 'done'](named(service))
  let asked = 0
  for (const chat of access(service).allowed) {
    const r = await tg(token, 'sendMessage', { chat_id: chat, text, disable_web_page_preview: true })
    if (r.ok) asked++
  }
  return { ok: true, asked }
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
  running, channelState, startIdlePoller, connected, askToStart, setStarter, askToClose,
}
