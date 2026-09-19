// СТОРОЖ СЛОЯ АРХИТЕКТОРА: ПАПКА, СТРАНИЦА И СПИСОК НЕ РАСХОДЯТСЯ (236-5, переписан 254).
//
// 🔒 ПОЧЕМУ ЕГО ПРИШЛОСЬ ПЕРЕПИСАТЬ. Прежде разделы перечислялись руками в
// `_lib/architect-menu.ts`, и сторож читал ТЕКСТ того файла, сверяя список с
// диском. С шага 254 списка там нет вовсе: меню собирается из
// `_list.generated.ts`, который сборка складывает из самих папок. Оставь сторож
// как был — он не нашёл бы ни одного адреса и остался бы ЗЕЛЁНЫМ, ничего не
// проверив. Это ровно тот класс, которым проект уже платил: прибор со списком
// молчит о том, чего в списке нет.
//
// 🔒 ЧТО ОН ПРОВЕРЯЕТ ТЕПЕРЬ. У страницы-папки три половины, лежащие врозь:
//   1. `page.tsx`       — адрес существует;
//   2. `_data/index.ts` — папка попадает в список; без него страница СИРОТА:
//                         открыть можно, а в меню её нет;
//   3. `meta.slug`      — совпадает с именем папки, иначе ссылка ведёт мимо.
// Ни типы, ни сборка ни одного расхождения не видят: все они для них законны.
//
// 🛑 ПРИБОР ПРОВЕРЯЕТСЯ ПОРЧЕЙ, А НЕ ЗЕЛЁНЫМ ЦВЕТОМ: убрать `_data/index.ts` у
// раздела → сторож обязан назвать сироту; вернуть → снова зелёный.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const LAYER = join(ROOT, 'app', '[lang]', '(architectLayer)')
const ARCHITECT = join(LAYER, 'architect')

const out = []
let errors = 0
const fail = (m) => { errors += 1; out.push(`  ОШИБКА: ${m}`) }

if (!existsSync(ARCHITECT)) {
  console.log(`  ОШИБКА: нет слоя — ${ARCHITECT}`)
  console.log('===ARCHITECT_ROUTES_FAILED===')
  process.exit(1)
}

/** Папки, которые Next считает служебными, и скрытые. */
const isPageFolder = (parent, name) =>
  !name.startsWith('_') && !name.startsWith('[') && !name.startsWith('(') && !name.startsWith('.') &&
  statSync(join(parent, name)).isDirectory()

/** Обход дерева: каждая папка с `page.tsx` — страница слоя. */
function pages(dir, prefix = '/architect') {
  const found = []
  if (existsSync(join(dir, 'page.tsx'))) found.push(prefix)
  for (const name of readdirSync(dir)) {
    if (!isPageFolder(dir, name)) continue
    found.push(...pages(join(dir, name), `${prefix}/${name}`))
  }
  return found
}

const onDisk = pages(ARCHITECT)

// 🔒 ИСКЛЮЧЕНИЕ РОВНО ОДНО, И ЭТО ВХОД В СЛОЙ. `/architect` — не страница
// коллекции: сюда попадают, набрав адрес рукой, и родителя, который бы его
// перечислял, у него нет. Всё остальное — и группы, и разделы — устроено
// одинаково и проверяется одинаково.
//
// 🪦 ЗДЕСЬ СТОЯЛ СПИСОК ИЗ ЧЕТЫРЁХ ИСКЛЮЧЁННЫХ АДРЕСОВ И СПИСОК ГРУПП ИЗ ДВУХ
// ИМЁН. Оба устарели в тот же день, когда владелец прислал новую структуру:
// групп стало четыре, и две из них сторож не проверял бы вовсе, оставаясь
// зелёным. Прибор со списком молчит о том, чего в списке нет, — поэтому здесь
// не осталось ни одного перечня: группы берутся обходом диска.
//
// ✗ Отсутствие входа само является отказом: владелец однажды открыл
// `/ru/architect` и получил 404 при девяти работающих разделах, — поэтому вход
// не прощается, а ПРОВЕРЯЕТСЯ на существование.
const ENTRANCE = '/architect'

/** Папки первого уровня — группы. Их состав знает диск, а не этот файл. */
const groupDirs = () =>
  readdirSync(ARCHITECT).filter((n) => isPageFolder(ARCHITECT, n))

if (!existsSync(join(ARCHITECT, 'page.tsx'))) {
  fail('нет входа в слой: ожидается architect/page.tsx — без него /{lang}/architect отвечает 404')
}

let sections = 0
for (const path of onDisk) {
  if (path === ENTRANCE) continue
  sections += 1

  const dir = join(LAYER, path.replace(/^\//, ''))
  const dataIndex = join(dir, '_data', 'index.ts')
  const metaFile = join(dir, '_data', 'meta.ts')

  if (!existsSync(dataIndex)) {
    fail(`страница «${path}» существует, но у неё нет _data/index.ts — в список своей группы она не попадёт, и открыть её можно будет только по памяти`)
    continue
  }
  if (!existsSync(metaFile)) {
    fail(`«${path}»: нет _data/meta.ts — без него у страницы нет ни slug, ни порядка в меню`)
    continue
  }

  // Имя папки и `slug` внутри — две половины одного знания. Генератор `slug` не
  // переписывает намеренно: молчаливая починка спрятала бы опечатку копипасты,
  // которая всплыла бы мёртвой ссылкой.
  const folder = path.split('/').pop()
  const slug = readFileSync(metaFile, 'utf8').match(/slug:\s*'([^']*)'/)?.[1]
  if (!slug) fail(`«${path}»: в _data/meta.ts не найден slug — поле забыто либо разбор сломался`)
  else if (slug !== folder) fail(`«${path}»: slug «${slug}» не совпадает с именем папки «${folder}» — ссылка из меню поведёт мимо страницы`)
}

// Половина вторая: КОРНЕВОЙ список называет каждую группу, лежащую на диске.
//
// ✗ ЭТА ПРОВЕРКА НАЙДЕНА ПОРЧЕЙ, А НЕ ПРИДУМАНА (254): я убрал из корневого
// списка целую группу — двадцать три страницы остались на месте, меню потеряло
// её целиком, а сторож доложил «совпадают». Он смотрел на списки ГРУПП и ни разу
// на список самих групп. Ровно тот случай, ради которого прибор ломают, прежде
// чем ему верить.
const rootList = join(ARCHITECT, '_list.generated.ts')
if (!existsSync(rootList)) {
  fail('нет architect/_list.generated.ts — меню слоя пусто; запустите node lib/parser-fs.mjs')
} else {
  const namedGroups = [...readFileSync(rootList, 'utf8').matchAll(/from '\.\/([^/]+)\/_data'/g)].map((m) => m[1])
  for (const g of groupDirs()) {
    if (!existsSync(join(ARCHITECT, g, '_data', 'index.ts'))) continue
    if (!namedGroups.includes(g)) fail(`группа «${g}» лежит на диске, но корневой _list.generated.ts её не называет — в меню её не будет вовсе`)
  }
  for (const g of namedGroups) {
    if (!existsSync(join(ARCHITECT, g))) fail(`корневой _list.generated.ts называет группу «${g}», которой на диске нет — сборка упадёт на импорте`)
  }
}

// Половина третья: список каждой группы называет ровно тех, кто лежит в ней.
for (const group of groupDirs()) {
  const groupDir = join(ARCHITECT, group)
  const listFile = join(groupDir, '_list.generated.ts')
  const here = readdirSync(groupDir)
    .filter((n) => isPageFolder(groupDir, n))
    .filter((n) => existsSync(join(groupDir, n, '_data', 'index.ts')))

  // Группа без детей списка не имеет, и это законно: группе из одной страницы
  // нечего разворачивать.
  if (here.length === 0 && !existsSync(listFile)) continue

  if (!existsSync(listFile)) {
    fail(`нет ${group}/_list.generated.ts при ${here.length} разделах на диске — запустите node lib/parser-fs.mjs (его зовёт prebuild и predev)`)
    continue
  }
  const named = [...readFileSync(listFile, 'utf8').matchAll(/from '\.\/([^/]+)\/_data'/g)].map((m) => m[1])

  for (const n of here) {
    if (!named.includes(n)) fail(`«${group}/${n}» лежит на диске, но в _list.generated.ts его нет — список устарел, перезапустите генератор`)
  }
  for (const n of named) {
    if (!here.includes(n)) fail(`_list.generated.ts группы «${group}» называет «${n}», которого на диске нет — сборка упадёт на импорте`)
  }
}

console.log(`  проверено: страниц ${onDisk.length}, из них разделов коллекции ${sections}`)
for (const line of out) console.log(line)

if (errors > 0) {
  console.log(`\n===ARCHITECT_ROUTES_FAILED=== ошибок: ${errors}`)
  process.exit(1)
}
console.log('\n===ARCHITECT_ROUTES_OK=== папки, страницы и списки совпадают')
