// ПАПКА, В КОТОРОЙ ЖИВЁТ АГЕНТ ТЕРМИНАЛА И КАНАЛА (267-1).
//
// 🔒 РАБОЧАЯ ПАПКА ЕСТЬ ЛИЧНОСТЬ АГЕНТА: `claude` читает `CLAUDE.md`, права и инструменты из папки
// запуска. Поэтому папку называет ОДНА функция, и её же печатает страница до запуска — страница не имеет
// права назвать одну папку, пока агент рождается в другой.
//
// 🎯 ВЫБОР ВЛАДЕЛЬЦА 2026-09-22 на вопрос «в какой папке живёт агент»: «Служба входа
// (microservices/auth)». Агент — строитель службы входа; вопросы не о входе он отдаёт маршрутизатору (267-4).
//
// 🔒 ИМЯ СЛУЖБЫ СТОИТ ЗДЕСЬ ОДИН РАЗ и проверяется по реестру узла: служба, которой нет в
// `MICROSERVICES.json` или на диске, даёт `null`, и мост отказывает словами, а не рождает агента в чужой папке.

const { existsSync, readFileSync } = require('node:fs')
const path = require('node:path')

const AGENT_SERVICE = 'auth'
// 🛑 КОРЕНЬ — `process.cwd()`, КАК У ВСЕГО УЗЛА (`lib/domain/auth-env.ts`), а не `__dirname`: модуль
// читают и `server.js`, и бандл двери Next, а внутри бандла `__dirname` указывает в `.next`, не в проект.
const ROOT = process.cwd()

function agentService() {
  return AGENT_SERVICE
}

/** Абсолютный путь папки агента или `null`, если службы нет в реестре или на диске. */
function agentDir() {
  try {
    const reg = JSON.parse(readFileSync(path.join(ROOT, 'MICROSERVICES.json'), 'utf8'))
    const listed = Array.isArray(reg.services) && reg.services.some((s) => s && s.id === AGENT_SERVICE)
    if (!listed) return null
  } catch {
    return null
  }
  const dir = path.join(ROOT, 'microservices', AGENT_SERVICE)
  return existsSync(dir) ? dir : null
}

module.exports = { agentDir, agentService }
