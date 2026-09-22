// ВСТРОИТЬ КОМПЛЕКТ АГЕНТА В СЛУЖБУ ОДНОЙ КОМАНДОЙ (269).
//
//   npm run agent-kit:add -- <служба>          три страницы в architect/<служба>/
//   npm run agent-kit:add -- <служба> --force  перезаписать уже существующие
//
// 🔒 КОПИЯ ОБРАЗЦА, А НЕ НОВЫЙ ТЕКСТ (закон владельца: «сделай в точности как X» = скопировать целиком и
// адаптировать). Образец — страницы службы входа `architect/auth/{claude-code,terminal,telegram}`: файлы
// копируются как есть, меняются только адрес раздела и имя службы. Работающий код в страницы не копируется —
// он живёт один раз в `lib/agent-kit/content.ts` и получает имя службы параметром.
//
// 🛑 СЛУЖБА ОБЯЗАНА СУЩЕСТВОВАТЬ: в `MICROSERVICES.json` и папкой `microservices/<id>` — туда агент и
// запустится. И у неё должна быть своя группа страниц `architect/<id>/`: комплект кладёт страницы В неё, а
// не придумывает группу молча.

import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ARCHITECT = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect')
const SOURCE = 'auth'
const PAGES = ['claude-code', 'terminal', 'telegram']

const [service, flag] = process.argv.slice(2)
const force = flag === '--force'

function fail(why) {
  console.error(`agent-kit: ${why}`)
  process.exit(1)
}

if (!service) fail('назовите службу: npm run agent-kit:add -- <служба>')
if (!/^[a-z][a-z0-9-]{0,39}$/.test(service)) fail(`«${service}» — не имя службы (латиница, цифры, дефис)`)
if (service === SOURCE && !force) fail(`«${SOURCE}» — образец комплекта, его страницы уже на месте`)
const reg = JSON.parse(readFileSync(join(ROOT, 'MICROSERVICES.json'), 'utf8'))
if (!reg.services?.some((s) => s?.id === service)) fail(`службы «${service}» нет в MICROSERVICES.json`)
if (!existsSync(join(ROOT, 'microservices', service))) fail(`нет папки microservices/${service} — агенту негде жить`)
const group = join(ARCHITECT, service)
if (!existsSync(join(group, '_data', 'index.ts'))) fail(`нет группы страниц architect/${service}/ — сначала заведите её`)

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]))
}

for (const page of PAGES) {
  const from = join(ARCHITECT, SOURCE, page)
  const to = join(group, page)
  if (existsSync(to)) {
    if (!force) fail(`architect/${service}/${page} уже есть — добавьте --force, чтобы перезаписать`)
    rmSync(to, { recursive: true, force: true })
  }
  cpSync(from, to, { recursive: true })
  for (const file of walk(to)) {
    const text = readFileSync(file, 'utf8')
    const adapted = text
      .split(`/architect/${SOURCE}`).join(`/architect/${service}`)
      .split(`agentKitContent('${page}', '${SOURCE}', lang)`).join(`agentKitContent('${page}', '${service}', lang)`)
    if (adapted !== text) writeFileSync(file, adapted)
  }
  console.log(`agent-kit: architect/${service}/${page} ✓`)
}
console.log(`===AGENT_KIT_OK=== служба «${service}»: подписка, терминал, Telegram. Пересоберите узел: npm run serve:rebuild`)
