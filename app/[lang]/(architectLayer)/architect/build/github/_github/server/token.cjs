// КЛЮЧ GITHUB ЭТОГО УЗЛА (273).
//
// 🔒 ХРАНИТСЯ КАК ТОКЕН БОТА: в данных узла (`data/node/github/.env`), правами только владельцу, вне git.
// Наружу не возвращается никогда — только четыре последних знака, по ним человек узнаёт свой ключ.
// 🛑 ФОРМА ЕЩЁ НЕ ЗНАЧИТ «РАБОЧИЙ»: сохранение проверяет ключ у самого GitHub (см. `github.cjs`), иначе на
// странице стояло бы уверенное «ключ сохранён» у ключа, которым нельзя ничего.

const { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'data', 'node', 'github')
const FILE = path.join(DIR, '.env')
const KEY = 'GITHUB_TOKEN='

// Тонкий ключ GitHub начинается с `github_pat_`, классический — с `ghp_`; оба длинные и без пробелов.
const SHAPE = /^(github_pat_[A-Za-z0-9_]{20,}|ghp_[A-Za-z0-9]{30,})$/

function storedToken() {
  try {
    const line = readFileSync(FILE, 'utf8').split(/\r?\n/).find((l) => l.startsWith(KEY))
    return line ? line.slice(KEY.length).trim() : ''
  } catch {
    return ''
  }
}

function saveToken(raw) {
  const token = String(raw ?? '').trim()
  if (!token) return { ok: false, error: 'empty-token' }
  if (!SHAPE.test(token)) return { ok: false, error: 'bad-format' }
  mkdirSync(DIR, { recursive: true })
  writeFileSync(FILE, `${KEY}${token}\n`, { mode: 0o600 })
  try { chmodSync(FILE, 0o600) } catch { /* Windows: права даёт ACL папки пользователя */ }
  return { ok: true, tail: token.slice(-4) }
}

function forgetToken() {
  rmSync(FILE, { force: true })
  return { ok: true }
}

function tokenState() {
  const token = storedToken()
  return { configured: Boolean(token), tail: token ? token.slice(-4) : null, file: existsSync(FILE) ? FILE : null }
}

module.exports = { storedToken, saveToken, forgetToken, tokenState, SHAPE }
