// СТОРОЖ СОСТАВА УЗЛА: MICROSERVICES.json (257-3).
//
// 🔒 ЧТО ОН ОХРАНЯЕТ И ПОЧЕМУ ИМЕННО ЭТО. Реестр — единственное место, где узел
// узнаёт адрес службы, и он лежит в git, то есть уезжает КАЖДОМУ гостю. Три вещи
// здесь ломаются молча, и ни одну не видят ни типы, ни сборка:
//
//   1. версия, записанная веткой вместо тега → два человека, выполнившие одну и ту
//      же команду в разные дни, получают разные узлы, и отличие не записано нигде;
//   2. два блока на одном порту → они подерутся при запуске, и проигравший будет
//      выглядеть сломанной службой, а не занятым портом;
//   3. секрет, попавший в реестр → уедет каждому гостю вместе с репозиторием.
//
// 🛑 ПРИБОР ПРОВЕРЯЕТСЯ ПОРЧЕЙ, А НЕ ЗЕЛЁНЫМ ЦВЕТОМ. У каждого правила ниже есть
// своя порча, и она названа в его комментарии. Зелёный цвет означает порядок
// только после того, как доказано, что сторож умеет краснеть.
//
// 🔒 ПОЧЕМУ `port: null` — ЭТО НЕ ОШИБКА. Узел, который только что скопировали,
// ещё не выполнял установку: службы объявлены, но не поставлены. Это законное
// состояние, и сторож обязан его пропускать — иначе свежий клон не собирается.

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const FILE = join(ROOT, 'MICROSERVICES.json')

const PORT_MIN = 24680
const PORT_MAX = 24699

const out = []
let errors = 0
const fail = (rule, m) => { errors += 1; out.push(`  ОШИБКА [${rule}]: ${m}`) }

// ── 1. registry-parse. Порча: сломать JSON запятой.
if (!existsSync(FILE)) {
  console.log(`  ОШИБКА [registry-missing]: нет файла ${FILE}`)
  console.log('===MICROSERVICES_FAILED===')
  process.exit(1)
}

let reg
try {
  reg = JSON.parse(readFileSync(FILE, 'utf8'))
} catch (e) {
  console.log(`  ОШИБКА [registry-parse]: файл не разбирается как JSON — ${e.message}`)
  console.log('===MICROSERVICES_FAILED===')
  process.exit(1)
}

if (!Array.isArray(reg.services)) {
  console.log('  ОШИБКА [registry-shape]: нет массива services')
  console.log('===MICROSERVICES_FAILED===')
  process.exit(1)
}

const ids = new Map()
const ports = new Map()

// Имена полей, само присутствие которых означает, что в реестр попал секрет.
// Список намеренно шире нужного: реестр описывает УСТРОЙСТВО, и ни одно значение
// такого рода здесь не имеет законного применения.
const SECRET_NAMES = /(secret|token|password|passwd|apikey|api_key|credential|private)/i

for (const [i, s] of reg.services.entries()) {
  const where = `services[${i}]${s && s.id ? ` (${s.id})` : ''}`

  if (!s || typeof s !== 'object') { fail('entry-shape', `${where}: не объект`); continue }

  // ── 2. id-format. Порча: написать id с пробелом или заглавными.
  if (typeof s.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,31}$/.test(s.id)) {
    fail('id-format', `${where}: id обязан быть строчными латинскими, цифрами и дефисом, 1–32 знака`)
  } else {
    // ── 3. id-unique. Порча: продублировать блок.
    if (ids.has(s.id)) fail('id-unique', `${where}: id «${s.id}» уже занят в services[${ids.get(s.id)}]`)
    else ids.set(s.id, i)
  }

  // ── 4. repo-https. Порча: заменить адрес на ssh или на путь на диске.
  if (typeof s.repo !== 'string' || !/^https:\/\/.+\.git$/.test(s.repo)) {
    fail('repo-https', `${where}: repo обязан быть https-адресом, оканчивающимся на .git — получено «${s.repo}»`)
  }

  // ── 5. version-pinned. Порча: поставить "main". ЭТО ГЛАВНОЕ ПРАВИЛО ФАЙЛА.
  if (typeof s.version !== 'string' || !/^v\d+\.\d+\.\d+([-+].+)?$/.test(s.version)) {
    fail('version-pinned',
      `${where}: version обязана быть ТЕГОМ вида v1.2.3 — получено «${s.version}». ` +
      'Ветка здесь запрещена: следуя за ней, два гостя с одной командой получают разные узлы.')
  }

  // ── 6. port-block. Порча: поставить 3001 или 50505.
  if (s.port !== null && s.port !== undefined) {
    if (!Number.isInteger(s.port) || s.port < PORT_MIN || s.port > PORT_MAX) {
      fail('port-block',
        `${where}: порт ${s.port} вне блока ${PORT_MIN}–${PORT_MAX}. ` +
        'Ниже блока мы отбираем порты у собственных проектов человека, выше 49152 их раздаёт ОС исходящим соединениям.')
    } else {
      // ── 7. port-unique. Порча: дать двум блокам один номер.
      if (ports.has(s.port)) fail('port-unique', `${where}: порт ${s.port} уже занят блоком «${ports.get(s.port)}»`)
      else ports.set(s.port, s.id)
    }
  }

  // ── 8. provides-nonempty. Порча: оставить пустой массив.
  if (!Array.isArray(s.provides) || s.provides.length === 0) {
    fail('provides-nonempty',
      `${where}: provides пуст. Блок, не назвавший, что он даёт, нечем заменить: ` +
      'покупатель не узнает, чью способность он берёт.')
  }

  // ── 9. no-secrets. Порча: дописать в блок "token": "abc…".
  for (const [k, v] of Object.entries(s)) {
    if (SECRET_NAMES.test(k)) {
      fail('no-secrets', `${where}: поле «${k}» похоже на секрет. Реестр лежит в git и уезжает каждому гостю.`)
    }
    if (typeof v === 'string' && /^[A-Za-z0-9+/_-]{24,}={0,2}$/.test(v) && !/^v\d/.test(v)) {
      fail('no-secrets', `${where}: значение поля «${k}» выглядит ключом (${v.length} знаков без пробелов).`)
    }
  }
}

console.log(`  блоков в составе: ${reg.services.length}`)
console.log(`  с назначенным портом: ${ports.size}` + (ports.size < reg.services.length
  ? ` (остальные ещё не установлены — это законное состояние)` : ''))
for (const s of reg.services) {
  console.log(`    ${s.id} — ${s.version} — порт ${s.port ?? 'не назначен'} — даёт: ${(s.provides || []).join(', ')}`)
}

if (errors > 0) {
  console.log(out.join('\n'))
  console.log(`===MICROSERVICES_FAILED=== нарушений: ${errors}`)
  process.exit(1)
}

console.log('===MICROSERVICES_OK===')
