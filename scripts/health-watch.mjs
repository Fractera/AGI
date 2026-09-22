// СТОРОЖ ЗДОРОВЬЯ — ЕДИНСТВЕННОЕ, ЧТО ЛОВИТ «ПРОЦЕСС ЖИВ, А САЙТ НЕ РАБОТАЕТ».
//
// ✗ Оплачено 2026-09-18 утром, на машине владельца. После перезагрузки процесс
// сервера был ЖИВ и держал порт, а каждая страница отдавала 500. Для pm2 это
// состояние `online`: он смотрит на процесс, а умирает способность отвечать.
// Контейнер повёл бы себя так же. Отличить одно от другого может только тот,
// кто спрашивает сайт по HTTP, — то есть этот файл.
//
// 🔒 ТЕРПЕНИЕ — ЕГО ГЛАВНОЕ СВОЙСТВО, А НЕ ЧУТКОСТЬ. В режиме разработки холодная
// компиляция страницы занимает секунды и десятки секунд (измерено: 41 с на
// первом запросе после рестарта). Сторож, дёргающий сервер на первой же медленной
// странице, опаснее самого отказа: он превращает медленный старт в бесконечный
// цикл перезапусков, и человек не может открыть сайт ВООБЩЕ. Поэтому решение о
// перезапуске принимается только после нескольких неудач подряд.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import paths from '../lib/agi-items/paths.cjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const runtimeFile = path.join(root, 'logs', 'runtime.json')

const APP_NAME = process.env.FRACTERA_APP_NAME || 'fractera-agi'
// Пусто — сторожим сам узел; имя блока — сторожим этот блок.
const WATCH_SERVICE = process.env.FRACTERA_WATCH_SERVICE || ''
const INTERVAL_MS = Number(process.env.FRACTERA_HEALTH_INTERVAL_MS) || 30000
const TIMEOUT_MS = Number(process.env.FRACTERA_HEALTH_TIMEOUT_MS) || 15000
const FAILURES_BEFORE_RESTART = Number(process.env.FRACTERA_HEALTH_FAILURES) || 3
// После перезапуска сервер снова компилирует страницы с нуля. Не выдержав паузу,
// сторож посчитал бы эту компиляцию новым отказом и ушёл в цикл.
const COOLDOWN_MS = Number(process.env.FRACTERA_HEALTH_COOLDOWN_MS) || 120000

const isWindows = process.platform === 'win32'
const pm2 = isWindows ? 'pm2.cmd' : 'pm2'

let failures = 0
let restarts = 0
let nextCheckAfter = 0

function log(message) {
  // Отметка времени своя: сторож пишет в тот же журнал pm2, но собственную
  // строку должен быть виден отдельно от строк сервера.
  console.log(`[health-watch ${new Date().toISOString()}] ${message}`)
}

// 🔒 ПОРТ СПРАШИВАЕТСЯ У СЕРВЕРА, А НЕ ПРЕДПОЛАГАЕТСЯ. Сервер уступает занятый
// порт следующему свободному (`lib/server-port.cjs`) и записывает выбранный в
// `logs/runtime.json`. Сторож, помнящий порт наизусть, в день уступки начал бы
// стучаться в пустоту и перезапускать совершенно здоровый сервер — это хуже, чем
// не сторожить вовсе.
function target() {
  // ── РЕЖИМ СЛУЖБЫ (257-5). Тот же сторож, другой предмет.
  //
  // 🔒 ОДИН ФАЙЛ НА ОБА СЛУЧАЯ — НАМЕРЕННО. Копия сторожа рядом разошлась бы с
  // оригиналом молча, и разошлась бы в терпении: именно оно здесь оплачено
  // опытом. Различаются они не логикой, а ответом на два вопроса: КОГО
  // спрашивать и ЧТО перезапускать.
  //
  // 🛑 ДВЕРЬ ЗДОРОВЬЯ НАЗЫВАЕТ САМА СЛУЖБА, А НЕ МЫ. У слоя данных это /health —
  // единственная дверь без ключа; у авторизации /api/auth/methods. Угадай мы
  // «/health» для обеих — сторож авторизации получал бы 404 навсегда и
  // перезапускал бы совершенно здоровую службу каждые полторы минуты. Имя двери
  // приезжает из паспорта в отметку установки, а порт — из реестра.
  if (WATCH_SERVICE) {
    try {
      const registry = JSON.parse(readFileSync(paths.REGISTRY_FILE, 'utf8'))
      const entry = (registry.services || []).find((s) => s.id === WATCH_SERVICE)
      const stamp = JSON.parse(
        readFileSync(path.join(paths.itemDir(WATCH_SERVICE, registry.services.find((s) => s.id === WATCH_SERVICE)?.kind), '.install-stamp.json'), 'utf8'),
      )
      if (entry?.port && stamp?.health) {
        return { url: `http://127.0.0.1:${entry.port}${stamp.health}`, known: true }
      }
    } catch {
      // Реестра или отметки нет — служба не установлена. Сторожить нечего.
    }
    return { url: null, known: false }
  }

  try {
    const runtime = JSON.parse(readFileSync(runtimeFile, 'utf8'))
    if (runtime?.port) {
      return { url: `http://${runtime.hostname || 'localhost'}:${runtime.port}/api/health`, known: true }
    }
  } catch {
    // файла ещё нет — сервер не успел подняться ни разу
  }
  return { url: 'http://localhost:24680/api/health', known: false }
}

async function probe(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    return { ok: response.ok, status: response.status }
  } catch (error) {
    // Отказ соединения и таймаут — разные болезни: первая означает, что никто не
    // слушает, вторая — что слушает, но не отвечает. Различие идёт в журнал,
    // потому что разбирать потом будут по нему.
    return { ok: false, status: error.name === 'AbortError' ? 'таймаут' : 'соединения нет' }
  }
}

function restart() {
  restarts += 1
  log(`перезапускаю ${APP_NAME} (перезапуск №${restarts} за жизнь сторожа)`)
  // 🛑 windowsHide ОБЯЗАТЕЛЕН У ЛЮБОГО ПРОЦЕССА, ЗАПУЩЕННОГО ФОНОВОЙ СЛУЖБОЙ.
  // В node он по умолчанию false, и Windows открывает чёрное окно консоли на
  // полэкрана. ✗ оплачено 2026-09-18: окна туннеля мигали поверх работы
  // владельца при каждом обрыве связи — «компьютер выглядит как кирпич у
  // которого сломанный экран». Здесь это случалось бы при каждом перезапуске.
  const result = spawnSync(pm2, ['restart', APP_NAME], { encoding: 'utf8', shell: isWindows, windowsHide: true })
  if (result.error || result.status !== 0) {
    log(`перезапуск НЕ УДАЛСЯ: ${result.error?.message || result.stderr?.trim() || 'код ' + result.status}`)
    return
  }
  log('перезапуск выполнен, жду, пока сервер соберёт страницы')
  nextCheckAfter = Date.now() + COOLDOWN_MS
}

async function tick() {
  if (Date.now() < nextCheckAfter) return

  const { url, known } = target()
  if (!url) return // блок объявлен, но не установлен — сторожить нечего
  const { ok, status } = await probe(url)

  if (ok) {
    if (failures > 0) log(`сайт снова отвечает (${url}) — счётчик неудач сброшен с ${failures}`)
    failures = 0
    return
  }

  failures += 1
  log(
    `неудача ${failures}/${FAILURES_BEFORE_RESTART}: ${url} → ${status}` +
      (known ? '' : ' (порт неизвестен, спрашиваю по умолчанию — сервер ещё ни разу не поднялся)'),
  )

  if (failures >= FAILURES_BEFORE_RESTART) {
    log('процесс жив, но сайт не отвечает — это тот самый отказ, который pm2 не видит')
    restart()
    failures = 0
  }
}

log(
  `сторож пущен для ${WATCH_SERVICE ? 'блока «' + WATCH_SERVICE + '»' : 'узла'}: ` +
    `каждые ${INTERVAL_MS / 1000} с, терпение ${FAILURES_BEFORE_RESTART} неудачи подряд, ` +
    `таймаут ответа ${TIMEOUT_MS / 1000} с, пауза после перезапуска ${COOLDOWN_MS / 1000} с`,
)

// Первая проверка — не сразу: при общем старте сторож и сервер поднимаются
// одновременно, и мгновенный опрос застал бы сервер за компиляцией.
nextCheckAfter = Date.now() + COOLDOWN_MS / 2
setInterval(() => {
  tick().catch((error) => log(`ошибка внутри проверки: ${error.message}`))
}, INTERVAL_MS)
