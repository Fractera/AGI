// ГДЕ ЛЕЖИТ cloudflared — ОДНО ЗНАНИЕ ДЛЯ ВСЕХ (шаг 371-8). Читают: `scripts/tunnel.mjs` (быстрый туннель),
// `scripts/domain-tunnel.mjs` (свой домен), `scripts/ensure-cloudflared.mjs` (установка).
//
// 🔒 ОДНА КОПИЯ. До 371-8 их было две, и они уже разошлись: в `domain-tunnel.mjs` путь `'C:\Program Files'` был записан с
// одной косой чертой — в строке JS это `C:Program Files`, то есть кандидат, которого не бывает.
//
// 🔒 СВОЯ ПАПКА — ПЕРВОЙ: `~/.local/bin` (туда же ставится Claude Code CLI, 371-2). Узел кладёт туда официальный файл
// Cloudflare сам (`ensure-cloudflared.mjs`), без Homebrew и winget. Остальные места — чтобы найти программу, поставленную
// человеком своим способом.
//
// 🔒 ПУТЬ ИЩЕТСЯ, А НЕ ПРЕДПОЛАГАЕТСЯ: pm2 запускает процессы с PATH своего демона в момент старта, и программа, поставленная
// позже, по короткому имени не находится.

const { existsSync } = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const isWindows = process.platform === 'win32'
const FILE = isWindows ? 'cloudflared.exe' : 'cloudflared'

/** Куда узел ставит cloudflared сам. */
function ownPath() {
  return path.join(os.homedir(), '.local', 'bin', FILE)
}

function candidates() {
  const list = [ownPath()]
  if (isWindows) {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
    list.push(
      path.join(local, 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe'),
      path.join(local, 'Microsoft', 'WinGet', 'Packages', 'Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe', 'cloudflared.exe'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'cloudflared', 'cloudflared.exe'),
    )
  } else {
    list.push('/usr/local/bin/cloudflared', '/opt/homebrew/bin/cloudflared', '/usr/bin/cloudflared')
  }
  return list
}

/** Полный путь к найденной программе или `null`. */
function findCloudflaredFile() {
  for (const c of candidates()) if (existsSync(c)) return c
  return null
}

/** Что запускать: найденный файл, иначе короткое имя — пусть решает PATH (человек мог поставить своим способом). */
function findCloudflared() {
  return findCloudflaredFile() ?? FILE
}

module.exports = { findCloudflared, findCloudflaredFile, ownPath }
