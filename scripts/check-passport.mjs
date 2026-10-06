// СТОРОЖ ПАСПОРТА A2A (шаг 406-3): визитка A2A Google v1.0 (`a2a.card`) + расширение Fractera. Стандарт — `lib/a2a/STANDARD.md`.
//
//   node scripts/check-passport.mjs <папка элемента>   один элемент (так его зовёт и шаблон элемента)
//   node scripts/check-passport.mjs --all              все элементы узла по реестру
//
// Проверяет: форму раздела `a2a`; каждая дверь паспорта встречается в коде элемента; каждая дверь `app/api/**/route.ts`
// Next-элемента объявлена или названа в `private`; карточка не больше предела. Только чтение. Код выхода 1 — нарушения.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { passportProblems, registryEntryOf, extensionOf, CARD_LIMIT } from '../lib/a2a/passport.mjs'
import elementProps from '../lib/agi-items/element-props.cjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SKIP = new Set(['node_modules', '.git', 'public', 'AGI-ITEMS', 'data', 'logs', 'storage'])
const SRC = /\.(m?js|cjs|tsx?)$/

function walk(dir, out = []) {
  let list = []
  try { list = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of list) {
    if (e.name.startsWith('.next') || SKIP.has(e.name)) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (SRC.test(e.name)) out.push(p)
  }
  return out
}

const norm = (p) => p.replace(/\/+$/, '').replace(/\[\.{3}[^\]]+\]|\[[^\]]+\]|:[A-Za-z_]+/g, ':p')

function checkElement(dir) {
  const problems = []
  const warnings = []
  // 417: старый корневой файл или новая раскладка — одним модулем.
  if (!elementProps.hasElementProps(dir)) return { problems: ['нет паспорта (OWN-SERVICE-PROPS.json или OWN-SERVICE-PROPS/)'], warnings }
  const props = elementProps.readElementProps(dir)
  if (!props) return { problems: ['паспорт не читается'], warnings }
  const form = passportProblems(props)
  problems.push(...form.problems)
  warnings.push(...form.warnings)
  const ext = extensionOf(props.a2a?.card)
  if (!ext) return { problems, warnings }

  const files = walk(dir)
  const code = files.map((f) => readFileSync(f, 'utf8')).join('\n')
  // Next: app/api/**/route.ts → адрес двери
  const routes = files
    .map((f) => relative(dir, f).split(sep).join('/'))
    .filter((f) => /^app\/api\/.+\/route\.(t|j)sx?$/.test(f))
    .map((f) => '/' + f.replace(/^app\//, '').replace(/\/route\.(t|j)sx?$/, ''))

  const doors = ext.doors ?? []
  for (const d of doors) {
    if (d.protocol === 'mcp') {
      if (!code.includes(d.path)) problems.push(`дверь MCP «${d.path}» не найдена в коде`)
      continue
    }
    const base = String(d.path).split('/:')[0].split('/[')[0]
    const inRoutes = routes.some((r) => norm(r) === norm(d.path) || r.startsWith(base))
    if (!inRoutes && !code.includes(base)) problems.push(`дверь ${d.method} ${d.path} не найдена в коде`)
  }
  const declared = doors.filter((d) => d.protocol === 'http').map((d) => norm(d.path))
  if (ext.a2aEndpoint) {
    declared.push(norm(ext.a2aEndpoint))
    if (!routes.some((r) => norm(r) === norm(ext.a2aEndpoint)) && !code.includes(ext.a2aEndpoint)) problems.push(`конечная точка A2A ${ext.a2aEndpoint} не найдена в коде`)
  }
  const priv = (ext.private ?? []).map(norm)
  for (const r of routes) {
    const n = norm(r)
    if (declared.includes(n) || priv.some((p) => n === p || n.startsWith(p + '/'))) continue
    problems.push(`дверь ${r} есть в коде, но не объявлена и не названа в private`)
  }
  if (problems.length === 0) {
    const size = JSON.stringify(registryEntryOf(props)).length
    if (size > CARD_LIMIT) problems.push(`запись реестра ${size} знаков — больше предела ${CARD_LIMIT}`)
  }
  return { problems, warnings }
}

const arg = process.argv[2]
let dirs = []
if (arg === '--all') {
  const reg = JSON.parse(readFileSync(join(ROOT, 'AGI-ITEMS-REGISTRY', 'agi-items.json'), 'utf8')).services ?? []
  const addr = (id) => { try { return JSON.parse(readFileSync(join(ROOT, 'data', 'services', id, 'address.json'), 'utf8')).address } catch { return id } }
  dirs = reg.map((s) => join(ROOT, 'AGI-ITEMS', s.kind === 'user' ? 'user' : 'core', s.kind === 'user' ? addr(s.id) : s.id)).filter((d) => existsSync(d))
} else if (arg) {
  dirs = [resolve(arg)]
} else {
  console.log('Укажите папку элемента или --all.')
  process.exit(2)
}

let bad = 0
for (const d of dirs) {
  const { problems: p, warnings: w } = checkElement(d)
  bad += p.length
  console.log(`${p.length ? '✗' : '✓'} ${relative(ROOT, d) || d}`)
  for (const x of p) console.log(`   ${x}`)
  for (const x of w) console.log(`   ⚠ ${x}`)
}
console.log(bad ? `\n===PASSPORT_FAILED=== нарушений: ${bad}` : `\n===PASSPORT_OK=== элементов: ${dirs.length}`)
process.exit(bad ? 1 : 0)
