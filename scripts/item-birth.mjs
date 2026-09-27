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
//   6. дальше — ТОТ ЖЕ путь, что установка службы: `services-install.mjs --only <id>` (порт, `.env`, сборка, pm2, сторож).
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
if (!drafts.some((d) => d?.id === id)) fail(`черновика «${id}» нет — рождается только то, что заведено кнопкой «Создать микросервис»`)

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
stage(`родился: порт ${port}`)
say(`===BIRTH_OK=== ${id} port ${port}`)
