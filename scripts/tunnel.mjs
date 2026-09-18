// САЙТ В ИНТЕРНЕТЕ — БЫСТРЫЙ ТУННЕЛЬ CLOUDFLARE.
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

function saveAddress(url) {
  try {
    mkdirSync(path.dirname(tunnelFile), { recursive: true })
    writeFileSync(
      tunnelFile,
      JSON.stringify({ url, port: sitePort(), startedAt: new Date().toISOString(), pid: process.pid }, null, 2),
    )
  } catch (error) {
    log(`адрес получен, но записать его не удалось: ${error.message}`)
  }
}

const port = sitePort()
const exe = findCloudflared()

log(`открываю туннель на http://localhost:${port} через ${exe}`)

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
    saveAddress(match[0])
    log(`САЙТ В ИНТЕРНЕТЕ: ${match[0]}`)
    log('адрес временный: перезапуск туннеля выдаст новый. Постоянный адрес — это свой домен.')
  }
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

// 🔒 Умер туннель — умираем и мы, с ненулевым кодом. Тогда pm2 поднимет нас
// заново, и адрес обновится в `tunnel.json`. Процесс-обёртка, переживающий свой
// туннель, — это молчаливо неработающая публикация.
child.on('exit', (code, signal) => {
  log(`cloudflared завершился: код ${code}, сигнал ${signal ?? 'нет'}`)
  process.exit(code === 0 ? 1 : (code ?? 1))
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill()
    process.exit(0)
  })
}
