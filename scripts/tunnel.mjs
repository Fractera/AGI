// САЙТ В ИНТЕРНЕТЕ — БЫСТРЫЙ ТУННЕЛЬ CLOUDFLARE И ЕГО ДОЗОРНЫЙ.
//
// 🔒 ПЕРВЫЙ ИЗ ДВУХ СЦЕНАРИЕВ, решение владельца 2026-09-18: «сначала первый
// сценарий простой на Cloudflare и потом в панели управления предложим
// пользователю перейти на использование собственного домена». Здесь — первый:
// ни аккаунта, ни домена, ни настройки роутера. Второй сценарий (свой домен,
// постоянный адрес) живёт в панели управления и строится отдельно.
//
// Как это устроено. `cloudflared` открывает исходящее соединение к сети
// Cloudflare и получает адрес вида `https://<четыре-слова>.trycloudflare.com`.
// Снаружи к машине никто не подключается: домашний IP наружу не виден, HTTPS
// даёт Cloudflare.
//
// 🛑 ЦЕНА ПЕРВОГО СЦЕНАРИЯ, НАЗВАННАЯ ВСЛУХ: адрес живёт, пока живёт туннель.
// Перезапуск — новый адрес. Поэтому он пишется в `logs/tunnel.json` и
// показывается командой `npm run serve:status`: единственный способ узнать
// сегодняшний адрес — спросить, а не помнить.
//
// ── ДОЗОРНЫЙ (шаг 237-1, 2026-09-19) ────────────────────────────────────────
//
// ✗ ОПЛАЧЕНО ТРЕМЯ ЧАСАМИ МОЛЧАЛИВОГО ПРОСТОЯ. В 04:17 UTC край Cloudflare
// закрыл соединение, а на перерегистрацию ответил `Unauthorized: Tunnel not
// found`: быстрый туннель был удалён СО СТОРОНЫ Cloudflare. Снаружи это
// `Error 1016` — имя перестало резолвиться. При этом `cloudflared` не упал и не
// сдался: он вечно ломился с мёртвым идентификатором, pm2 писал `online` с
// нулём перезапусков, а `serve:status` бодро печатал мёртвый адрес, потому что
// читал его из файла. Отказ нашёл человек, а не прибор.
//
// 🔒 ПОЧЕМУ ПРЕЖНЯЯ ЗАЩИТА НЕ СРАБОТАЛА. Ниже по файлу стоит закон «умер
// туннель — умираем и мы», повешенный на событие `exit` дочернего процесса. Он
// опирался на допущение, что мёртвый туннель = мёртвый процесс. Допущение
// неверно. Это ровно тот класс, ради которого заведён сторож здоровья сайта
// (232-3): «жив, но не отвечает». Ловит его только опрос по HTTP.
//
// 🔒 ДОЗОРНЫЙ НИЧЕГО НЕ ЛЕЧИТ — РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-09-19, дословно: «Не
// трогать, только честно сообщать». Довод сильнее технического удобства: новый
// адрес означает, что ссылка, которую человек кому-то дал, молча перестала
// работать, а он об этом не знает. Поэтому смерть ПОМЕЧАЕТСЯ в состоянии и
// называется в журнале, а новый адрес человек поднимает сам — `serve:publish`.

import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const runtimeFile = path.join(root, 'logs', 'runtime.json')
const tunnelFile = path.join(root, 'logs', 'tunnel.json')

const isWindows = process.platform === 'win32'

// 🔒 СРОКИ ЖИВУТ СНАРУЖИ, в `ecosystem.config.cjs`. Их придётся подбирать под
// машину и сеть человека, и подбор не должен быть правкой кода.
const INTERVAL_MS = Number(process.env.FRACTERA_TUNNEL_INTERVAL_MS) || 60000
const TIMEOUT_MS = Number(process.env.FRACTERA_TUNNEL_TIMEOUT_MS) || 15000
const FAILURES_BEFORE_VERDICT = Number(process.env.FRACTERA_TUNNEL_FAILURES) || 3

// Внешняя точка, не зависящая от НАШЕГО туннеля. Нужна ровно для одного
// различения: «туннель мёртв» против «у человека нет интернета».
const INTERNET_PROBE = process.env.FRACTERA_TUNNEL_INTERNET_PROBE || 'https://www.cloudflare.com/cdn-cgi/trace'

// 🛑 ВХОД ДЛЯ ПОРЧИ — НЕ ЛАЗЕЙКА, А ЧАСТЬ ПРИБОРА. Сторож, которого нечем
// сломать, зелёный по причине собственной слепоты: ✗ оплачено в 236-1, где
// сторож словарей остался зелёным после того, как я намеренно вынул из словаря
// русский ключ. Задав эту переменную заведомо мёртвым адресом, дозорного
// проверяют на способность КРАСНЕТЬ.
const PROBE_URL_OVERRIDE = process.env.FRACTERA_TUNNEL_PROBE_URL || ''

function log(message) {
  console.log(`[tunnel ${new Date().toISOString()}] ${message}`)
}

// 🔒 ПУТЬ К cloudflared ИЩЕТСЯ, А НЕ ПРЕДПОЛАГАЕТСЯ. pm2 запускает нас с тем
// PATH, который был у его демона в момент старта, — а установщик дописывает
// PATH позже. Процесс, поднятый pm2 вчера, не увидит программу, поставленную
// сегодня, и это выглядит как «её нет».
function findCloudflared() {
  const candidates = []
  if (isWindows) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    candidates.push(
      path.join(local, 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe'),
      path.join(
        local, 'Microsoft', 'WinGet', 'Packages',
        'Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe', 'cloudflared.exe',
      ),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'cloudflared', 'cloudflared.exe'),
    )
  } else {
    candidates.push('/usr/local/bin/cloudflared', '/opt/homebrew/bin/cloudflared', '/usr/bin/cloudflared')
  }
  for (const candidate of candidates) if (existsSync(candidate)) return candidate
  // Не нашли по известным местам — пусть решает PATH: вдруг человек поставил
  // программу своим способом.
  return isWindows ? 'cloudflared.exe' : 'cloudflared'
}

function sitePort() {
  try {
    const runtime = JSON.parse(readFileSync(runtimeFile, 'utf8'))
    if (runtime?.port) return runtime.port
  } catch {
    // сервер ещё ни разу не поднимался
  }
  return 24680
}

function readState() {
  try {
    return JSON.parse(readFileSync(tunnelFile, 'utf8'))
  } catch {
    return null
  }
}

// 🔒 ЗАПИСЬ — ЗАПЛАТОЙ ПОВЕРХ ПРОЧИТАННОГО, А НЕ СНИМКОМ. В файле лежит история
// адреса (сколько раз менялся, каким был прежний), и снимок затирал бы её при
// каждой пробе. Писатель у файла один — этот процесс; второго заводить нельзя.
function patchState(patch) {
  try {
    mkdirSync(path.dirname(tunnelFile), { recursive: true })
    const current = readState() || {}
    writeFileSync(tunnelFile, JSON.stringify({ ...current, ...patch }, null, 2))
  } catch (error) {
    log(`состояние не записалось: ${error.message}`)
  }
}

let currentUrl = ''

function saveAddress(url) {
  const previous = readState()
  // Смена адреса — событие для человека, а не служебная мелочь: по прежней
  // ссылке кто-то уже мог прийти. Поэтому она считается и называется.
  const rotated = Boolean(previous?.url) && previous.url !== url
  patchState({
    url,
    port: sitePort(),
    startedAt: new Date().toISOString(),
    pid: process.pid,
    previousUrl: rotated ? previous.url : (previous?.previousUrl ?? null),
    rotatedAt: rotated ? new Date().toISOString() : (previous?.rotatedAt ?? null),
    rotations: rotated ? (Number(previous?.rotations) || 0) + 1 : (Number(previous?.rotations) || 0),
    // Новый туннель — чистый лист: прежний приговор к нему не относится.
    dead: false,
    deadSince: null,
    reason: null,
    lastCheckAt: null,
    lastOk: null,
  })
}

// ── ДОЗОРНЫЙ ────────────────────────────────────────────────────────────────

let failures = 0
let dead = false
let deadSince = null
let everOk = false
let checking = false
let nextCheckAt = 0

async function ask(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    return { ok: response.ok, status: response.status }
  } catch (error) {
    // 🔒 РОД ОТКАЗА РАЗЛИЧАЕТСЯ И ИДЁТ В ЖУРНАЛ. «Имя не резолвится» — это и
    // есть Error 1016, то есть туннеля больше нет; «таймаут» — связь есть, а
    // ответа нет. Разбирать потом будут по этой строке, и слово «ошибка» вместо
    // рода стоило бы часа чтения.
    if (error?.name === 'AbortError') return { ok: false, status: 'таймаут' }
    const text = String(error?.cause?.code || error?.code || error?.message || '')
    if (/ENOTFOUND|EAI_AGAIN/i.test(text)) return { ok: false, status: 'имя не резолвится' }
    return { ok: false, status: `соединения нет (${text || 'причина не названа'})` }
  } finally {
    clearTimeout(timer)
  }
}

async function internetAlive() {
  const { ok } = await ask(INTERNET_PROBE)
  return ok
}

function probeTarget() {
  if (PROBE_URL_OVERRIDE) return PROBE_URL_OVERRIDE
  return currentUrl ? `${currentUrl}/api/health` : ''
}

async function tick() {
  if (checking || Date.now() < nextCheckAt) return
  const target = probeTarget()
  // Адреса ещё нет — дозорному нечего сторожить, и это не отказ.
  if (!target) return

  checking = true
  try {
    const { ok, status } = await ask(target)

    if (ok) {
      patchState({ lastCheckAt: new Date().toISOString(), lastOk: true })
      if (dead) {
        dead = false
        deadSince = null
        patchState({ dead: false, deadSince: null, reason: null })
        log('туннель снова отвечает — приговор снят')
      } else if (failures > 0) {
        log(`туннель отвечает — счётчик неудач сброшен с ${failures}`)
      } else if (!everOk) {
        // 🔒 ОДНА СТРОКА ОБ УСПЕХЕ НУЖНА, А ВТОРАЯ УЖЕ НЕТ. Молчащий дозорный
        // неотличим от невключённого — ✗ ровно та слепота, которой оплачен этот
        // шаг. Но строка раз в минуту утопила бы журнал, в котором потом ищут
        // причину отказа.
        log(`дозорный: туннель отвечает, сайт виден из интернета по ${currentUrl}`)
      }
      everOk = true
      failures = 0
      return
    }

    patchState({ lastCheckAt: new Date().toISOString(), lastOk: false })

    // 🛑 НЕТ СВЯЗИ ≠ ТУННЕЛЬ МЁРТВ. Человек закрыл ноутбук, отключил Wi-Fi, сел
    // в поезд — и дозорный, не различающий этого, объявил бы смерть здоровому
    // туннелю. Счётчик неудач при этом НЕ растёт: иначе три минуты в метро дают
    // приговор.
    if (!(await internetAlive())) {
      log(`связи нет вовсе (проверял ${INTERNET_PROBE}) — туннель не сужу, счётчик неудач стоит на ${failures}`)
      return
    }

    failures += 1
    // Приговор уже вынесен — считать вслух дальше незачем: «неудача 7/3» в
    // журнале выглядит сломанным прибором, а не мёртвым туннелем.
    if (dead) {
      log(`туннель по-прежнему не отвечает (${status}), мёртв с ${deadSince}`)
    } else {
      log(`неудача ${failures}/${FAILURES_BEFORE_VERDICT}: ${target} → ${status}`)
    }

    if (failures >= FAILURES_BEFORE_VERDICT && !dead) {
      dead = true
      deadSince = new Date().toISOString()
      const reason = `не отвечает ${failures} раз подряд: ${status}`
      patchState({ dead: true, deadSince, reason })
      // 🔒 ГРОМКАЯ СТРОКА НАЗЫВАЕТ ЧЕЛОВЕКУ КОМАНДУ. Отказ без адреса — тупик;
      // с адресом — следующий шаг.
      log('🛑 АДРЕС В ИНТЕРНЕТЕ МЁРТВ. Связь на машине есть, сайт локально работает —')
      log(`🛑 перестал отвечать сам туннель (${reason}).`)
      log('🛑 Поднять новый адрес: npm run serve:publish. Сам я его не меняю — прежняя ссылка')
      log('🛑 всё равно не воскреснет, а менять её за спиной человека нельзя.')
    }
  } finally {
    checking = false
    // Следующая проба — через положенный срок. 🛑 Часы взводятся ЗДЕСЬ, а не в
    // тике: тик стучит чаще (раз в 15 с), чтобы быстрый признак смерти не ждал
    // минуту, — и без этой строки дозорный опрашивал бы туннель вчетверо чаще
    // обещанного, расходуя чужую сеть.
    nextCheckAt = Date.now() + INTERVAL_MS
  }
}

// ── ЗАПУСК ──────────────────────────────────────────────────────────────────

const port = sitePort()
const exe = findCloudflared()

log(`открываю туннель на http://localhost:${port} через ${exe}`)
log(
  `дозорный: опрос раз в ${INTERVAL_MS / 1000} с, терпение ${FAILURES_BEFORE_VERDICT} неудачи подряд, ` +
    `таймаут ${TIMEOUT_MS / 1000} с` +
    (PROBE_URL_OVERRIDE ? `, ПОРЧА ВХОДА: опрашиваю ${PROBE_URL_OVERRIDE}` : ''),
)

// 🛑 `--protocol http2` — НЕ ОПТИМИЗАЦИЯ, А УСЛОВИЕ РАБОТЫ В ОБЫЧНОЙ ДОМАШНЕЙ
// СЕТИ. По умолчанию cloudflared идёт через QUIC поверх UDP, а документация
// Cloudflare прямо предупреждает: «idle sessions can be more sensitive to
// network devices that aggressively time out UDP traffic… test with cloudflared
// set to protocol: http2». ✗ оплачено 2026-09-18 на машине владельца, сидевшей
// на раздаче с телефона: `ERR Connection terminated` → `no more connections
// active and exiting`, семь перезапусков за десять минут и семь новых адресов.
const args = ['tunnel', '--url', `http://localhost:${port}`, '--no-autoupdate', '--protocol', 'http2']

const child = spawn(exe, args, {
  cwd: root,
  // Оболочка не нужна: это .exe, а не .cmd.
  shell: false,
  // 🛑 БЕЗ ЭТОГО WINDOWS ОТКРЫВАЕТ ЧЁРНОЕ ОКНО КОНСОЛИ НА ПОЛЭКРАНА. В node
  // `windowsHide` по умолчанию **false**, и окно появляется при КАЖДОМ запуске
  // процесса — то есть при каждом обрыве связи и перезапуске. ✗ оплачено тем же
  // вечером: владелец написал «компьютер выглядит как кирпич у которого
  // сломанный экран». Прятать окно — не косметика: фоновая служба, мигающая
  // окнами поверх работы человека, непригодна к использованию.
  windowsHide: true,
})

let found = false

// Адрес приходит в поток вывода один раз, среди прочих строк, и другого способа
// его узнать у быстрого туннеля нет: он не сохраняется нигде на диске.
function scan(chunk) {
  const text = chunk.toString()
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
  if (match && !found) {
    found = true
    currentUrl = match[0]
    saveAddress(match[0])
    failures = 0
    dead = false
    // Первая проба — не сразу: туннель только что поднялся, и мгновенный опрос
    // застал бы его за установкой соединения.
    nextCheckAt = Date.now() + INTERVAL_MS / 2
    log(`САЙТ В ИНТЕРНЕТЕ: ${match[0]}`)
    log('адрес временный: перезапуск туннеля выдаст новый. Постоянный адрес — это свой домен.')
  }

  // 🔒 БЫСТРЫЙ ПРИЗНАК СМЕРТИ — НЕ ЗАМЕНА ИЗМЕРЕНИЮ, А ЕГО УСКОРЕНИЕ. Именно
  // этой строкой Cloudflare сообщает, что туннеля больше нет: `Unauthorized:
  // Tunnel not found`. Приговор всё равно выносит проба — признак лишь снимает
  // ожидание следующей минуты.
  if (/Tunnel not found/i.test(text)) nextCheckAt = 0

  // Ошибки cloudflared уходят в наш журнал целиком: разбирать их будем по нему.
  for (const line of text.split(/\r?\n/)) {
    if (/ERR|error|failed/i.test(line) && line.trim()) log(line.trim().slice(0, 200))
  }
}

child.stdout.on('data', scan)
child.stderr.on('data', scan)

child.on('error', (error) => {
  log(`не удалось запустить cloudflared: ${error.message}`)
  log('поставить: winget install Cloudflare.cloudflared (Windows) · brew install cloudflared (macOS)')
  process.exit(1)
})

// 🔒 Умер САМ ПРОЦЕСС — умираем и мы, с ненулевым кодом: тогда pm2 поднимет нас
// заново, и адрес обновится в `tunnel.json`. Процесс-обёртка, переживающий свой
// туннель, — это молчаливо неработающая публикация.
//
// 🛑 ДОЛГ, НАЗВАННЫЙ ВСЛУХ (237, 2026-09-19): это единственная ветка, где адрес
// всё-таки меняется САМ — вопреки решению владельца «не трогать». Сегодняшний
// отказ был не таким (процесс жил и выглядел здоровым), и трогать эту ветку
// внутри шага 237 я не стал: её цена — сайт, оставшийся вне интернета после
// случайного падения, до прихода человека. Решение за владельцем.
child.on('exit', (code, signal) => {
  log(`cloudflared завершился: код ${code}, сигнал ${signal ?? 'нет'}`)
  process.exit(code === 0 ? 1 : (code ?? 1))
})

// Тикаем чаще, чем опрашиваем: сам опрос стоит на часах `nextCheckAt`, а частый
// тик нужен, чтобы быстрый признак смерти не ждал минуту.
setInterval(() => {
  tick().catch((error) => log(`ошибка внутри пробы дозорного: ${error.message}`))
}, Math.min(INTERVAL_MS, 15000))

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill()
    process.exit(0)
  })
}
