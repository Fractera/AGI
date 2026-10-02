// ЕСТЬ ЛИ НА МАШИНЕ cloudflared — И ЕСЛИ НЕТ, СКАЧАТЬ ОФИЦИАЛЬНЫЙ ФАЙЛ (шаг 371-8). Запуск: `preinstall` и перед публикацией.
//
// ✗ НАЙДЕНО НА MAC 2026-10-02: узел cloudflared не ставил ни на одной системе — `tunnel.mjs` только искал его и писал в журнал
// «brew install cloudflared». Первый запуск, который по решению владельца сам выходит в интернет (371-1), на чистой машине
// молча оставался без адреса. Агент поставил его через Homebrew — и девять минут без прогресса на старом Mac (Homebrew без
// готовой сборки собирает из исходников). Владелец: «Я хочу пройти быстрый путь так его в идеальном сцена будут проходить люди».
//
// 🔒 ИСТОЧНИК — СТРАНИЦА ЗАГРУЗОК CLOUDFLARE (developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/
// downloads): готовые файлы на `https://github.com/cloudflare/cloudflared/releases/latest/download/` — macOS
// `cloudflared-darwin-arm64.tgz` / `-amd64.tgz`, Windows `.exe`, Linux бинарник. Один файл, без Homebrew и winget, без
// «скачай-и-выполни» через PowerShell (Defender, 371-2): node сам скачивает и кладёт в `~/.local/bin`.
//
// 🛑 НЕ ВАЛИТ УСТАНОВКУ: не вышло — `===CLOUDFLARED_FAILED===` с причиной; узел работает локально, без адреса в интернете.

import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync, copyFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { findCloudflaredFile, ownPath } = require('../lib/cloudflared-bin.cjs')

const BASE = 'https://github.com/cloudflare/cloudflared/releases/latest/download/'
const arch = process.arch === 'arm64' ? 'arm64' : process.arch === 'x64' ? 'amd64' : null
const asset =
  process.platform === 'darwin' && arch ? `cloudflared-darwin-${arch}.tgz`
  : process.platform === 'win32' && arch === 'amd64' ? 'cloudflared-windows-amd64.exe'
  : process.platform === 'linux' && arch ? `cloudflared-linux-${arch}`
  : null

function version(file) {
  const r = spawnSync(file, ['--version'], { encoding: 'utf8', timeout: 30_000, windowsHide: true })
  return r.status === 0 ? String(r.stdout || r.stderr).trim().split('\n')[0] : null
}

function fail(reason) {
  console.error(`===CLOUDFLARED_FAILED=== ${reason}`)
  console.error('Узел работает на этом компьютере, но без адреса в интернете. Программа Cloudflare: ' +
    'https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/')
  process.exit(0)
}

const found = findCloudflaredFile()
if (found) {
  console.log(`===CLOUDFLARED_PRESENT=== ${found} ${version(found) ?? ''}`.trim())
  process.exit(0)
}
if (!asset) fail(`нет готового файла Cloudflare для ${process.platform}/${process.arch}`)

console.log(`cloudflared не найден — скачиваю официальный файл Cloudflare (${asset})…`)
const target = ownPath()
const tmp = mkdtempSync(path.join(os.tmpdir(), 'cloudflared-'))
try {
  const res = await fetch(BASE + asset, { redirect: 'follow', signal: AbortSignal.timeout(300_000) })
  if (!res.ok) fail(`загрузка ${asset}: HTTP ${res.status}`)
  const downloaded = path.join(tmp, asset)
  writeFileSync(downloaded, Buffer.from(await res.arrayBuffer()))
  let file = downloaded
  if (asset.endsWith('.tgz')) {
    // `tar` есть в macOS из коробки; в архиве один файл `cloudflared`.
    const t = spawnSync('tar', ['-xzf', downloaded, '-C', tmp], { encoding: 'utf8' })
    if (t.status !== 0) fail(`распаковка: ${t.stderr || t.status}`)
    file = path.join(tmp, 'cloudflared')
  }
  mkdirSync(path.dirname(target), { recursive: true })
  try { renameSync(file, target) } catch { copyFileSync(file, target) }
  if (process.platform !== 'win32') chmodSync(target, 0o755)
} catch (error) {
  fail(String(error?.message ?? error))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

const v = version(target)
if (!v) fail(`файл скачан (${target}), но не запускается на этой системе`)
console.log(`===CLOUDFLARED_INSTALLED=== ${target} ${v}`)
