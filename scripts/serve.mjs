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
import paths from '../lib/agi-items/paths.cjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const runtimeFile = path.join(root, 'logs', 'runtime.json')
const ecosystem = path.join(root, 'ecosystem.config.cjs')
const tunnelFile = path.join(root, 'logs', 'tunnel.json')

const isWindows = process.platform === 'win32'
const pm2 = isWindows ? 'pm2.cmd' : 'pm2'
const TASK_NAME = 'FracteraAGI'

function pm2run(args, options = {}) {
  // shell только на Windows и только потому, что node отказывается запускать
  // `.cmd` без него (EINVAL, запрет после CVE-2024-27980). Подробности — в
  // `scripts/ensure-pm2.mjs`.
  return spawnSync(pm2, args, { encoding: 'utf8', shell: isWindows, windowsHide: true, stdio: options.quiet ? 'pipe' : 'inherit' })
}

function readTunnel() {
  try {
    return JSON.parse(readFileSync(tunnelFile, "utf8"))
  } catch {
    return null
  }
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
  //
  // 🔒 И СЛОВО «ЛОКАЛЬНО» ЗДЕСЬ ОБЯЗАТЕЛЬНО. ✗ оплачено 2026-09-19: строка
  // «сайт отвечает: 200» стояла рядом со строкой о публичном адресе и читалась
  // как ответ на вопрос «виден ли сайт из интернета». Сайт был виден только
  // хозяину машины, а в интернете три часа висела ошибка 1016.
  let localCommit = null
  if (url) {
    const local = await ask(`${url}/api/health`)
    localCommit = local.body?.commit ?? null
    console.log(
      local.ok
        ? `сайт отвечает локально: 200, сборка ${localCommit ?? 'неизвестна'}`
        : `⚠ процесс жив, но сайт не отвечает локально (${local.status}) — сторож перезапустит его сам`,
    )
  }

  await reportServices(apps)
  await reportInternet(apps, localCommit)
  await reportDomain(apps, localCommit)
}

// 🔒 СОСТАВ УЗЛА ПЕЧАТАЕТСЯ ИЗМЕРЕНИЕМ, А НЕ ПЕРЕСКАЗОМ РЕЕСТРА (257-5).
//
// ✗ Оплачено дважды в этом проекте: прибор, печатающий запомненное значение,
// врёт именно тогда, когда на него полагаются. Реестр говорит, КАК ЗАДУМАНО;
// сеть говорит, КАК ЕСТЬ, и расхождение между ними и есть отказ. Поэтому у
// каждого блока спрашивается его собственная дверь здоровья — та, которую он
// назвал в паспорте, — и ответ печатается рядом с состоянием процесса.
async function reportServices(apps) {
  let registry
  try {
    registry = JSON.parse(readFileSync(paths.REGISTRY_FILE, 'utf8'))
  } catch {
    return // реестра нет — узлу нечего докладывать
  }
  const services = registry.services || []
  if (services.length === 0) return

  console.log('')
  console.log('сменные блоки узла:')

  for (const s of services) {
    const proc = apps.find((a) => a.name === `fractera-svc-${s.id}`)
    const watch = apps.find((a) => a.name === `fractera-svc-${s.id}-watch`)

    let stamp = null
    try {
      stamp = JSON.parse(readFileSync(path.join(paths.entryDir(s), '.install-stamp.json'), 'utf8'))
    } catch { /* не установлен */ }

    if (!stamp) {
      console.log(`  ${s.id} — ${s.version} — ОБЪЯВЛЕН, НО НЕ УСТАНОВЛЕН. Поставить: npm run services:install`)
      continue
    }

    const parts = [`${s.id} — ${s.version} — порт ${s.port ?? 'не назначен'}`]
    parts.push(`процесс: ${proc ? proc.pm2_env.status : 'не запущен'}`)
    parts.push(`сторож: ${watch ? watch.pm2_env.status : 'не запущен'}`)

    if (s.port && stamp.health) {
      const r = await ask(`http://127.0.0.1:${s.port}${stamp.health}`)
      parts.push(r.ok
        ? `дверь ${stamp.health} отвечает локально: 200`
        : `⚠ дверь ${stamp.health} НЕ отвечает (${r.status})`)
    } else {
      parts.push('дверь здоровья не объявлена — проверить нечем')
    }

    console.log('  ' + parts.join(' · '))
  }
}


// ПОСТОЯННЫЙ АДРЕС ЧЕЛОВЕКА — ОТДЕЛЬНОЙ СТРОКОЙ, И ТОЖЕ ИЗМЕРЯЕТСЯ (259-4).
//
// 🔒 У КАЖДОЙ СТРОКИ НАЗВАН АДРЕСАТ. Двусмысленная правда работает как ложь: ✗
// оплачено 2026-09-19, когда «сайт отвечает: 200» о localhost читалось как ответ
// на вопрос «виден ли сайт снаружи». Поэтому здесь сказано «свой домен», и
// проверяется он запросом ПО ЭТОМУ ИМЕНИ через интернет, а не чтением файла.
async function reportDomain(apps, localCommit) {
  let domain = null
  try { domain = JSON.parse(readFileSync(path.join(root, "logs", "domain.json"), "utf8")) } catch { /* домен не подключали */ }
  if (!domain?.hostname) {
    console.log("свой домен: не подключён (вкладка «Активация домена» в слое архитектора)")
    return
  }

  const app = apps.find((a) => a.name === "fractera-agi-domain")
  const alive = app && app.pm2_env.status === "online"
  const probe = await ask(`https://${domain.hostname}/api/health`)

  if (probe.ok) {
    console.log(`свой домен: https://${domain.hostname} — отвечает, сборка ${probe.body?.commit ?? "неизвестна"}`)
    if (localCommit && probe.body?.commit && probe.body.commit !== localCommit) {
      console.log(`⚠ по домену отвечает ДРУГАЯ сборка (${probe.body.commit}), локально — ${localCommit}`)
    }
    return
  }

  // 🛑 «ПРОЦЕСС ЖИВ» И «АДРЕС ОТВЕЧАЕТ» — РАЗНЫЕ ФАКТЫ, И РАСХОЖДЕНИЕ НАЗЫВАЕТСЯ.
  // Именно оно и есть отказ: cloudflared переживает смерть своего туннеля.
  console.log(`⚠ свой домен: https://${domain.hostname} — НЕ ОТВЕЧАЕТ (${probe.status})`)
  console.log(`⚠ житель туннеля: ${alive ? "online — процесс жив, а адрес молчит" : "не запущен"}`)
  if (!alive) console.log("⚠ поднять: npx pm2 start ecosystem.config.cjs --only fractera-agi-domain")
}
// 🔒 «РАБОТАЕТ ЛОКАЛЬНО» И «ВИДЕН ИЗ ИНТЕРНЕТА» — РАЗНЫЕ ВОПРОСЫ, И ВТОРОЙ
// ИЗМЕРЯЕТСЯ, А НЕ ВСПОМИНАЕТСЯ. Файл `logs/tunnel.json` говорит, как было
// ЗАДУМАНО; сеть говорит, как ЕСТЬ. ✗ оплачено 2026-09-19: команда печатала
// адрес из файла, пока Cloudflare отдавал по нему ошибку 1016, — прибор врал
// ровно там, где на него полагались, и простой нашёл человек, а не он.
async function reportInternet(apps, localCommit) {
  const tunnel = apps.find((a) => a.name === 'fractera-agi-tunnel')
  if (!tunnel || tunnel.pm2_env.status !== 'online') {
    console.log('в интернете: нет (включить: npm run serve:publish)')
    return
  }

  const state = readTunnel()
  if (!state?.url) {
    console.log('в интернете: адрес ещё не получен, подождите несколько секунд')
    return
  }

  const probe = await ask(`${state.url}/api/health`)

  if (probe.ok) {
    console.log(`в интернете: ${state.url} — отвечает, сборка ${probe.body?.commit ?? 'неизвестна'}`)
    // 🔒 РАЗОШЁЛСЯ ХЭШ — ЗНАЧИТ СНАРУЖИ ОТВЕЧАЕТ НЕ ТОТ ПРОЦЕСС. Тот же класс,
    // что сирота на порту: снаружи всё выглядит работающим, а показывается
    // чужая сборка. Молчать об этом нельзя.
    if (localCommit && probe.body?.commit && probe.body.commit !== localCommit) {
      console.log(`⚠ снаружи отвечает ДРУГАЯ сборка (${probe.body.commit}), локально — ${localCommit}`)
    }
  } else if (probe.status === 'имя не резолвится') {
    // Это и есть Error 1016: быстрый туннель удалён со стороны Cloudflare.
    console.log(`⚠ в интернете: ${state.url} — АДРЕС МЁРТВ (имя не резолвится)`)
    if (state.deadSince) console.log(`⚠ дозорный заметил это ${state.deadSince}`)
    console.log('⚠ сайт локально работает — это протух адрес, а не сломался сайт.')
    console.log('⚠ Вернитесь в чат и попросите агента обновить адрес сайта')
    console.log('⚠ (или выполните сами: npm run serve:publish).')
    // 🔒 Почему не поднимается сам — решение владельца 2026-09-19: адрес при
    // перезапуске всегда новый, и менять ссылку за спиной человека нельзя.
  } else {
    console.log(`⚠ в интернете: ${state.url} — не отвечает (${probe.status})`)
    console.log('⚠ сайт локально работает. Если повторится — поднимите новый адрес: npm run serve:publish')
  }

  // Смена адреса — событие для человека: по прежней ссылке кто-то уже мог
  // прийти, и она не воскреснет никогда.
  if (state.rotations > 0 && state.previousUrl) {
    console.log(`адрес менялся ${state.rotations} раз(а), последний раз ${state.rotatedAt}:`)
    console.log(`прежний ${state.previousUrl} больше не работает`)
  }
}

// Один опрос на всю команду — и для локального адреса, и для публичного. Род
// отказа различается: «имя не резолвится» значит, что туннеля больше нет, а
// таймаут значит, что он есть и молчит.
async function ask(target) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(target, { signal: controller.signal, cache: 'no-store' })
    const body = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, body }
  } catch (error) {
    if (error?.name === 'AbortError') return { ok: false, status: 'таймаут', body: null }
    const text = String(error?.cause?.code || error?.code || error?.message || '')
    if (/ENOTFOUND|EAI_AGAIN/i.test(text)) return { ok: false, status: 'имя не резолвится', body: null }
    return { ok: false, status: 'нет ответа', body: null }
  } finally {
    clearTimeout(timer)
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

// ── ПЕРЕСБОРКА ───────────────────────────────────────────────────────────────
//
// 🔒 ЦЕНА ПРОДАКШНА: собранный сайт не перечитывает исходники. Поправил код —
// пересобери, иначе страница отдаёт прежнюю сборку, и это выглядит как «правка
// не применилась». В режиме разработки пересборки не нужно, но там каждая
// страница компилируется при заходе — ровно то, от чего мы ушли.
function rebuild() {
  console.log("Собираю сайт заново. Это занимает около минуты; сайт всё это время работает.")
  const build = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: isWindows,
  })
  // 🛑 Код выхода берётся у самой сборки. ✗ оплачено в 232-1: конвейер (| tail)
  // печатает код последней команды, и упавшая сборка выглядит успешной.
  if (build.status !== 0) {
    console.error("\nСборка НЕ УДАЛАСЬ — сайт продолжает работать на прежней сборке. Ошибки выше.")
    process.exit(1)
  }
  // 🔒 СТОРОЖ ЯЗЫКОВЫХ СИГНАЛОВ — МЕЖДУ СБОРКОЙ И ПЕРЕЗАПУСКОМ (256-8).
  //
  // Место выбрано по устройству, а не по вкусу: он читает предрендеренный HTML,
  // которого в `prebuild` ещё не существует. Здесь же он оказывается последним
  // рубежом — сайт с дорвейной разметкой просто не выкладывается, и прежняя
  // сборка продолжает работать.
  //
  // 🛑 ЗАЧЕМ ОН, ЕСЛИ ЕСТЬ `check:seo` В `prebuild`. Тот читает ИСХОДНИК: зовёт ли
  // страница `buildAlternates`. Измерено 2026-09-20 — он печатал `SEO_OK`, когда в
  // отданном HTML было НОЛЬ тегов `canonical` и `hreflang`. Этот читает ФАКТ.
  const seo = spawnSync(process.execPath, [path.join(root, "scripts", "check-seo-html.mjs")], {
    cwd: root,
    stdio: "inherit",
  })
  if (seo.status !== 0) {
    console.error("\nСборка собралась, но языковые сигналы в ней противоречат друг другу —")
    console.error("сайт НЕ выложен и продолжает работать на прежней сборке. Разбор выше.")
    console.error("Это защита от ярлыка «дорвей»: набор почти одинаковых адресов,")
    console.error("обещанных поисковику, стоит сайту присутствия в выдаче целиком.")
    process.exit(1)
  }

  console.log("\nСборка готова, перезапускаю сайт…")
  pm2run(["restart", "fractera-agi"], { quiet: true })
  console.log("Готово. Проверить: npm run serve:status")
}

// 🔒 ПРЕДУПРЕЖДЕНИЕ ГОВОРИТСЯ В МОМЕНТ ВЫДАЧИ АДРЕСА, А НЕ В МОМЕНТ ОТКАЗА —
// решение владельца 2026-09-19: «в момент когда пользователь устанавливает,
// инструкция должна ему сообщить, что домен который вы получаете является
// временным». Человек, узнавший об этом заранее, видит в ошибке Cloudflare
// понятное событие; человек, узнающий впервые, видит сломанный продукт.
//
// 🔒 ОДНА ФУНКЦИЯ, А НЕ ДВЕ КОПИИ: текст печатается и при новой публикации, и
// при повторной. Две копии расходятся молча — здесь это значило бы, что половина
// людей цену адреса не услышит.
function printAddressPrice() {
  console.log('')
  console.log('🛑 ЭТОТ АДРЕС ВРЕМЕННЫЙ. Он живёт, пока живёт туннель, и меняется при перезапуске.')
  console.log('   Однажды сайт по нему перестанет открываться, и Cloudflare покажет страницу')
  console.log('   с ошибкой 1016 или 1033. Это значит, что адрес устарел, — САЙТ ПРИ ЭТОМ ЦЕЛ')
  console.log('   и продолжает работать у вас на компьютере.')
  console.log('   Что делать: вернуться в чат и попросить агента обновить адрес сайта')
  console.log('   (или выполнить самому: npm run serve:publish -- --new).')
  console.log('   Постоянный адрес, который не протухает, — это свой домен.')
}

// 🔒 ПОВТОРНАЯ ПУБЛИКАЦИЯ НЕ МЕНЯЕТ АДРЕС — ✗ оплачено 2026-09-19 самим
// владельцем: он открыл ссылку, которую я дал ему двадцатью минутами раньше, и
// получил ошибку 1016. Адрес сменился не от отказа, а от МОЕЙ доставки: команда
// перезапускала живой и здоровый туннель при каждом вызове.
//
// 🛑 ЭТО ПОЛОВИНА ЗАКОНА ВЛАДЕЛЬЦА, ИСПОЛНЕННАЯ НЕ ДО КОНЦА. «Не трогать, только
// честно сообщать» запрещает машине менять адрес самой — а право менять его при
// каждой доставке я оставил себе. Для человека разницы нет: ссылка, которую он
// кому-то дал, перестала работать, и он об этом не знает.
//
// Поэтому: туннель жив и адрес отвечает → печатаем ТОТ ЖЕ адрес. Новый выдаётся
// только по явной просьбе — `npm run serve:publish -- --new`.
async function publish() {
  const wantNew = process.argv.includes('--new')

  if (!wantNew) {
    const list = pm2run(['jlist'], { quiet: true })
    let apps = []
    try {
      apps = JSON.parse(list.stdout)
    } catch {
      apps = []
    }
    const tunnel = apps.find((a) => a.name === 'fractera-agi-tunnel')
    const state = readTunnel()
    if (tunnel?.pm2_env?.status === 'online' && state?.url) {
      // Спрашиваем сеть, а не файл: адрес мог умереть, пока мы не смотрели.
      const probe = await ask(`${state.url}/api/health`)
      if (probe.ok) {
        console.log(`\nСАЙТ УЖЕ В ИНТЕРНЕТЕ: ${state.url}`)
        console.log('Адрес не меняю — по нему могли уже прийти люди.')
        console.log('Нужен именно новый адрес: npm run serve:publish -- --new')
        printAddressPrice()
        return
      }
      console.log(`Прежний адрес (${state.url}) больше не отвечает — поднимаю новый.`)
    }
  }

  // 🛑 Публикация — отдельное решение человека, поэтому и отдельная команда.
  // Сайт при этом должен уже работать: туннель без сайта отдаёт наружу пустоту.
  //
  // 🔒 СТАРЫЙ АДРЕС УДАЛЯЕТСЯ ДО ЗАПУСКА, И ЭТО НЕ УБОРКА, А СУТЬ. ✗ оплачено
  // 2026-09-18 сразу при первой проверке: команда напечатала адрес прошлого
  // туннеля, потому что прочитала файл раньше, чем новый туннель успел его
  // переписать. Человек получил бы ссылку, отдающую 530, и решил бы, что
  // публикация сломана. Файла нет — значит ждать нечего, кроме настоящего
  // нового адреса.
  // 🛑 НО СТИРАТЬ ФАЙЛ ЦЕЛИКОМ НЕЛЬЗЯ — ✗ найдено 2026-09-19 в шаге 238 на
  // собственной работе: вместе с адресом уезжала ИСТОРИЯ адресов, и строка
  // «адрес менялся, прежний больше не работает» не печаталась никогда, хотя код
  // для неё написан. Уходит только сам адрес, память о нём остаётся.
  try {
    const previous = readTunnel()
    const stale = previous?.url || previous?.previousUrl || null
    writeFileSync(
      tunnelFile,
      JSON.stringify(
        {
          previousUrl: stale,
          rotatedAt: previous?.url ? new Date().toISOString() : (previous?.rotatedAt ?? null),
          rotations: previous?.url ? (Number(previous?.rotations) || 0) + 1 : (Number(previous?.rotations) || 0),
        },
        null,
        2,
      ),
    )
  } catch {
    /* не вышло — хуже не станет: сверка ниже всё равно ждёт поля `url`, которого нет */
  }

  // Живой процесс поднимается перезапуском, мёртвый — запуском. `pm2 start` на
  // уже запущенном жителе ведёт себя неочевидно, а нам нужен предсказуемый
  // новый туннель.
  const online = (() => {
    try {
      return JSON.parse(pm2run(['jlist'], { quiet: true }).stdout)
        .some((a) => a.name === 'fractera-agi-tunnel' && a.pm2_env?.status === 'online')
    } catch {
      return false
    }
  })()

  const result = online
    ? pm2run(['restart', 'fractera-agi-tunnel'], { quiet: true })
    : pm2run(['start', ecosystem, '--only', 'fractera-agi-tunnel'])
  if (result.status !== 0) {
    console.error("Не удалось открыть туннель. Журнал: logs/tunnel-err.log")
    process.exit(1)
  }
  pm2run(["save"], { quiet: true })
  console.log("Открываю адрес в интернете, это занимает несколько секунд…")
  // Адрес приходит из вывода cloudflared, поэтому ждём его появления в файле,
  // а не печатаем предположение.
  const срок = Date.now() + 30000
  const ждать = () => {
    const адрес = readTunnel()
    if (адрес?.url) {
      console.log(`\nСАЙТ В ИНТЕРНЕТЕ: ${адрес.url}`)
      printAddressPrice()
      return
    }
    if (Date.now() > срок) {
      console.log("Адрес пока не получен. Посмотрите: npm run serve:status")
      return
    }
    setTimeout(ждать, 1000)
  }
  ждать()
}

function unpublish() {
  pm2run(["stop", "fractera-agi-tunnel"], { quiet: true })
  pm2run(["save"], { quiet: true })
  console.log("Сайт убран из интернета. Локально он продолжает работать.")
}

const command = process.argv[2]

if (command === 'start') start()
else if (command === 'stop') stop()
else if (command === 'status') await status()
else if (command === 'autostart') autostart()
else if (command === 'rebuild') rebuild()
else if (command === 'publish') await publish()
else if (command === 'unpublish') unpublish()
else {
  console.log('Команды: start · stop · status · rebuild · publish · unpublish · autostart')
  console.log('Новый адрес в интернете вместо прежнего: publish -- --new')
  process.exit(1)
}
