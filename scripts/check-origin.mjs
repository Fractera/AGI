// ПОДЛИННОСТЬ УЗЛА: ставится только ПРЯМОЙ ФОРК оригинала Fractera (шаг 368). Запуск: первым звеном `prebuild` и в `serve:start`.
//
// Слово владельца 2026-10-01: «… продвижение моего проекта … зависит от количества Форк. Если кто-то будет например продавать свои
// обновления при помощи моего стартера то это нужно сделать невозможным … хард кодом оставить проверку на соответствии того что Форк
// сделан именно из моего репозитория … в процессе установки … отказ с ошибкой … что вы пытаетесь установить неоригинальный проект
// Fractera»; «Название нашего репозитория должно быть зашито где-то в той части проекта которая будет обфусцирована».
//
// 🔒 ОРИГИНАЛ ЗАШИТ ЗДЕСЬ, а не в окружении: переменную подменил бы кто угодно. В окружение узла пишется только адрес форка
// человека (`NODE_REPO_URL`) — как факт для проекта, не для проверки.
// 🔒 ПРАВИЛО: `origin` узла — прямой форк оригинала (GitHub: fork = true, parent = оригинал). Сам оригинал без форка, форк форка,
// чужой репозиторий — отказ. GitHub не ответил — отказ «повторите позже» (решение владельца: «Не ставить, повторить позже»).
// 🔒 ОТМЕТКА `logs/origin.json` (файл этой машины, не в git): проверенный адрес не спрашивается снова — пересборка и запуск
// проверенного узла не требуют сети; смена `origin` — новая проверка.
// 🛑 Пока этот файл не обфусцирован, проверку можно вырезать правкой кода или подделать отметку — так и сказано владельцу.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ORIGINAL = 'fractera/agi'
const ORIGINAL_URL = 'https://github.com/fractera/agi'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RECORD = join(root, 'logs', 'origin.json')
const ENV = join(root, '.env.local')

function refuse(why) {
  console.error('')
  console.error('Вы пытаетесь установить неоригинальный проект Fractera.')
  console.error(why)
  console.error(`Установка Fractera — только из СВОЕГО форка оригинала: откройте ${ORIGINAL_URL}, нажмите Fork и установите по ссылке на вашу копию.`)
  console.error(`===ORIGIN_FAILED=== ${why}`)
  process.exit(1)
}

/** `owner/repo` из адреса GitHub (https или ssh), в нижнем регистре; иначе null. */
function slugOf(url) {
  const m = String(url).trim().match(/github\.com[/:]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i)
  return m ? `${m[1]}/${m[2]}`.toLowerCase() : null
}

const remote = spawnSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8', windowsHide: true })
const url = remote.status === 0 ? remote.stdout.trim() : ''
const slug = slugOf(url)
if (!slug) refuse(url ? `Адрес репозитория узла «${url}» — не GitHub.` : 'У папки узла нет адреса репозитория (git remote origin) — узел поставлен не клонированием форка.')

let record = null
try { record = JSON.parse(readFileSync(RECORD, 'utf8')) } catch { /* первой проверки ещё не было */ }
if (record?.slug === slug && (record.verdict === 'fork' || record.verdict === 'author')) {
  console.log(`===ORIGIN_OK=== ${slug} (${record.verdict}, проверено ${record.checkedAt})`)
  process.exit(0)
}

let res
try {
  res = await fetch(`https://api.github.com/repos/${slug}`, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'fractera-node' }, signal: AbortSignal.timeout(15_000) })
} catch {
  refuse('Не удалось проверить репозиторий у GitHub (нет связи). Повторите установку позже.')
}
if (res.status === 403 || res.status === 429) refuse('GitHub временно ограничил проверки с этого адреса. Повторите установку позже (через час).')
if (res.status === 404) refuse(`Репозиторий ${slug} не найден у GitHub или закрыт.`)
if (!res.ok) refuse(`GitHub ответил ${res.status} — проверить не удалось. Повторите установку позже.`)
const repo = await res.json()
const name = String(repo.full_name ?? '').toLowerCase()
const parent = String(repo.parent?.full_name ?? '').toLowerCase()
if (name === ORIGINAL) refuse('Это сам оригинал, а не ваш форк.')
if (!repo.fork || parent !== ORIGINAL) refuse(repo.fork ? `${repo.full_name} — форк ${repo.parent?.full_name}, а не оригинала.` : `${repo.full_name} — не форк оригинала Fractera.`)

mkdirSync(dirname(RECORD), { recursive: true })
writeFileSync(RECORD, JSON.stringify({ slug, url, verdict: 'fork', parent: repo.parent.full_name, checkedAt: new Date().toISOString() }, null, 2) + '\n', 'utf8')
// Адрес форка — в окружение узла (факт для проекта; проверка его не читает).
const env = existsSync(ENV) ? readFileSync(ENV, 'utf8') : ''
const line = `NODE_REPO_URL=${repo.html_url}`
writeFileSync(ENV, /^NODE_REPO_URL=.*$/m.test(env) ? env.replace(/^NODE_REPO_URL=.*$/m, line) : `${env}${env === '' || env.endsWith('\n') ? '' : '\n'}${line}\n`, 'utf8')
console.log(`===ORIGIN_OK=== ${repo.full_name} — форк ${repo.parent.full_name}`)
