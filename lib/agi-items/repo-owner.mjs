// РЕПОЗИТОРИЙ ЭЛЕМЕНТА — ТОЛЬКО ВАШ (узел, шаг 367-5). Зовут дверь рождения (отказ сразу в окне) и `scripts/item-birth.mjs` (защита и
// при запуске из командной строки). `.mjs` — читают и сервер Next, и голый node.
//
// Слово владельца 2026-10-01: «запретить его запуск до тех пор пока человек не сделает Fork, то есть проверить является ли этот твоим
// собственным репозиторием … куда мы будем сохранять обновления если пользуется захочет в итоге экспортировать этот проект?»;
// принятое устройство: «сравнивай её просто с тем … репозиторием» — аккаунт узла (его форк fractera/agi, `logs/origin.json`, шаг 368)
// должен совпасть с владельцем репозитория элемента. Двойной форк в одном аккаунте невозможен (проверено владельцем), поэтому
// «чужой репозиторий» = другой владелец. Только GitHub: владельца другого хостинга сравнить не с чем.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** `{ owner, name }` из https-адреса GitHub, в исходном регистре; иначе null. */
export function githubRepo(url) {
  const m = String(url ?? '').trim().match(/^https:\/\/github\.com\/([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?$/i)
  return m ? { owner: m[1], name: m[2] } : null
}

/** Аккаунт GitHub, из форка которого стоит узел (`logs/origin.json`, шаг 368); null — проверки подлинности ещё не было. */
export function nodeOwner(root = process.cwd()) {
  try {
    const slug = JSON.parse(readFileSync(join(root, 'logs', 'origin.json'), 'utf8')).slug
    return typeof slug === 'string' && slug.includes('/') ? slug.split('/')[0] : null
  } catch { return null }
}

/** Можно ли родить элемент из этого репозитория: `{ ok: true, owner, name }` или `{ ok: false, reason, message }`. */
export function checkRepoOwner(url, root = process.cwd()) {
  const repo = githubRepo(url)
  if (!repo) return { ok: false, reason: 'not-github', message: 'Пока поддерживается только GitHub: https://github.com/владелец/имя.' }
  const mine = nodeOwner(root)
  if (!mine) return { ok: false, reason: 'no-node-owner', message: 'Узел ещё не знает свой аккаунт GitHub (нет logs/origin.json) — пересоберите узел (npm run build), затем повторите.' }
  if (repo.owner.toLowerCase() !== mine.toLowerCase()) {
    return {
      ok: false,
      reason: 'not-your-repo',
      message: `Это не ваш репозиторий: его владелец ${repo.owner}, а узел стоит на аккаунте ${mine}. Сделайте Fork в аккаунт ${mine} — https://github.com/${repo.owner}/${repo.name}/fork — и вставьте адрес вашей копии.`,
    }
  }
  return { ok: true, owner: repo.owner, name: repo.name }
}
