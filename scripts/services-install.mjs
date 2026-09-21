// ОДНА КОМАНДА, О КОТОРОЙ ПРОСИЛ ВЛАДЕЛЕЦ: `npm run services:install` (257-4).
//
// Слова владельца 2026-09-20: службы «размещены как бы внутри одного главного
// репозитория стартер AGI то есть чтобы приехали через одну команду».
//
// ── ЧТО ОН ДЕЛАЕТ, ПО ПОРЯДКУ
//   1. читает MICROSERVICES.json — состав узла и закреплённые ТЕГИ;
//   2. приводит каждый блок в microservices/<id>/ ровно той версии;
//   3. читает паспорт блока (OWN-SERVICE-PROPS.json) — ТОЛЬКО читает;
//   4. назначает порт: желаемый из паспорта, занят — следующий свободный из блока;
//   5. ставит зависимости и, если блок того просит, собирает его;
//   6. пишет файл окружения блока — с тем ИМЕНЕМ, которое блок назвал сам;
//   7. дописывает в .env.local узла только NEXT_PUBLIC_* — вынужденное исключение;
//   8. вписывает ФАКТИЧЕСКИЕ порты обратно в реестр.
//
// ── ТРИ РОДА ПЕРЕМЕННЫХ, И ЭТО ГЛАВНОЕ РЕШЕНИЕ ФАЙЛА
//   derived — установщик знает сам: порт, адрес узла, адреса соседей;
//   secret  — генерирует случайное и кладёт в ОБА конца;
//   foreign — чужой ключ: НЕ выдумывает, называет вслух и говорит, что без него
//             не заработает.
// Род объявлен в `.env.example` блока строкой `# kind:` над переменной. Блок,
// который спросили, нельзя заполнить неверно.
//
// 🛑 ЧУЖИХ КЛЮЧЕЙ ОН НЕ СПРАШИВАЕТ ДИАЛОГОМ, И ЭТО РЕШЕНИЕ, А НЕ ЛЕНЬ. Установку
// зовут и вручную, и из автозапуска; модальный вопрос в непривычном месте
// означает зависание, которым проект уже платил двумя часами молчания бота.
// Поэтому недостающие ключи печатаются списком: что именно отсутствует, у какого
// блока и какая способность без него не работает. Человек дописывает их в
// названный файл и зовёт установку снова — она идемпотентна.
//
// 🛑 WINDOWS, ТРИ ОПЛАЧЕННЫХ ПРАВИЛА. `npm` — это `npm.cmd`, а node после
// CVE-2024-27980 не запускает `.cmd` без оболочки и молчит при этом (`EINVAL`,
// ни stdout, ни stderr). Поэтому `shell: true` только на Windows и только с
// постоянными аргументами. `windowsHide: true` — каждому порождённому процессу,
// иначе на экране человека мигают чёрные окна консоли.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { randomBytes, createHash } from 'node:crypto'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { isFree, PORT_BLOCK_START, PORT_BLOCK_END } = require('../lib/server-port.cjs')
const { authEnvOverrides } = require('../lib/domain/public-auth.cjs')

const ROOT = process.cwd()
const REGISTRY = join(ROOT, 'MICROSERVICES.json')
const SERVICES_DIR = join(ROOT, 'microservices')
const NODE_ENV_FILE = join(ROOT, '.env.local')

const IS_WIN = process.platform === 'win32'
const say = (m) => console.log(m)
const warn = []
const missingForeign = []

// ── Запуск чужой программы. Один вход, чтобы правила Windows не разъехались.
function run(cmd, args, cwd, { quiet = false } = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    shell: IS_WIN,
    windowsHide: true,
    stdio: quiet ? 'pipe' : 'pipe',
  })
  return { rc: r.status ?? 1, out: (r.stdout ?? '') + (r.stderr ?? '') }
}

// ── Реестр ───────────────────────────────────────────────────────────────────
if (!existsSync(REGISTRY)) {
  say(`  ОШИБКА: нет ${REGISTRY}. Состав узла описывается им, ставить нечего.`)
  say('===SERVICES_INSTALL_FAILED===')
  process.exit(1)
}
const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'))
if (!Array.isArray(registry.services) || registry.services.length === 0) {
  say('  В составе узла нет ни одного блока — ставить нечего.')
  say('===SERVICES_INSTALL_OK===')
  process.exit(0)
}

// ── Общие секреты: генерируем ОДИН раз и держим в .env.local узла ────────────
//
// 🔒 ПОЧЕМУ ИСТОЧНИК ИМЕННО ФАЙЛ УЗЛА. Ключ обязан совпасть у двух концов. Узел
// переживает переустановку любой службы, значит он и есть та сторона, у которой
// ключ хранится; служба получает копию. Иначе переустановка службы породила бы
// новый ключ, а узел остался бы со старым — и дверь начала бы отвечать отказом,
// выглядящим как поломка службы.
// 🛑 `\r` СНИМАЕТСЯ ЗДЕСЬ, И ЭТО ОПЛАЧЕНО ПЕРВЫМ ЖЕ ПРОГОНОМ. Файлы приезжают из
// git с CRLF, а в JavaScript `.` НЕ совпадает с `\r` и `$` без флага `m` стоит в
// конце строки — образец `^NAME=(.*)$` на строке «PORT=\r» не совпадает никогда.
// Установщик при этом отрапортовал успех, написав ПУСТЫЕ файлы окружения: служба
// данных осталась бы без ключа и слушала бы сеть по умолчанию. Ноль совпадений
// неотличим от «не искали» — ровно тот класс, ради которого ниже стоит проверка
// на пустой разбор.
const splitLines = (text) => text.split(/\r?\n/)

function readEnvFile(file) {
  if (!existsSync(file)) return new Map()
  const map = new Map()
  for (const line of splitLines(readFileSync(file, 'utf8'))) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) map.set(m[1], m[2])
  }
  return map
}

const nodeEnv = readEnvFile(NODE_ENV_FILE)
const newNodeVars = new Map()

function sharedSecret(name) {
  const existing = nodeEnv.get(name) || newNodeVars.get(name)
  if (existing && existing.trim() !== '') return existing
  const value = randomBytes(32).toString('base64')
  newNodeVars.set(name, value)
  return value
}

// ── Порты ────────────────────────────────────────────────────────────────────
//
// 🛑 ПОРТ СЛУЖБА ПРОСИТ, А НАЗНАЧАЕТ УЗЕЛ. В паспорте стоит желаемый номер;
// занят — берём следующий свободный из блока и пишем ФАКТИЧЕСКИЙ в реестр. Без
// этого две купленные службы однажды попросят один номер и подерутся молча.
const takenByRegistry = new Set(
  registry.services.map((s) => s.port).filter((p) => Number.isInteger(p)),
)

// 🛑 «LOCALHOST» — ЭТО ДВА АДРЕСА, И ПОРТ БЫВАЕТ ЗАНЯТ НА ОДНОМ ИЗ НИХ.
// ✗ Оплачено первым же прогоном уступки: узел слушает `[::1]:24680` (его имя
// хоста — `localhost`, и оно разрешилось в IPv6), а проба по `127.0.0.1` нашла
// порт СВОБОДНЫМ и предложила его службе. Обе программы встали бы, каждая на
// своём стеке, и попадание клиента к нужной зависело бы от того, во что ЕГО
// резолвер развернёт слово «localhost». Отказ невоспроизводимый по построению.
async function freeOnBothStacks(port) {
  if (!(await isFree(port, '127.0.0.1'))) return false
  try {
    if (!(await isFree(port, '::1'))) return false
  } catch {
    // Машина без IPv6 — там второй стек и не нужен.
  }
  return true
}

// `installedHere` — ставился ли блок на ЭТОЙ машине (есть отметка установки).
//
// 🛑 РАЗЛИЧИЕ НЕ ФОРМАЛЬНОЕ, И БЕЗ НЕГО РЕЕСТР В GIT СТАНОВИТСЯ ЛОВУШКОЙ. Номер
// порта лежит в реестре и уезжает гостю вместе с репозиторием. На нашей машине
// он верен и занят нашей же службой — переназначать его нельзя: адрес роздан.
// На машине гостя тот же номер — чужое наследство, и там он может быть занят
// чем угодно. Отличает эти два случая ровно одно: ставился ли блок ЗДЕСЬ.
async function assignPort(entry, desired, installedHere) {
  if (Number.isInteger(entry.port)) {
    if (installedHere) return { port: entry.port, moved: false, kept: true }
    if (await freeOnBothStacks(entry.port) && entry.port !== nodePort) {
      return { port: entry.port, moved: false, kept: false, inherited: true }
    }
    say(`  унаследованный из реестра порт ${entry.port} на этой машине занят — назначаю свой`)
    entry.port = null
  }

  const first = Number.isInteger(desired) ? desired : PORT_BLOCK_START
  const candidates = [first]
  for (let p = PORT_BLOCK_START; p <= PORT_BLOCK_END; p += 1) if (p !== first) candidates.push(p)

  for (const p of candidates) {
    if (takenByRegistry.has(p)) continue
    // 🔒 ПОРТ САМОГО УЗЛА ИСКЛЮЧЁН ЯВНО, А НЕ ПО ПРОБЕ. Установку зовут и тогда,
    // когда узел ещё не запущен, — и тогда его порт свободен по всем пробам.
    // Отдав его службе, мы отняли бы у человека адрес, который он уже кому-то
    // дал: узел при следующем старте уступил бы сам и сменил адрес молча.
    if (p === nodePort) continue
    if (await freeOnBothStacks(p)) {
      takenByRegistry.add(p)
      return { port: p, moved: p !== first, kept: false }
    }
  }
  throw new Error(
    `Свободного порта нет во всём блоке ${PORT_BLOCK_START}–${PORT_BLOCK_END}. ` +
      'Остановите лишние службы (npm run serve:stop) и повторите установку.',
  )
}

// ── Разбор `.env.example` блока: имя переменной плюс РОД ─────────────────────
function parseExample(text) {
  const vars = []
  let kind = null
  for (const line of splitLines(text)) {
    const k = line.match(/^#\s*kind:\s*(derived|secret|foreign)\s*$/)
    if (k) { kind = k[1]; continue }
    const v = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (v) {
      vars.push({ name: v[1], kind: kind ?? 'derived', example: v[2] })
      // Род относится к ближайшей переменной ПОСЛЕ него — и к следующим тоже,
      // пока не встретится новый `# kind:`. Так устроены оба наших примера:
      // одна пометка на группу адресов соседей.
    }
  }
  return vars
}

// ── Значения, которые установщик знает сам ───────────────────────────────────
function derivedValue(name, ctx) {
  const { port, id, props } = ctx
  const nodePort = ctx.nodePort
  const nodeUrl = `http://127.0.0.1:${nodePort}`
  const self = `http://127.0.0.1:${port}`

  // 🔒 СВОЙ ДОМЕН ПЕРЕКРЫВАЕТ ПЕТЛЮ (259-8). Подключённый домен выводит вход на
  // `auth.<зона>`, и переустановка обязана дать то же самое: иначе она молча
  // вернёт `127.0.0.1`, и вход снаружи умрёт без единой ошибки. Формула одна —
  // в `lib/domain/public-auth.cjs`, её же зовёт дверь активации.
  const domain = authEnvOverrides(ROOT, [nodeUrl, self])
  if (domain && Object.prototype.hasOwnProperty.call(domain, name)) return domain[name]

  switch (name) {
    case 'PORT': return String(port)
    case 'NODE_ENV': return 'production'
    case 'DATA_BIND': return '127.0.0.1'
    case 'NEXTAUTH_URL': return self
    case 'DATA_PUBLIC_URL': return self
    case 'COOKIE_DOMAIN': return ''            // host-only: одна машина
    case 'COOKIE_SECURE': return 'false'       // http://localhost, Secure не вернётся
    case 'DATABASE_URL': return `file:./data/${id}.db`
    case 'APP_DB_PATH': return `./data/${id}.db`
    case 'ALLOWED_ORIGINS': return [nodeUrl, self].join(',')
    case 'EMBED_MODEL': return 'text-embedding-3-large'
    case 'EMBED_DIMS': return '3072'
    default: break
  }

  // Адреса соседей: спрашиваются у реестра, а не пишутся.
  //
  // 🛑 ОБРАЗЕЦ ИМЕНИ ОБЯЗАН ЗНАТЬ ПОДЧЁРКИВАНИЕ ВНУТРИ, И ЭТОТ КЛАСС В ПРОЕКТЕ
  // УЖЕ ОПЛАЧЕН: первая редакция читала `^([A-Z0-9]+)_URL$` и не видела
  // `AI_BROWSER_URL` — имя с дефисом внутри. Тот же дефект, что у маршрута
  // `/service/<имя>/*`, где образец не знал дефиса.
  const neighbour = name.match(/^([A-Z0-9_]+?)_(?:SERVICE_)?URL$/)
  if (neighbour) {
    const wanted = neighbour[1].toLowerCase().replace(/_/g, '-')
    const found = registry.services.find((s) => s.id === wanted)
    if (found && Number.isInteger(found.port)) return `http://127.0.0.1:${found.port}`
    // 🔒 Пусто значит «такой службы у этого узла нет». Это честный ответ: код
    // службы увидит пустое и скажет об этом, а не пойдёт стучаться в чужой порт.
    return ''
  }

  // Пути серверной линии: на узле их нет, и подставлять чужие нельзя.
  if (/^(APP_ENV_FILE|DATA_ENV_PATH|RAG_ENV_PATH|FRACTERA_MACHINE_ENV|FRACTERA_IP_NODOMAIN_MODE)$/.test(name)) return ''

  warn.push(`  ? ${props.id}: переменная ${name} объявлена derived, но установщик не знает её значения — оставлена пустой`)
  return ''
}

// ── Чем запускать службу ─────────────────────────────────────────────────────
//
// Возвращает { cmd, args, cwd } или null. Ни одной строки, зависящей от имени
// конкретной службы: всё выводится из того, что лежит в её папке.
function findStandaloneServer(dir) {
  const stack = [join(dir, '.next', 'standalone')]
  for (let depth = 0; depth < 5 && stack.length; depth += 1) {
    const next = []
    for (const d of stack) {
      if (!existsSync(d)) continue
      if (existsSync(join(d, 'server.js'))) return d
      for (const name of readdirSync(d, { withFileTypes: true })) {
        if (name.isDirectory() && name.name !== 'node_modules') next.push(join(d, name.name))
      }
    }
    stack.length = 0
    stack.push(...next)
  }
  return null
}

function resolveStart(dir, props) {
  const standaloneDir = findStandaloneServer(dir)
  if (standaloneDir) {
    // Статика — рядом с найденным сервером, а не в корне standalone.
    const staticFrom = join(dir, '.next', 'static')
    if (existsSync(staticFrom)) {
      cpSync(staticFrom, join(standaloneDir, '.next', 'static'), { recursive: true })
    }
    if (existsSync(join(dir, 'public'))) {
      cpSync(join(dir, 'public'), join(standaloneDir, 'public'), { recursive: true })
    }
    return { cmd: 'node', args: [relative(dir, join(standaloneDir, 'server.js')).split('\\').join('/')], cwd: dir }
  }

  // Простая служба: берём её же команду старта, если это честный вызов node.
  // `npm run start` через оболочку не годится в pm2: убитый npm оставляет
  // сироту — узел уже платил за этот класс отказа.
  try {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    const m = String(pkg.scripts?.start ?? '').match(/^node\s+([^\s]+)$/)
    if (m) return { cmd: 'node', args: [m[1]], cwd: dir }
  } catch { /* нет package.json — ответим null */ }

  return null
}

// ── Сам обход ────────────────────────────────────────────────────────────────
const nodePort = (() => {
  try { return JSON.parse(readFileSync(join(ROOT, 'logs', 'runtime.json'), 'utf8')).port ?? PORT_BLOCK_START }
  catch { return PORT_BLOCK_START }
})()

mkdirSync(SERVICES_DIR, { recursive: true })

let failed = 0
const summary = []

for (const entry of registry.services) {
  const dir = join(SERVICES_DIR, entry.id)
  say(`\n── ${entry.id} — ${entry.version}`)

  // 1. Привести репозиторий к ЗАКРЕПЛЁННОЙ версии.
  if (!existsSync(join(dir, '.git'))) {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
    const c = run('git', ['clone', '--quiet', '--branch', entry.version, '--depth', '1', entry.repo, dir], ROOT)
    if (c.rc !== 0) {
      say(`  ОШИБКА клона: ${c.out.trim().split('\n').slice(-2).join(' ')}`)
      failed += 1
      continue
    }
    say('  клонирован')
  } else {
    run('git', ['fetch', '--quiet', '--tags', 'origin'], dir)
    const co = run('git', ['checkout', '--quiet', `tags/${entry.version}`], dir)
    if (co.rc !== 0) {
      say(`  ОШИБКА перехода на ${entry.version}: ${co.out.trim().split('\n').slice(-1)[0]}`)
      failed += 1
      continue
    }
    say('  обновлён до закреплённой версии')
  }

  // 🔒 Сверяем ФАКТ, а не код возврата: версия, на которой мы стоим, обязана
  // совпасть с реестром. Иначе «поставили v1.0.1» — это обещание, а не факт.
  const head = run('git', ['describe', '--tags', '--exact-match'], dir).out.trim()
  if (head !== entry.version) {
    say(`  ОШИБКА: в папке версия «${head || 'без тега'}», а реестр требует «${entry.version}»`)
    failed += 1
    continue
  }

  // 2. Паспорт. Только читаем.
  const propsFile = join(dir, 'OWN-SERVICE-PROPS.json')
  if (!existsSync(propsFile)) {
    say('  ОШИБКА: у блока нет OWN-SERVICE-PROPS.json — установщику не у кого спросить, как его ставить')
    failed += 1
    continue
  }
  const props = JSON.parse(readFileSync(propsFile, 'utf8'))

  // Отметка прошлой установки — она же ответ на вопрос «ставился ли блок ЗДЕСЬ».
  const FORCE = process.argv.includes('--force')
  const stampFile = join(dir, '.install-stamp.json')
  const stamp = existsSync(stampFile) ? JSON.parse(readFileSync(stampFile, 'utf8')) : {}
  const installedHere = existsSync(stampFile)

  // 3. Порт.
  let port
  try {
    const a = await assignPort(entry, props.port?.desired, installedHere)
    port = a.port
    say(`  порт ${port}` + (a.kept ? ' (уже был назначен здесь, не трогаем)'
      : a.inherited ? ' (унаследован из реестра, свободен — берём)'
      : a.moved ? ` (желаемый ${props.port?.desired} занят — уступили)` : ''))
  } catch (e) {
    say(`  ОШИБКА порта: ${e.message}`)
    failed += 1
    continue
  }
  entry.port = port

  // 4. Зависимости.
  //
  // 🔒 ПОВТОРНЫЙ ПРОГОН НЕ ПЕРЕУСТАНАВЛИВАЕТ И НЕ ПЕРЕСОБИРАЕТ БЕЗ ПРИЧИНЫ.
  // Установку зовут часто — после правки состава, после ввода чужого ключа, из
  // проверок. Минута пересборки на каждый зов превращает «одну команду» в то,
  // чего человек начинает избегать. Отметка в `.install-stamp.json` хранит
  // версию и отпечаток окружения; совпали — работа пропускается и это сказано
  // вслух. `--force` пересобирает всё безусловно.
  const depsReady = existsSync(join(dir, 'node_modules')) && stamp.version === entry.version

  if (depsReady && !FORCE) {
    say('  зависимости на месте (та же версия) — пропущено')
  } else {
    const ci = run('npm', ['ci', '--no-audit', '--no-fund'], dir)
    if (ci.rc !== 0) {
      say('  ОШИБКА установки зависимостей:')
      say(ci.out.split('\n').filter((l) => l.includes('npm error')).slice(0, 6).map((l) => '    ' + l).join('\n'))
      failed += 1
      continue
    }
    say('  зависимости поставлены')
  }

  // 5. Файл окружения — С ИМЕНЕМ, КОТОРОЕ НАЗВАЛ САМ БЛОК.
  const envName = props.env?.file
  if (!envName) {
    say('  ОШИБКА: паспорт не называет env.file — установщик не станет угадывать имя файла окружения')
    failed += 1
    continue
  }
  const exampleName = props.env?.example ?? '.env.example'
  const examplePath = join(dir, exampleName)
  if (!existsSync(examplePath)) {
    say(`  ОШИБКА: нет ${exampleName} — список вопросов отсутствует`)
    failed += 1
    continue
  }

  const vars = parseExample(readFileSync(examplePath, 'utf8'))

  // 🛑 ПУСТОЙ РАЗБОР — ЭТО ОТКАЗ, А НЕ «ВОПРОСОВ НЕТ». Блок, у которого есть
  // `.env.example`, обязан объявить хотя бы одну переменную; ноль означает, что
  // сломался разбор, а не что настраивать нечего. Без этой проверки установщик
  // пишет пустой файл окружения и рапортует об успехе — служба поднимается с
  // умолчаниями, включая отсутствующий ключ, и выглядит рабочей.
  if (vars.length === 0) {
    say(`  ОШИБКА: в ${exampleName} не разобрано ни одной переменной. ` +
        'Либо файл пуст, либо сломан разбор — в обоих случаях писать окружение нельзя.')
    failed += 1
    continue
  }

  const ctx = { port, id: entry.id, props, nodePort }
  const lines = [
    '# ПОРОЖДЁННЫЙ ФАЙЛ. Его пишет `npm run services:install` узла AGI.',
    '#',
    '# 🛑 ПРАВКА ЗДЕСЬ ЖИВЁТ ДО СЛЕДУЮЩЕЙ УСТАНОВКИ И ИСЧЕЗАЕТ МОЛЧА.',
    '# Настройки меняются в составе узла (MICROSERVICES.json) и в паспорте блока,',
    '# а не здесь. Исключение — чужие ключи: их вписывают сюда, потому что',
    '# установщик их не выдумывает.',
    `#`,
    `# блок: ${entry.id} · версия: ${entry.version} · порт: ${port}`,
    `# порождён: ${new Date().toISOString()}`,
    '',
  ]

  for (const v of vars) {
    if (v.kind === 'secret') {
      lines.push(`${v.name}=${sharedSecret(v.name)}`)
    } else if (v.kind === 'foreign') {
      const kept = readEnvFile(join(dir, envName)).get(v.name)
      if (kept && kept.trim() !== '') {
        // 🔒 Чужой ключ, однажды введённый человеком, ПЕРЕЖИВАЕТ переустановку.
        // Иначе установка стирала бы работу человека, и он вводил бы ключ снова.
        lines.push(`${v.name}=${kept}`)
      } else {
        lines.push(`${v.name}=`)
        missingForeign.push({ id: entry.id, name: v.name, file: join(dir, envName) })
      }
    } else {
      lines.push(`${v.name}=${derivedValue(v.name, ctx)}`)
    }
  }

  // 🔒 ДОМЕН ДОПИСЫВАЕТ ТО, ЧЕГО БЛОК НЕ ОБЪЯВИЛ (259-8): `AUTH_TRUST_HOST` не
  // стоит в `.env.example` службы входа, а без него за туннелем она отвечает 500.
  // Дописываются только блоку, который объявил `NEXTAUTH_URL`, — то есть входу.
  if (vars.some((v) => v.name === 'NEXTAUTH_URL')) {
    const domain = authEnvOverrides(ROOT, [])
    for (const [name, value] of Object.entries(domain || {})) {
      if (!vars.some((v) => v.name === name)) lines.push(`${name}=${value}`)
    }
  }

  const envText = lines.join('\n') + '\n'
  writeFileSync(join(dir, envName), envText, 'utf8')
  say(`  ${envName} написан (${vars.length} переменных)`)

  // Отпечаток окружения БЕЗ строки времени: иначе он меняется каждый прогон, и
  // отметка перестала бы отличать настоящую правку от повторного зова.
  const envFingerprint = createHash('sha256')
    .update(envText.split('\n').filter((l) => !l.startsWith('# порождён:')).join('\n'))
    .digest('hex')
    .slice(0, 16)

  if (props.runtime?.build) {
    const built = existsSync(join(dir, '.next'))
    if (built && !FORCE && stamp.version === entry.version && stamp.env === envFingerprint) {
      say('  сборка на месте (версия и окружение те же) — пропущена')
    } else {
      const b = run('npm', ['run', 'build'], dir)
      if (b.rc !== 0) {
        say('  ОШИБКА сборки блока:')
        say(b.out.split('\n').slice(-8).map((l) => '    ' + l).join('\n'))
        failed += 1
        continue
      }
      say('  собран')
    }
  }

  // 6. ЧЕМ ЭТУ СЛУЖБУ ЗАПУСКАТЬ — выясняется здесь и записывается в отметку.
  //
  // 🔒 ЭТО МАШИННЫЙ ФАКТ, И ПОТОМУ ЕМУ НЕ МЕСТО В ПАСПОРТЕ. Паспорт принадлежит
  // службе и одинаков у всех, кто её поставил; путь к собранному серверу зависит
  // от того, как Next вывел корень трассировки НА ЭТОЙ машине. Измерено: из-за
  // соседнего package-lock.json узла standalone-сервер авторизации уехал в
  // `.next/standalone/microservices/auth/server.js`, а не в корень standalone.
  //
  // 🛑 И ВТОРОЕ, ЧЕГО NEXT НЕ ДЕЛАЕТ САМ: статику в standalone он не копирует.
  // Без этого страницы рисуются, а КАЖДЫЙ стиль и скрипт отдают 404 — снаружи
  // это выглядит «сломалась вёрстка», а не «не доделана упаковка».
  const start = resolveStart(dir, props)
  if (!start) {
    say('  ОШИБКА: нечем запускать — не нашёл ни standalone-сервера, ни простой команды старта')
    failed += 1
    continue
  }
  say(`  запуск: ${start.cmd} ${start.args.join(' ')}`)

  writeFileSync(stampFile, JSON.stringify({
    version: entry.version,
    env: envFingerprint,
    port,
    start,
    health: props.health?.path ?? null,
    at: new Date().toISOString(),
  }, null, 2), 'utf8')

  summary.push({ id: entry.id, version: entry.version, port, stack: props.runtime?.stack })
}

// ── 6. Фактические порты — обратно в реестр ──────────────────────────────────
writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + '\n', 'utf8')

// ── 7. NEXT_PUBLIC_* узла — единственное вынужденное исключение ──────────────
//
// 🔒 Браузер реестра не читает, а эти значения запекаются в бандл при сборке.
// Поэтому они — производное от реестра, и в шапке файла это сказано словами.
const authPort = registry.services.find((s) => s.id === 'auth')?.port
const dataPort = registry.services.find((s) => s.id === 'data')?.port
if (Number.isInteger(authPort)) newNodeVars.set('NEXT_PUBLIC_AUTH_URL', `http://127.0.0.1:${authPort}`)
if (Number.isInteger(dataPort)) newNodeVars.set('NEXT_PUBLIC_MEDIA_URL', `http://127.0.0.1:${dataPort}`)

if (newNodeVars.size > 0) {
  const existing = existsSync(NODE_ENV_FILE) ? readFileSync(NODE_ENV_FILE, 'utf8') : ''
  let text = existing
  const header = '\n# ─── ПРОИЗВОДНОЕ ОТ MICROSERVICES.json — пишет npm run services:install ───\n' +
    '# Правка здесь держится до следующей установки. Источник — реестр состава.\n' +
    '# NEXT_PUBLIC_* стоят тут вынужденно: браузер реестра не читает, а эти\n' +
    '# значения запекаются в бандл на сборке — значит после установки нужна пересборка.\n'
  if (!text.includes('ПРОИЗВОДНОЕ ОТ MICROSERVICES.json')) text += header
  for (const [k, v] of newNodeVars) {
    const re = new RegExp(`^${k}=.*$`, 'm')
    if (re.test(text)) text = text.replace(re, `${k}=${v}`)
    else text += `${k}=${v}\n`
  }
  mkdirSync(dirname(NODE_ENV_FILE), { recursive: true })
  writeFileSync(NODE_ENV_FILE, text, 'utf8')
  say(`\n  .env.local узла: обновлено переменных — ${newNodeVars.size}`)
}

// ── 8. Обновить живущие процессы, если они уже запущены ──────────────────────
//
// 🛑 `pm2 delete` + `pm2 start`, А НЕ `restart`. pm2 ХРАНИТ ОКРУЖЕНИЕ ПРОЦЕССА:
// переменная, убранная из конфига, остаётся в живом процессе, и `--update-env`
// её не вычищает. Оплачено дважды за один вечер, и оба раза выглядело как
// «правка не применилась».
//
// 🔒 ЗАПУСКАЕМ ТОЛЬКО ТО, ЧТО УЖЕ БЫЛО ЗАПУЩЕНО. Установка — не команда «подними
// узел»: её зовут и на свежей машине, где сайт ещё не поднимали. Подняться
// целиком — дело `npm run serve:start`.
const pm2cmd = IS_WIN ? 'pm2.cmd' : 'pm2'
const listed = run(pm2cmd, ['jlist'], ROOT, { quiet: true })
let running = []
try { running = JSON.parse(listed.out.slice(listed.out.indexOf('['))).map((a) => a.name) } catch { /* pm2 не отвечает */ }

const refreshed = []
for (const s of summary) {
  for (const suffix of ['', '-watch']) {
    const name = `fractera-svc-${s.id}${suffix}`
    if (!running.includes(name)) continue
    run(pm2cmd, ['delete', name], ROOT, { quiet: true })
    const st = run(pm2cmd, ['start', 'ecosystem.config.cjs', '--only', name], ROOT, { quiet: true })
    if (st.rc === 0) refreshed.push(name)
  }
}
if (refreshed.length) {
  run(pm2cmd, ['save'], ROOT, { quiet: true })
  say(`\n  перезапущено с чистым окружением (delete + start): ${refreshed.join(', ')}`)
}

// ── Итог ─────────────────────────────────────────────────────────────────────
say('\n── СОСТАВ УЗЛА ПОСЛЕ УСТАНОВКИ')
for (const s of summary) say(`  ${s.id} — ${s.version} — порт ${s.port} — ${s.stack}`)

if (warn.length) { say('\n── ЗАМЕЧАНИЯ'); warn.forEach((w) => say(w)) }

if (missingForeign.length) {
  say('\n── ЧУЖИЕ КЛЮЧИ, КОТОРЫХ НЕТ. Установщик их не выдумывает.')
  for (const m of missingForeign) {
    say(`  ${m.id}: ${m.name} — впишите в ${m.file}`)
  }
  say('  Без них блок работает, но способность, которой они нужны, отвечает отказом.')
}

if (failed > 0) {
  say(`\n===SERVICES_INSTALL_FAILED=== блоков с ошибкой: ${failed}`)
  process.exit(1)
}

say('\n🛑 После установки узлу нужна ПЕРЕСБОРКА: npm run serve:rebuild — значения')
say('   NEXT_PUBLIC_* запекаются в сборку, и без неё правка не применится.')
say('===SERVICES_INSTALL_OK===')
