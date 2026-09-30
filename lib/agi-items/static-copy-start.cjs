// ЗАПУСК КОПИИ ПУБЛИЧНЫХ СТРАНИЦ В CLOUDFLARE — ОДНО МЕСТО (узел, шаг 344-3). Решение владельца 2026-09-30: копия обновляется
// «После «Принять» и «Развернуть»», а при подключении домена ставится сама — «каждый раз когда пользователь получает наш
// стартовый шаблон вся эта конструкция должна настроиться автоматически». Зовут: `scripts/element-preview.mjs` (Принять),
// `scripts/deploy-elements.mjs` (Развернуть), `lib/agi-items/element-domain.ts` (подключить домен, главный адрес — выложить;
// отключить — `--remove`).
//
// Только для элемента со своим доменом (`data/services/<id>/domain.json`) — остальным копия не нужна, и процесс не рождается.
// Запуск вне дерева процессов ядра (`scripts/spawn-free.mjs`): пересборка ядра не убивает выкладку. Итог —
// `data/services/<id>/static-copy.json` (отказ — с причиной, например нет прав Workers у ключа).

const { spawn } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

function startStaticCopy(root, id, extra = []) {
  const remove = extra.includes('--remove')
  if (!remove && !existsSync(path.join(root, 'data', 'services', id, 'domain.json'))) return false
  const child = spawn(process.execPath, [path.join(root, 'scripts', 'spawn-free.mjs'), path.join(root, 'scripts', 'static-copy.mjs'), id, ...extra], {
    cwd: root, detached: true, windowsHide: true, stdio: 'ignore',
  })
  child.unref()
  return true
}

module.exports = { startStaticCopy }
