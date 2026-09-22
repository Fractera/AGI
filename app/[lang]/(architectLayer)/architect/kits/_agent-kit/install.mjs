// УСТАНОВИТЬ КОМПЛЕКТ АГЕНТА В СЛУЖБУ (269; в маршрут службы — 271).
//
//   npm run agent-kit:add -- <служба>             установить
//   npm run agent-kit:add -- <служба> --force     переустановить поверх
//   npm run agent-kit:update -- <служба>          заново скопировать мастер в уже установленную службу
//
// 🔒 КОПИЯ МАСТЕРА ЦЕЛИКОМ, А НЕ ССЫЛКА НА НЕГО (решение владельца 2026-09-22, вариант А): служба получает
// собственную копию всего кода и владеет ею. Удалили папку службы — ушло всё; удалили мастер — установленные
// службы продолжают работать. Цена — N копий: исправление в мастере доезжает командой `agent-kit:update`, а
// `npm run check:agent-kits` печатает отставших.
//
// ЧТО КЛАДЁТСЯ В `architect/<служба>/`:
//   _agent-kit/                 ← копия `core/` + VERSION (отпечаток мастера)
//   claude-code/ terminal/ telegram/   ← из `pages/`, `.tpl` → без расширения, `__SERVICE__` → имя службы
//   agent-api/<дверь>/route.ts  ← из `api/<дверь>/route.ts.tpl`
//
// 🛑 СЛУЖБА ОБЯЗАНА СУЩЕСТВОВАТЬ: в `MICROSERVICES.json` и папкой `microservices/<id>` — туда агент и
// запустится. И у неё должна быть своя группа страниц `architect/<id>/`: комплект кладёт себя В неё, а не
// придумывает группу молча.

import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const MASTER = dirname(fileURLToPath(import.meta.url))
const ARCHITECT = dirname(dirname(MASTER))
const ROOT = process.cwd()
const PAGES = ['claude-code', 'terminal', 'telegram']
const DOORS = ['session', 'ticket', 'claude-auth', 'channel']

const args = process.argv.slice(2)
const service = args.find((a) => !a.startsWith('--'))
const update = args.includes('--update')
const force = args.includes('--force') || update

function fail(why) {
  console.error(`agent-kit: ${why}`)
  process.exit(1)
}

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))
}

// 🛑 ТОТ ЖЕ ОТПЕЧАТОК, ЧТО У СТОРОЖА `lib/agent-kit/check.mjs`: пути и содержимое, концы строк приведены —
// Windows и Linux дают один и тот же. Правите здесь — правьте там; сторож сверит свежую установку сам.
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

function stamp(text) {
  return text.split('__SERVICE__').join(service)
}

/** Скопировать шаблонную папку: `.tpl` теряет расширение, во всех текстах `__SERVICE__` → имя службы. */
function copyTemplate(from, to) {
  for (const file of walk(from)) {
    const rel = relative(from, file)
    const target = join(to, rel.endsWith('.tpl') ? rel.slice(0, -4) : rel)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, stamp(readFileSync(file, 'utf8')))
  }
}

if (!service) fail('назовите службу: npm run agent-kit:add -- <служба>')
if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) fail(`«${service}» — не имя службы (латиница, цифры, дефис)`)
if (service === 'kits') fail('«kits» — витрина готовых решений, а не служба')
const reg = JSON.parse(readFileSync(join(ROOT, 'MICROSERVICES.json'), 'utf8'))
if (!reg.services?.some((s) => s?.id === service)) fail(`службы «${service}» нет в MICROSERVICES.json`)
if (!existsSync(join(ROOT, 'microservices', service))) fail(`нет папки microservices/${service} — агенту негде жить`)
const group = join(ARCHITECT, service)
if (!existsSync(join(group, '_data', 'index.ts'))) fail(`нет группы страниц architect/${service}/ — сначала заведите её`)

const installed = existsSync(join(group, '_agent-kit'))
if (update && !installed) fail(`в службе «${service}» комплекта нет — установите: npm run agent-kit:add -- ${service}`)
if (installed && !force) fail(`в службе «${service}» комплект уже есть — --force переустановит, agent-kit:update обновит`)
if (!installed && !force) {
  for (const p of [...PAGES, 'agent-api']) {
    if (existsSync(join(group, p))) fail(`architect/${service}/${p} уже занята — --force заменит`)
  }
}

// Поверх — значит сначала убрать прежнее целиком: файл, удалённый из мастера, не должен пережить обновление.
for (const p of ['_agent-kit', 'agent-api', ...PAGES]) rmSync(join(group, p), { recursive: true, force: true })

cpSync(join(MASTER, 'core'), join(group, '_agent-kit'), { recursive: true })
const version = fingerprint(join(MASTER, 'core'))
writeFileSync(join(group, '_agent-kit', 'VERSION'), `${version}\n`)
for (const p of PAGES) copyTemplate(join(MASTER, 'pages', p), join(group, p))
for (const d of DOORS) copyTemplate(join(MASTER, 'api', d), join(group, 'agent-api', d))

console.log(`agent-kit: architect/${service}/ — _agent-kit (версия ${version}), ${PAGES.join(', ')}, agent-api/{${DOORS.join(',')}}`)
console.log(`===AGENT_KIT_OK=== служба «${service}» ${update ? 'обновлена' : 'получила комплект'}. Пересоберите узел: npm run serve:rebuild`)
