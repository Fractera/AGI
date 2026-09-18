// ТРИ КОМАНДЫ ЧЕЛОВЕКА: start · stop · status.
//
// 🔒 ЧЕЛОВЕК НЕ ДОЛЖЕН ЗНАТЬ СЛОВО «pm2». Рамка линии — пользователь, не знающий,
// что такое VS Code. Он говорит «запусти» и «останови»; чем это сделано внутри —
// наша забота, и завтра может смениться, не меняя его привычек.
//
// 🔒 ОДИНАКОВО НА WINDOWS, macOS И LINUX. Решение владельца 2026-09-18: «i need
// macos . linlx - all». Различия трёх систем собраны в одном месте — в функции
// `autostart()`, и каждое названо вслух: притворяться, что их нет, дороже, чем
// признать.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const runtimeFile = path.join(root, 'logs', 'runtime.json')
const ecosystem = path.join(root, 'ecosystem.config.cjs')

const isWindows = process.platform === 'win32'
const pm2 = isWindows ? 'pm2.cmd' : 'pm2'
const TASK_NAME = 'FracteraAGI'

function pm2run(args, options = {}) {
  // shell только на Windows и только потому, что node отказывается запускать
  // `.cmd` без него (EINVAL, запрет после CVE-2024-27980). Подробности — в
  // `scripts/ensure-pm2.mjs`.
  return spawnSync(pm2, args, { encoding: 'utf8', shell: isWindows, stdio: options.quiet ? 'pipe' : 'inherit' })
}

function readRuntime() {
  try {
    return JSON.parse(readFileSync(runtimeFile, 'utf8'))
  } catch {
    return null
  }
}

function ensurePm2() {
  const result = spawnSync(process.execPath, [path.join(here, 'ensure-pm2.mjs')], {
    encoding: 'utf8',
    stdio: 'inherit',
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// ─────────────────────────────────────────────────────────────────────────────

function start() {
  ensurePm2()
  const result = pm2run(['start', ecosystem])
  if (result.status !== 0) {
    console.error('Запустить не удалось. Журнал: logs/agi-err.log')
    process.exit(1)
  }
  // Сервер поднимается не мгновенно: Next собирает страницы. Адрес печатается
  // из файла, который пишет САМ сервер, — поэтому он верен и после уступки порта.
  setTimeout(() => {
    const runtime = readRuntime()
    if (runtime?.port) {
      console.log(`\nAGI работает: http://${runtime.hostname || 'localhost'}:${runtime.port}`)
    } else {
      console.log('\nAGI запускается. Через минуту проверьте: npm run serve:status')
    }
  }, 3000)
}

function stop() {
  // Останавливаем обоих жителей: сторож, оставленный один, перезапускал бы
  // сервер, который человек только что попросил остановить, — и выглядело бы
  // это как «кнопка не работает».
  pm2run(['stop', 'fractera-agi-watch'], { quiet: true })
  pm2run(['stop', 'fractera-agi'], { quiet: true })
  console.log('AGI остановлен. Запустить снова: npm run serve:start')
}

async function status() {
  const list = pm2run(['jlist'], { quiet: true })
  let apps = []
  try {
    apps = JSON.parse(list.stdout)
  } catch {
    console.log('AGI не запущен (pm2 не отвечает или ничего не запущено).')
    return
  }

  const server = apps.find((a) => a.name === 'fractera-agi')
  const watch = apps.find((a) => a.name === 'fractera-agi-watch')

  if (!server) {
    console.log('AGI не запущен. Запустить: npm run serve:start')
    return
  }

  const runtime = readRuntime()
  const url = runtime?.port ? `http://${runtime.hostname || 'localhost'}:${runtime.port}` : null

  console.log(`процесс: ${server.pm2_env.status}, pid ${server.pid}, перезапусков ${server.pm2_env.restart_time}`)
  console.log(`сторож здоровья: ${watch ? watch.pm2_env.status : 'не запущен'}`)
  console.log(`адрес: ${url ?? 'неизвестен — сервер ещё не поднимался'}`)

  // 🔒 СОСТОЯНИЕ ПРОЦЕССА И ЖИВОСТЬ САЙТА — РАЗНЫЕ ВОПРОСЫ, И СПРАШИВАЮТСЯ ОНИ
  // ОТДЕЛЬНО. Весь шаг 232 стоит на том, что `online` ничего не обещает.
  if (!url) return
  try {
    const response = await fetch(`${url}/api/health`, { cache: 'no-store' })
    const body = await response.json().catch(() => null)
    console.log(
      response.ok
        ? `сайт отвечает: 200, сборка ${body?.commit ?? 'неизвестна'}`
        : `⚠ процесс жив, но сайт отдаёт ${response.status} — сторож перезапустит его сам`,
    )
  } catch {
    console.log('⚠ процесс жив, но сайт не отвечает вовсе — сторож перезапустит его сам')
  }
}

// ── АВТОЗАПУСК ПРИ ВКЛЮЧЕНИИ КОМПЬЮТЕРА ──────────────────────────────────────
//
// 🛑 ЗДЕСЬ ТРИ СИСТЕМЫ РАСХОДЯТСЯ, И ЭТО НЕ НАШ ВЫБОР. Способ «поднять программу
// при загрузке» принадлежит операционной системе: Linux — systemd, macOS —
// launchd, Windows — служба или Планировщик. pm2 умеет первые два сам; Windows
// он НЕ поддерживает — `pm2 startup` там отвечает отказом. Притворяться, что
// поддерживает, нельзя: человек узнал бы правду только следующей перезагрузкой.
function autostart() {
  pm2run(['save'], { quiet: true })

  if (!isWindows) {
    console.log(`Прошу ${process.platform === 'darwin' ? 'launchd' : 'systemd'} поднимать AGI при входе…`)
    const result = pm2run(['startup'])
    if (result.status !== 0) {
      console.log('\npm2 напечатал команду, которую нужно выполнить от администратора — скопируйте её выше.')
    }
    console.log('Готово. Проверить после перезагрузки: npm run serve:status')
    return
  }

  // Windows: файл в папке автозагрузки. Windows выполняет её содержимое при
  // каждом входе пользователя; `pm2 resurrect` поднимает ровно тот набор
  // процессов, который сохранил `pm2 save`.
  //
  // 🛑 ПОЧЕМУ НЕ ПЛАНИРОВЩИК ЗАДАЧ, ХОТЯ ОН ПРАВИЛЬНЕЕ ПО УЧЕБНИКУ. Измерено
  // 2026-09-18: `schtasks /create` на этой машине отвечает `Access is denied`
  // и с `/ru`, и без него — нужен терминал администратора. Человек, ставящий
  // AGI, администратором не является и не должен им становиться ради сайта на
  // своём же компьютере. Папка автозагрузки прав не требует вовсе.
  //
  // ✗ ПО ДОРОГЕ ОПЛАЧЕНО ВТОРОЕ, И ОНО ПЕРЕЖИВЁТ ЭТОТ ВЫБОР: имя учётной записи
  // нельзя собирать из `os.hostname()`. На этой машине hostname =
  // `BOLSHIYANOV-ASUSF1500`, а `USERDOMAIN` = `BOLSHIYANOV-ASU`: имя NetBIOS
  // обрезано до пятнадцати символов. Отказ «No mapping between account names and
  // security IDs» ждал бы ровно того человека, чей компьютер назван длинно.
  const startupDir = path.join(
    process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
    'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup',
  )
  const startupFile = path.join(startupDir, `${TASK_NAME}.cmd`)

  // Путь к pm2 записывается ПОЛНЫЙ. При входе в систему PATH собран иначе, чем в
  // открытом терминале, и короткое имя `pm2` может не найтись — а отказ в этот
  // момент никто не увидит: окна нет.
  const pm2Path = path.join(process.env.APPDATA || '', 'npm', 'pm2.cmd')
  const pm2Call = existsSync(pm2Path) ? `"${pm2Path}"` : 'pm2'

  try {
    mkdirSync(startupDir, { recursive: true })
    writeFileSync(
      startupFile,
      ['@echo off', 'rem AGI Fractera — автозапуск при входе в систему (npm run serve:autostart)', `call ${pm2Call} resurrect`, ''].join('\r\n'),
    )
  } catch (error) {
    console.error(`Не удалось записать файл автозапуска: ${error.message}`)
    process.exit(1)
  }

  console.log(`Автозапуск включён: ${startupFile}`)
  console.log('AGI поднимется при следующем входе в систему. Проверить: npm run serve:status')
}

const command = process.argv[2]

if (command === 'start') start()
else if (command === 'stop') stop()
else if (command === 'status') await status()
else if (command === 'autostart') autostart()
else {
  console.log('Команды: start · stop · status · autostart')
  process.exit(1)
}
