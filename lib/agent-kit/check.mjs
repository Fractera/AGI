// СТОРОЖ КОПИЙ КОМПЛЕКТА АГЕНТА (271): `npm run check:agent-kits`, стоит в `prebuild`.
//
// 🔒 ТРИ ВЕРДИКТА, А НЕ ДВА (закон проекта о стороже в живом доме):
//   законно  — копия совпадает с мастером;
//   долг     — копия отстаёт от мастера: печатается при каждом прогоне, сборку НЕ роняет — обновить или нет,
//              решает владелец (`npm run agent-kit:update -- <служба>`);
//   ошибка   — копия разорвана: есть `_agent-kit/` без дверей или страниц, есть двери без `_agent-kit/`, нет
//              `VERSION`. Такая служба не работает, и сборка падает, называя, что сделать.
// 🔒 МАСТЕРА МОЖЕТ НЕ БЫТЬ — это законно: копии самостоятельны. Тогда сравнивать не с чем, и сторож проверяет
// только целостность копий.
// 🔒 СПИСОК СЛУЖБ — ОБХОД ПАПОК, а не рукописный перечень.

import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ARCHITECT = join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect')
const MASTER_CORE = join(ARCHITECT, 'kits', '_agent-kit', 'core')
const PAGES = ['claude-code', 'terminal', 'telegram']
const DOORS = ['session', 'ticket', 'claude-auth', 'channel']

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))
}

// 🛑 ТОТ ЖЕ ОТПЕЧАТОК, ЧТО У УСТАНОВЩИКА (`kits/_agent-kit/install.mjs`). Импортировать его отсюда нельзя:
// удалённый мастер уронил бы сторож, а копиям мастер не нужен. Две копии функции сверяет сам сторож — копия,
// установленная только что, обязана дать «законно».
function fingerprint(dir) {
  const h = createHash('sha256')
  for (const file of walk(dir).filter((f) => !f.endsWith(`${sep}VERSION`)).sort()) {
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
  if (!hasKit && !hasDoors) continue
  if (!hasKit) { errors.push(`${name}: двери agent-api/ есть, а _agent-kit/ нет — удалите agent-api/ или переустановите`); continue }
  const missing = [
    ...PAGES.filter((p) => !existsSync(join(group, p, 'page.tsx'))).map((p) => `${p}/page.tsx`),
    ...DOORS.filter((d) => !existsSync(join(group, 'agent-api', d, 'route.ts'))).map((d) => `agent-api/${d}/route.ts`),
    ...(existsSync(join(group, '_agent-kit', 'server', 'entry.cjs')) ? [] : ['_agent-kit/server/entry.cjs']),
  ]
  if (missing.length) { errors.push(`${name}: копия разорвана, нет ${missing.join(', ')} — npm run agent-kit:update -- ${name}`); continue }
  const versionFile = join(group, '_agent-kit', 'VERSION')
  if (!existsSync(versionFile)) { errors.push(`${name}: нет _agent-kit/VERSION — npm run agent-kit:update -- ${name}`); continue }
  const version = readFileSync(versionFile, 'utf8').trim()
  const actual = fingerprint(join(group, '_agent-kit'))
  if (version !== actual) { errors.push(`${name}: копию правили руками (VERSION ${version}, содержимое ${actual}) — правьте мастер и обновите`); continue }
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
