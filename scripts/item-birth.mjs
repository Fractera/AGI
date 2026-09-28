// РОЖДЕНИЕ ЭЛЕМЕНТА ИЗ ШАБЛОНА (узел, шаг 319-1). Запуск из корня узла: `npm run items:birth -- <id>`.
//
// 🎯 Слово владельца 2026-09-27: «стартер Fractera item starter скачивался [из] репозитория Fractera, но при этом чтобы была
// возможность пользователя … сохранить его обновлённую версию на своем гит хаб». Отсюда устройство:
//   1. черновик `<id>` (кнопка «Создать микросервис», 314-1) — единственный вход: рождается только то, что человек завёл;
//   2. шаблон берётся по ЗАКРЕПЛЁННОМУ тегу из `AGI-ITEMS-CONFIG/item-template.json` в `AGI-ITEMS/user/<id>`;
//   3. история шаблона отрезается: у элемента своя история с первым коммитом «born from …» и НЕТ `origin` шаблона —
//      это самостоятельный проект; в GitHub человека он уходит позже кнопкой (319-5);
//   4. паспорт `OWN-SERVICE-PROPS.json` получает `id` элемента — все имена элемент читает оттуда;
//   5. запись реестра с полем `born`: установщик и `serve.mjs` такую папку не клонируют и не переводят на тег (иначе
//      следующая установка стёрла бы работу агента); `repo`/`version` — правда о происхождении (их требует сторож реестра);
//   6. дальше — ТОТ ЖЕ путь, что установка службы: `services-install.mjs --only <id>` (порт, `.env`, сборка);
//   7. запуск службы и сторожа в pm2 + `pm2 save` (установщик новые службы не поднимает) и ожидание `/api/health` по факту.
//
// 🔒 Процессы — `windowsHide: true` (закон 2026-09-18). Ничего не делается само: прибор запускает человек (или кнопка 319-3).
// 🔒 Отказ до записи реестра не оставляет следов; отказ сборки оставляет папку и запись — повтор одной командой (печатается).

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { REGISTRY_FILE, itemDir } = require('../lib/agi-items/paths.cjs')

const ROOT = process.cwd()
const DRAFTS_FILE = join(ROOT, 'data', 'agi-drafts.json')
const TEMPLATE_FILE = join(ROOT, 'AGI-ITEMS-CONFIG', 'item-template.json')
const ID = /^[a-z][a-z0-9]{4,23}$/
const t0 = Date.now()
const say = (m) => console.log(m)
const stage = (m) => say(`[${((Date.now() - t0) / 1000).toFixed(1)} с] ${m}`)

function fail(reason, cleanDir = null) {
  if (cleanDir && existsSync(cleanDir)) rmSync(cleanDir, { recursive: true, force: true })
  say(`===BIRTH_FAILED=== ${reason}`)
  process.exit(1)
}

function git(args, cwd) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true })
  return { rc: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

const id = process.argv[2]
if (!id || !ID.test(id)) fail(`имя «${id ?? ''}» — не имя черновика (буква, затем 4–23 строчных латинских или цифр)`)

// 1. Черновик существует и ещё не родился.
let drafts = []
try { drafts = JSON.parse(readFileSync(DRAFTS_FILE, 'utf8')).drafts ?? [] } catch { /* нет файла — нет черновиков */ }
if (!drafts.some((d) => d?.id === id)) fail(`черновика «${id}» нет — рождается только то, что заведено кнопкой «Создать AGI ITEM»`)

const registry = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8'))
if (registry.services.some((s) => s.id === id)) fail(`«${id}» уже есть в реестре узла — второй раз не рождается`)

const dir = itemDir(id, 'user')
if (existsSync(dir)) fail(`папка ${dir} уже существует — рождение не пишет поверх чужих файлов`)

const template = JSON.parse(readFileSync(TEMPLATE_FILE, 'utf8'))
stage(`рождаю «${id}» из ${template.from} ${template.version}`)

// 2. Шаблон по закреплённому тегу.
const clone = git(['clone', '--quiet', '--depth', '1', '--branch', template.version, template.repo, dir], ROOT)
if (clone.rc !== 0) fail(`шаблон не скачан: ${clone.out.trim().split('\n').slice(-1)[0]}`, dir)
stage('шаблон скачан')

// 3. Своя история вместо истории шаблона.
rmSync(join(dir, '.git'), { recursive: true, force: true })

// 4. Паспорт.
const propsFile = join(dir, 'OWN-SERVICE-PROPS.json')
if (!existsSync(propsFile)) fail('в шаблоне нет OWN-SERVICE-PROPS.json — элементу не у кого спросить своё имя', dir)
const props = JSON.parse(readFileSync(propsFile, 'utf8'))
props.id = id
props.name = id
// 325-1: СВОЁ ОПИСАНИЕ, А НЕ ШАБЛОННОЕ. ✗ Замерено: рождённый `as8kp` описывал себя словами шаблона («The template of a node
// element…»). Первичная запись говорит, кто это и откуда; что элемент умеет, пишет его агент (Настройки → Описание, 325-2).
props.summary = `AGI element ${id}, born from ${template.from} ${template.version} on ${new Date().toISOString().slice(0, 10)}. Its capabilities are written by its agent from Settings → Capabilities description.`
writeFileSync(propsFile, JSON.stringify(props, null, 2) + '\n', 'utf8')

const ident = ['-c', 'user.name=Fractera node', '-c', 'user.email=node@fractera.local']
for (const step of [['init', '--quiet', '-b', 'main'], ['add', '-A'], [...ident, 'commit', '--quiet', '-m', `born from ${template.from} ${template.version}`]]) {
  const r = git(step, dir)
  if (r.rc !== 0) fail(`своя история не заведена (git ${step.filter((a) => !a.startsWith('user.')).join(' ')}): ${r.out.trim().split('\n').slice(-1)[0]}`, dir)
}
stage(`своя история: ${git(['rev-parse', '--short', 'HEAD'], dir).out.trim()}, паспорт — «${id}»`)

// 5. Запись реестра.
registry.services.push({
  id,
  repo: template.repo,
  version: template.version,
  born: { from: template.from, version: template.version, at: new Date().toISOString() },
  provides: ['element-site'],
  required: false,
  note: `Рождён из ${template.from} ${template.version} (319). Самостоятельный проект: установщик его код не трогает.`,
  kind: 'user',
})
writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + '\n', 'utf8')
stage('записан в реестр узла')

// 6. Тот же путь, что установка службы.
stage('ставлю: порт, окружение, зависимости, сборка, запуск (минуты)')
const install = spawnSync(process.execPath, [join(ROOT, 'scripts', 'services-install.mjs'), '--only', id], { stdio: 'inherit', windowsHide: true })
if (install.status !== 0) {
  say(`\nустановка не завершилась — папка и запись реестра остаются, повтор: npm run services:install -- --only ${id}`)
  say(`===BIRTH_FAILED=== установка «${id}» (код ${install.status})`)
  process.exit(1)
}
const port = JSON.parse(readFileSync(REGISTRY_FILE, 'utf8')).services.find((s) => s.id === id)?.port ?? null

// 7. Запуск. 🛑 Установщик перезапускает только то, что уже жило в pm2 (закон «Настройки и дизайн на лету»: новые службы он
// не поднимает) — рождённый элемент запускается здесь: служба и её сторож из `ecosystem.config.cjs`, затем `pm2 save`,
// чтобы элемент пережил перезагрузку машины. `.cmd` на Windows — только через оболочку и с постоянными аргументами
// (закон CVE-2024-27980); `id` уже сверен с образцом выше.
const IS_WIN = process.platform === 'win32'
const pm2 = (args) => spawnSync(IS_WIN ? 'pm2.cmd' : 'pm2', args, { cwd: ROOT, encoding: 'utf8', shell: IS_WIN, windowsHide: true })
for (const name of [`fractera-svc-${id}`, `fractera-svc-${id}-watch`]) {
  const r = pm2(['start', 'ecosystem.config.cjs', '--only', name])
  if (r.status !== 0) {
    say(`запуск ${name} не удался — повтор: pm2 start ecosystem.config.cjs --only ${name}`)
    say(`===BIRTH_FAILED=== запуск «${id}»`)
    process.exit(1)
  }
}
pm2(['save'])
stage('запущен в pm2, жду ответа элемента')

// Ждём ответ по ФАКТУ, а не паузой (закон «после pm2 reload ждать порт по факту»).
const health = JSON.parse(readFileSync(join(dir, 'OWN-SERVICE-PROPS.json'), 'utf8')).health?.path ?? '/'
let answered = 0
for (let i = 0; i < 60 && !answered; i++) {
  try {
    const r = await fetch(`http://localhost:${port}${health}`, { signal: AbortSignal.timeout(3000) })
    if (r.ok) answered = r.status
  } catch { /* ещё поднимается */ }
  if (!answered) await new Promise((res) => setTimeout(res, 1000))
}
if (!answered) {
  say(`элемент запущен, но за минуту не ответил на ${health} — журнал: logs/svc-${id}-err.log`)
  say(`===BIRTH_FAILED=== «${id}» не отвечает`)
  process.exit(1)
}
stage(`родился: порт ${port}, ${health} → ${answered}`)
say(`===BIRTH_OK=== ${id} port ${port}`)
