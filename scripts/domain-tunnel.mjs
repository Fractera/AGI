// ИМЕНОВАННЫЙ ТУННЕЛЬ: постоянный адрес человека живёт, пока жив этот житель (259-4).
//
// 🔒 ЧЕМ ОН ОТЛИЧАЕТСЯ ОТ `tunnel.mjs`, И ЭТО НЕ КОПИЯ. Быстрый туннель получает
// СЛУЧАЙНОЕ имя от Cloudflare при каждом запуске и теряет его при перезапуске;
// поэтому там половина кода — про смену адреса. Здесь имя ПОСТОЯННО: оно
// принадлежит человеку, лежит в его зоне и переживает всё. Значит и поведение
// другое: перезапуск ничего не меняет, а молчание адреса означает настоящую беду.
//
// 🛑 СТОРОЖ СПРАШИВАЕТ СПОСОБНОСТЬ, А НЕ ПРОЦЕСС. Закон оплачен 2026-09-19 тремя
// часами простоя: Cloudflare удалила туннель со своей стороны, а `cloudflared` не
// упал — он вечно перерегистрировался с мёртвым идентификатором, и pm2 писал
// `online` с нулём перезапусков. Поэтому здоровье меряется запросом ПО ИМЕНИ
// ЧЕЛОВЕКА через интернет.
//
// 🔒 САМОЛЕЧЕНИЕ ЗДЕСЬ РАЗРЕШЕНО — В ОТЛИЧИЕ ОТ БЫСТРОГО ТУННЕЛЯ. Запрет владельца
// 2026-09-19 («не трогать, только честно сообщать») защищал РОЗДАННУЮ ССЫЛКУ:
// перезапуск быстрого туннеля менял адрес, и ссылка умирала молча. У именованного
// туннеля адрес не меняется никогда, значит защищать нечего, а молчащий сайт
// лечится перезапуском. Отказ при этом всё равно записывается и называется вслух.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const isWindows = process.platform === 'win32'
const stateFile = path.join(root, 'logs', 'domain-tunnel.json')
const domainFile = path.join(root, 'logs', 'domain.json')
const envFile = path.join(root, '.env.local')

const INTERVAL = Number(process.env.FRACTERA_DOMAIN_INTERVAL_MS || 60000)
const FAILURES = Number(process.env.FRACTERA_DOMAIN_FAILURES || 3)
const TIMEOUT = Number(process.env.FRACTERA_DOMAIN_TIMEOUT_MS || 15000)

const log = (m) => console.log(`[domain] ${m}`)

function envValue(name) {
  const fromProcess = process.env[name]?.trim()
  if (fromProcess) return fromProcess
  if (!existsSync(envFile)) return null
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && m[1] === name && m[2].trim()) return m[2].trim()
  }
  return null
}

// 🔒 Тот же поиск, что у быстрого туннеля: pm2 держит PATH, который был у демона
// в момент его старта, и программа, поставленная позже, из него не видна.
function findCloudflared() {
  const candidates = []
  if (isWindows) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    candidates.push(
      path.join(local, 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe'),
      path.join(local, 'Microsoft', 'WinGet', 'Packages',
        'Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe', 'cloudflared.exe'),
      path.join(process.env.ProgramFiles || 'C:\Program Files', 'cloudflared', 'cloudflared.exe'),
    )
  } else {
    candidates.push('/usr/local/bin/cloudflared', '/opt/homebrew/bin/cloudflared', '/usr/bin/cloudflared')
  }
  for (const c of candidates) if (existsSync(c)) return c
  return isWindows ? 'cloudflared.exe' : 'cloudflared'
}

function saveState(patch) {
  mkdirSync(path.join(root, 'logs'), { recursive: true })
  let prev = {}
  try { prev = JSON.parse(readFileSync(stateFile, 'utf8')) } catch { /* первого запуска ещё не было */ }
  writeFileSync(stateFile, `${JSON.stringify({ ...prev, ...patch }, null, 2)}\n`, 'utf8')
}

function hostname() {
  try { return JSON.parse(readFileSync(domainFile, 'utf8')).hostname || null } catch { return null }
}

const token = envValue('CLOUDFLARE_TUNNEL_TOKEN')
const host = hostname()

// 🛑 НЕЧЕГО ПОДНИМАТЬ — ЭТО НЕ ОШИБКА, А ЗАКОННОЕ СОСТОЯНИЕ. Домен ещё не
// подключали. Житель обязан спокойно уснуть, а не падать в вечный цикл
// перезапусков: упавший процесс в pm2 выглядит поломкой продукта.
if (!token || !host) {
  log('домен не подключён — засыпаю. Подключение: вкладка «Активация домена».')
  saveState({ running: false, reason: 'not-configured', checkedAt: new Date().toISOString() })
  setInterval(() => {}, 1 << 30)
} else {
  const bin = findCloudflared()
  log(`поднимаю туннель для ${host} через ${bin}`)

  const child = spawn(bin, ['tunnel', '--no-autoupdate', '--protocol', 'http2', 'run', '--token', token], {
    cwd: root,
    // 🛑 ОКНО КОНСОЛИ НЕ ОТКРЫВАЕТСЯ. В node этот параметр по умолчанию false, и
    // Windows рисует чёрное окно поверх работы человека при каждом запуске.
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.on('data', (d) => process.stdout.write(d))
  child.stderr.on('data', (d) => process.stderr.write(d))
  child.on('exit', (code) => {
    log(`cloudflared завершился с кодом ${code} — pm2 поднимет жителя заново`)
    saveState({ running: false, reason: `exit:${code}`, checkedAt: new Date().toISOString() })
    process.exit(code ?? 1)
  })

  saveState({ running: true, hostname: host, startedAt: new Date().toISOString(), reason: null })

  let failures = 0
  const check = async () => {
    let ok = false
    let detail = ''
    try {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), TIMEOUT)
      const res = await fetch(`https://${host}/api/health`, { signal: ac.signal, cache: 'no-store' })
      clearTimeout(timer)
      ok = res.ok
      detail = `http:${res.status}`
    } catch (e) {
      detail = `network:${e instanceof Error ? e.message : 'unknown'}`
    }

    if (ok) {
      if (failures > 0) log(`адрес ${host} снова отвечает`)
      failures = 0
      saveState({ alive: true, checkedAt: new Date().toISOString(), lastDetail: detail })
      return
    }

    failures += 1
    saveState({ alive: false, failures, checkedAt: new Date().toISOString(), lastDetail: detail })
    log(`адрес ${host} не отвечает (${detail}), неудача ${failures} из ${FAILURES}`)
    if (failures >= FAILURES) {
      // 🔒 ТЕРПЕЛИВЫЙ, А НЕ ЧУТКИЙ: три неудачи подряд, а не первая. Сеть человека
      // моргает, и сторож, дёргающий туннель на первом же промахе, превращает
      // короткий сбой в вечный цикл.
      log('поднимаю туннель заново')
      failures = 0
      child.kill()
    }
  }

  setTimeout(() => { check(); setInterval(check, INTERVAL) }, INTERVAL)
}
