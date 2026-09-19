// СТОРОЖ СЛОЯ АРХИТЕКТОРА: МЕНЮ И СТРАНИЦЫ НЕ РАСХОДЯТСЯ (236-5).
//
// 🔒 ЗАЧЕМ ОН НУЖЕН. Разделов десять, и у каждого две половины: пункт в
// единственном источнике меню и файл страницы на диске. Половины живут в разных
// местах и расходятся МОЛЧА — пункт без страницы даёт мёртвую ссылку (человек
// нажимает и получает 404), страница без пункта даёт сироту (адрес работает, но
// попасть в него можно только по памяти). Ни типы, ни сборка этого не видят:
// оба состояния для них законны.
//
// 🛑 ПРИБОР ПРОВЕРЕН НА ЗАВЕДОМО НЕВЕРНОМ ВАРИАНТЕ, А НЕ ТОЛЬКО НА ВЕРНОМ —
// иначе его зелёный цвет ничего не доказывает. Порядок проверки записан в итоге
// подшага: убрать пункт из меню → сторож обязан назвать осиротевшую страницу;
// вернуть → снова зелёный.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const LAYER = join(ROOT, 'app', '[lang]', '(architectLayer)')
const MENU_FILE = join(LAYER, '_lib', 'architect-menu.ts')

const out = []
let errors = 0

function fail(message) {
  errors += 1
  out.push(`  ОШИБКА: ${message}`)
}

if (!existsSync(MENU_FILE)) {
  console.log(`  ОШИБКА: нет источника меню — ${MENU_FILE}`)
  console.log('===ARCHITECT_ROUTES_FAILED===')
  process.exit(1)
}

// Адреса читаются из ТЕКСТА источника, а не импортом: сторож запускается до
// сборки, а источник — TypeScript с путями через `@/`, который node не исполнит.
// Разбор нарочно грубый и заметный: перестанет совпадать — упадёт, а не
// промолчит.
const source = readFileSync(MENU_FILE, 'utf8')
const paths = [...source.matchAll(/'(\/architect\/[a-z0-9/-]+)'/g)].map((m) => m[1])
const unique = [...new Set(paths)]

if (unique.length === 0) {
  fail('в источнике меню не найдено ни одного адреса — разбор сломался, а не меню опустело')
}

// Половина первая: у каждого пункта меню есть файл страницы.
for (const path of unique) {
  const file = join(LAYER, path.replace(/^\/architect/, 'architect'), 'page.tsx')
  if (!existsSync(file)) fail(`пункт меню «${path}» ведёт в никуда: нет файла ${file.replace(ROOT, '.')}`)
}

// Половина вторая: у каждой страницы есть пункт меню.
// Список страниц собирается обходом диска — именно он знает правду о том, что
// существует.
function pages(dir, prefix = '') {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      found.push(...pages(full, `${prefix}/${entry}`))
    } else if (entry === 'page.tsx') {
      found.push(prefix)
    }
  }
  return found
}

const onDisk = pages(join(LAYER, 'architect')).map((p) => `/architect${p}`)

for (const path of onDisk) {
  if (!unique.includes(path)) {
    fail(`страница «${path}» существует, но в меню её нет — попасть в неё можно только по памяти`)
  }
}

console.log(`  проверено: пунктов меню ${unique.length}, страниц на диске ${onDisk.length}`)
for (const line of out) console.log(line)

if (errors > 0) {
  console.log(`\n===ARCHITECT_ROUTES_FAILED=== ошибок: ${errors}`)
  process.exit(1)
}
console.log('\n===ARCHITECT_ROUTES_OK=== меню и страницы совпадают')
