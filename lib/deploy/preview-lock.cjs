// ПРЕДПРОСМОТР ЖДЁТ РЕШЕНИЯ — РАЗВЁРТЫВАНИЕ ЭТОГО ЭЛЕМЕНТА ЗАПРЕЩЕНО (узел, шаг 353-1).
//
// Слово владельца 2026-10-01: «до тех пор пока я не принял или отложил текущее состояние развёртывания мне запрещено видеть …
// интерфейс для запуска нового развёртывания». ✗ Оплачено 2026-09-30 21:03: предпросмотр mzjce был готов и работал из `.next-a`;
// «Развернуть» стало собирать в ту же `.next-a` (соседняя папка у обоих одна) → EBUSY → упавшая сборка стёрла `.next-a` →
// «Принять» через 34 с переключило сайт на стёртую папку, сайт лёг. Кнопка была активна, потому что страница не знала о
// предпросмотре, собранном из терминала, — поэтому запрет стоит здесь, у двери и у скрипта, а не только на экране.
//
// Ждёт решения = `building` с живым процессом сборки или `ready` с живым сервером предпросмотра (живость — сигналом 0, как у
// замка развёртывания). Погасший предпросмотр не держит: его папку можно пересобирать.

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

function alive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM')
  }
}

/** Состояние предпросмотра элемента, если он ждёт решения (`building`/`ready` с живым процессом); иначе null. */
function pendingPreview(root, id) {
  let p = null
  try { p = JSON.parse(readFileSync(join(root, 'data', 'services', id, 'preview.json'), 'utf8')) } catch { return null }
  if (p && p.state === 'building' && alive(p.pid)) return p
  if (p && p.state === 'ready' && alive(p.serverPid)) return p
  // Идёт «Принять» — переключение на собранную папку: развёртывание тоже ждёт.
  if (p && p.state === 'promoting' && alive(p.pid)) return p
  // Идёт «Отклонить» — стирается соседняя папка: развёртывание в неё же ждёт.
  if (p && p.state === 'discarding' && alive(p.pid)) return p
  return null
}

module.exports = { pendingPreview }
