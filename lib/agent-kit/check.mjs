// СТОРОЖ КОПИЙ КОМПЛЕКТА АГЕНТА (271; манифест установки — 275): `npm run check:agent-kits`, стоит в `prebuild`.
//
// 🔒 ТРИ ВЕРДИКТА, А НЕ ДВА (закон проекта о стороже в живом доме):
//   законно  — копия совпадает с мастером;
//   долг     — копия отстаёт от мастера: печатается при каждом прогоне, сборку НЕ роняет — обновить или нет,
//              решает владелец (`npm run agent-kit:update -- <группа>`);
//   ошибка   — копия разорвана: есть `_agent-kit/` без дверей или страниц, есть двери без `_agent-kit/`, нет
//              манифеста. Такая группа не работает, и сборка падает, называя, что сделать.
// 🔒 МАСТЕРА МОЖЕТ НЕ БЫТЬ — это законно: копии самостоятельны. Тогда сравнивать не с чем, и сторож проверяет
// только целостность копий.
// 🔒 СПИСОК ГРУПП — ОБХОД ПАПОК, а не рукописный перечень.
// 🔒 ИМЕНА СТРАНИЦ КОПИИ — ИЗ ЕЁ МАНИФЕСТА `architect/<группа>/agent-kit.json`, а не из перечня здесь (275):
// у узла те же три страницы называются иначе (`subscription` вместо `claude-code`), и второй список
// разошёлся бы молча — ровно тот класс отказов, ради которого сторож и заводился.

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ARCHITECT = join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect')
const MASTER_CORE = join(ARCHITECT, 'kits', '_agent-kit', 'core')
const DOORS = ['session', 'ticket', 'claude-auth', 'channel']

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))
}

// 🛑 ТОТ ЖЕ ОТПЕЧАТОК, ЧТО У УСТАНОВЩИКА (`kits/_agent-kit/install.mjs`). Импортировать его отсюда нельзя:
// удалённый мастер уронил бы сторож, а копиям мастер не нужен. Две копии функции сверяет сам сторож — копия,
// установленная только что, обязана дать «законно».
function fingerprint(dir) {
  const h = createHash('sha256')
  for (const file of walk(dir).sort()) {
    h.update(relative(dir, file).split(sep).join('/'))
    h.update('\0')
    h.update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n'))
    h.update('\0')
  }
  return h.digest('hex').slice(0, 16)
}

const master = existsSync(MASTER_CORE) ? fingerprint(MASTER_CORE) : null
const errors = []
const debts = []
let ok = 0

for (const name of readdirSync(ARCHITECT)) {
  const group = join(ARCHITECT, name)
  if (name === 'kits' || !statSync(group).isDirectory()) continue
  const hasKit = existsSync(join(group, '_agent-kit'))
  const hasDoors = existsSync(join(group, 'agent-api'))
  const manifestPath = join(group, 'agent-kit.json')
  const hasManifest = existsSync(manifestPath)
  if (!hasKit && !hasDoors && !hasManifest) continue
  if (!hasKit) { errors.push(`${name}: двери или манифест есть, а _agent-kit/ нет — удалите их или переустановите`); continue }
  if (!hasManifest) { errors.push(`${name}: нет agent-kit.json — npm run agent-kit:update -- ${name}`); continue }

  let manifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    errors.push(`${name}: agent-kit.json не читается (${err instanceof Error ? err.message : err}) — npm run agent-kit:update -- ${name}`)
    continue
  }
  const pages = Array.isArray(manifest.pages) ? manifest.pages.map((p) => p?.slug).filter((s) => typeof s === 'string') : []
  if (!pages.length) { errors.push(`${name}: в agent-kit.json нет ни одной страницы — npm run agent-kit:update -- ${name}`); continue }

  const missing = [
    ...pages.filter((p) => !existsSync(join(group, p, 'page.tsx'))).map((p) => `${p}/page.tsx`),
    ...DOORS.filter((d) => !existsSync(join(group, 'agent-api', d, 'route.ts'))).map((d) => `agent-api/${d}/route.ts`),
    ...(existsSync(join(group, '_agent-kit', 'server', 'entry.cjs')) ? [] : ['_agent-kit/server/entry.cjs']),
  ]
  if (missing.length) { errors.push(`${name}: копия разорвана, нет ${missing.join(', ')} — npm run agent-kit:update -- ${name}`); continue }

  const version = typeof manifest.version === 'string' ? manifest.version.trim() : ''
  const actual = fingerprint(join(group, '_agent-kit'))
  if (version !== actual) { errors.push(`${name}: копию правили руками (в манифесте ${version || '—'}, содержимое ${actual}) — правьте мастер и обновите`); continue }
  if (master && version !== master) debts.push(`${name}: отстаёт от мастера (${version} ≠ ${master}) — npm run agent-kit:update -- ${name}`)
  else ok++
}

for (const d of debts) console.log(`  долг    ${d}`)
for (const e of errors) console.log(`  ОШИБКА  ${e}`)
if (errors.length) {
  console.log(`===AGENT_KITS_FAILED=== ошибок: ${errors.length}`)
  process.exit(1)
}
console.log(`===AGENT_KITS_OK=== копий в порядке: ${ok}, долгов: ${debts.length}${master ? '' : ' (мастера нет — сравнивать не с чем)'}`)
