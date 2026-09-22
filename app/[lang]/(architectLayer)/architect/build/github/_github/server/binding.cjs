// С КАКИМ РЕПОЗИТОРИЕМ РАБОТАЕТ ЭТОТ УЗЕЛ (273).
//
// 🎯 Слово владельца 2026-09-22: «эта вкладка должна отображать то, с каким репозиторием работает проект»,
// потому что случаев несколько: человек запустился из своего клона · запустился ИЗ НАШЕГО репозитория,
// забыв сделать свой · получил проект на выделенном VPS, где репозитория нет вообще.
//
// 🔒 ПРИВЯЗКА ИЗМЕРЯЕТСЯ У САМОГО GIT, А НЕ ХРАНИТСЯ У НАС. Запомненное значение врёт ровно в тот день,
// когда человек сменил `origin` или переименовал репозиторий на GitHub (закон узла: файл говорит, «как
// задумано», а сеть и диск — «как есть»).
// 🛑 ОТСУТСТВИЕ РЕПОЗИТОРИЯ — ЗАКОННОЕ СОСТОЯНИЕ, А НЕ ПОЛОМКА: так выглядит установка на выделенный
// сервер. Страница обязана сказать это словами, а не показать пустоту.

const { spawnSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const path = require('node:path')

const ROOT = process.cwd()
// Наш собственный владелец: узел, запущенный из ЭТОГО репозитория, писать в него не сможет.
const UPSTREAM_OWNER = 'Fractera'

function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 10_000, windowsHide: true })
  return r.status === 0 ? String(r.stdout ?? '').trim() : ''
}

/**
 * Владелец и имя из адреса репозитория: `https://github.com/<owner>/<repo>.git`, `git@github.com:…`,
 * `ssh://git@github.com/…`. Чужой хост (GitLab, свой сервер) — не ошибка: имя разберём, а GitHub о нём
 * ничего не скажет, и страница назовёт это отдельно.
 */
function parseRemote(url) {
  const m = String(url).match(/^(?:https?:\/\/|ssh:\/\/git@|git@)([^/:]+)[/:]([^/]+)\/(.+?)(?:\.git)?$/)
  if (!m) return null
  return { host: m[1], owner: m[2], repo: m[3], isGithub: /(^|\.)github\.com$/i.test(m[1]) }
}

/**
 * @returns {{ state: 'no-git'|'no-remote'|'upstream'|'foreign-host'|'own', url: string|null,
 *   owner: string|null, repo: string|null, branch: string|null, commit: string|null, subject: string|null }}
 */
function binding() {
  if (!existsSync(path.join(ROOT, '.git'))) {
    return { state: 'no-git', url: null, owner: null, repo: null, branch: null, commit: null, subject: null }
  }
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']) || null
  const commit = git(['rev-parse', '--short', 'HEAD']) || null
  const subject = git(['log', '-1', '--format=%s']) || null
  const url = git(['remote', 'get-url', 'origin'])
  if (!url) return { state: 'no-remote', url: null, owner: null, repo: null, branch, commit, subject }
  const parsed = parseRemote(url)
  if (!parsed) return { state: 'no-remote', url, owner: null, repo: null, branch, commit, subject }
  const state = !parsed.isGithub
    ? 'foreign-host'
    : parsed.owner.toLowerCase() === UPSTREAM_OWNER.toLowerCase()
      ? 'upstream'
      : 'own'
  return { state, url, owner: parsed.owner, repo: parsed.repo, branch, commit, subject }
}

module.exports = { binding, parseRemote, UPSTREAM_OWNER }
