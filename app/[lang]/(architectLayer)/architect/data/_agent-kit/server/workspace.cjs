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
// 🔒 ИМЯ ПРОВЕРЯЕТСЯ ПО РЕЕСТРУ УЗЛА И ПО ДИСКУ: службы, которой нет в `MICROSERVICES.json` или в
// `microservices/<id>`, не существует — мост отказывает словами, а не рождает агента в чужой папке. Имя
// приходит из браузера, поэтому и форма имени проверяется: путь из него собирается.

const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')

// 🛑 КОРЕНЬ — `process.cwd()`, КАК У ВСЕГО УЗЛА (`lib/domain/auth-env.ts`), а не `__dirname`: модуль
// читают и `server.js`, и бандл двери Next, а внутри бандла `__dirname` указывает в `.next`, не в проект.
const ROOT = process.cwd()
const ID_SHAPE = /^[a-z][a-z0-9-]{0,39}$/

function registered() {
  try {
    const reg = JSON.parse(readFileSync(path.join(ROOT, 'MICROSERVICES.json'), 'utf8'))
    return Array.isArray(reg.services) ? reg.services.map((s) => s && s.id).filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** Абсолютный путь папки службы или `null`, если имени нет в реестре, на диске или оно не той формы. */
function serviceDir(service) {
  const id = String(service ?? '')
  if (!ID_SHAPE.test(id) || !registered().includes(id)) return null
  const dir = path.join(ROOT, 'microservices', id)
  return existsSync(dir) ? dir : null
}

/** Службы узла, у которых есть папка: им комплект агента доступен. */
function agentServices() {
  return registered().filter((id) => ID_SHAPE.test(id) && existsSync(path.join(ROOT, 'microservices', id)))
}

module.exports = { serviceDir, agentServices }
