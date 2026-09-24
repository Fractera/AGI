// РАЗВЁРТЫВАНИЕ ЭЛЕМЕНТОВ УЗЛА ПО ОДНОМУ (280-11b).
//
// Слово владельца 2026-09-24: «кнопку повторить развёртывание … перечисление всех сервисов и выборочно
// сделать развёртывание либо одного из сервисов либо сразу всех одной кнопкой». Зовёт его дверь
// `POST /api/node/deploy`; вручную — `node scripts/deploy-elements.mjs root auth`.
//
// 🔒 ПО ОДНОМУ, А НЕ РАЗОМ. Каждая сборка Next съедает процессор и память машины человека; две
// параллельные на домашнем компьютере делают обе медленнее и чаще падают (`kill EPERM`, 2026-09-24).
// Каждый элемент пересобирается установщиком (`--only <id> --rebuild`): элемент со сборкой в соседнюю
// папку (280-9) не гаснет, прочие — гаснут на время сборки и откатываются при провале.
//
// 🔒 ХОД ПИШЕТСЯ В ФАЙЛ, А НЕ ПОМНИТСЯ. `logs/deploy-state.json` читает дверь — страница спрашивает её
// раз в несколько секунд. Файл держит и замок: пока `running`, вторая кнопка получает отказ.

import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const STATE = join(ROOT, 'logs', 'deploy-state.json')
const LOG = join(ROOT, 'logs', 'deploy.log')
const ids = process.argv.slice(2).filter((a) => /^[a-z][a-z0-9-]{0,31}$/.test(a))

mkdirSync(join(ROOT, 'logs'), { recursive: true })
const state = { running: true, startedAt: new Date().toISOString(), finishedAt: null, queue: ids, current: null, results: [] }
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n')
save()

for (const id of ids) {
  state.current = id
  save()
  const t0 = Date.now()
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'services-install.mjs'), '--only', id, '--rebuild'], {
    cwd: ROOT, encoding: 'utf8', windowsHide: true,
  })
  const out = (r.stdout ?? '') + (r.stderr ?? '')
  appendFileSync(LOG, `\n=== ${new Date().toISOString()} ${id}\n${out}`)
  const ok = r.status === 0 && !/ОШИБКА/.test(out)
  state.results.push({
    id,
    ok,
    seconds: Math.round((Date.now() - t0) / 1000),
    note: (out.match(/собран[^\n]*|ОШИБКА[^\n]*|прежняя сборка[^\n]*/g) || []).join(' · ').slice(0, 300),
  })
  save()
}

state.running = false
state.current = null
state.finishedAt = new Date().toISOString()
save()
