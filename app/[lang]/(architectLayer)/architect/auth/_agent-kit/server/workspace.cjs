// ПАПКА, В КОТОРОЙ ЖИВЁТ АГЕНТ СЛУЖБЫ (267-1, комплект — 269).
//
// 🔒 РАБОЧАЯ ПАПКА ЕСТЬ ЛИЧНОСТЬ АГЕНТА: `claude` читает `CLAUDE.md`, права и инструменты из папки
// запуска. Поэтому папку называет ОДНА функция, и её же печатает страница до запуска — страница не имеет
// права назвать одну папку, пока агент рождается в другой.
//
// 🔒 ИМЯ СЛУЖБЫ — ПАРАМЕТР, А НЕ КОНСТАНТА (269, слово владельца: «техническое решение, которое в качестве
// параметров принимает и возвращает возможность быстро встраивать в новые микросервисы»). Одна служба —
// одна сессия Claude Code и один Telegram-бот. 🪦 До 269 здесь стояло `AGENT_SERVICE = 'auth'`.
//
// 🔒 ИМЯ ПРОВЕРЯЕТСЯ ПО РЕЕСТРУ УЗЛА И ПО ДИСКУ: службы, которой нет в `AGI-ITEMS-CONFIG/agi-items.json`
// или в `AGI-ITEMS/<kind>/<id>`, не существует — мост отказывает словами, а не рождает агента в чужой папке. Имя
// приходит из браузера, поэтому и форма имени проверяется: путь из него собирается.

const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')

// 🛑 КОРЕНЬ — `process.cwd()`, КАК У ВСЕГО УЗЛА (`lib/domain/auth-env.ts`), а не `__dirname`: модуль
// читают и `server.js`, и бандл двери Next, а внутри бандла `__dirname` указывает в `.next`, не в проект.
const ROOT = process.cwd()
const ID_SHAPE = /^[a-z][a-z0-9-]{0,39}$/

// 🛑 ВТОРАЯ КОПИЯ ЗНАНИЯ О ПУТИ, И ОНА НАМЕРЕННАЯ: копия комплекта уезжает в папку службы целиком и не
// имеет права зависеть от `lib/agi-items/paths.cjs` узла. Расхождение ловит `npm run check:agent-kits`.
const itemDir = (id, kind) => path.join(ROOT, 'AGI-ITEMS', kind === 'user' ? 'user' : 'core', id)

function registered() {
  try {
    const reg = JSON.parse(readFileSync(path.join(ROOT, 'AGI-ITEMS-CONFIG', 'agi-items.json'), 'utf8'))
    return Array.isArray(reg.services) ? reg.services.filter((s) => s && typeof s.id === 'string') : []
  } catch {
    return []
  }
}

/** Абсолютный путь папки службы или `null`, если имени нет в реестре, на диске или оно не той формы. */
function serviceDir(service) {
  const id = String(service ?? '')
  const entry = ID_SHAPE.test(id) ? registered().find((s) => s.id === id) : null
  if (!entry) return null
  const dir = itemDir(id, entry.kind)
  return existsSync(dir) ? dir : null
}

/** Службы узла, у которых есть папка: им комплект агента доступен. */
function agentServices() {
  return registered().map((s) => s.id).filter((id) => ID_SHAPE.test(id) && serviceDir(id) !== null)
}

module.exports = { serviceDir, agentServices }
