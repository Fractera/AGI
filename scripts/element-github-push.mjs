// ОТПРАВИТЬ AGI ITEM В ЕГО РЕПОЗИТОРИЙ GITHUB ИЗ ТЕРМИНАЛА АГЕНТА (шаг 374-4). `node <узел>/scripts/element-github-push.mjs <id>`.
//
// Слово владельца 2026-10-02: отправка — «кнопке, Но нельзя запрещать делать коммит по требованию непосредственно в Claude Code
// Agent, отдельно стоит отметить работу через Telegram бот, коммит автоматически всегда» — «коммит и сразу отправка в GitHub».
// Агент элемента зовёт эту команду после задачи из Telegram (правило дописывает к его запуску комплект агента ядра) или по просьбе
// человека в терминале. Работу делает та же дверь, что кнопка «Отправить» (`/api/architect/items/<id>/github/push`, `commit: true`):
// незакоммиченный остаток закоммитит узел, ключ — свой элемента, иначе общий.
//
// 🔒 ЯДРО ЗОВЁТСЯ ПО ПЕТЛЕ МАШИНЫ, ПОРТ И ХОСТ — ИЗ `logs/runtime.json` (как `describe:publish`, 329): с машины хозяин — архитектор.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const id = process.argv[2]
if (!id || !/^[a-z][a-z0-9-]{0,39}$/.test(id)) {
  console.error('===GITHUB_PUSH_FAILED=== usage: node scripts/element-github-push.mjs <element id>')
  process.exit(1)
}
let core = null
try {
  const rt = JSON.parse(readFileSync(join(root, 'logs', 'runtime.json'), 'utf8'))
  if (Number.isInteger(rt.port)) core = `http://${typeof rt.hostname === 'string' && rt.hostname ? rt.hostname : 'localhost'}:${rt.port}`
} catch { /* узел не сказал порт */ }
if (!core) {
  console.error('===GITHUB_PUSH_FAILED=== the node did not tell its port (logs/runtime.json) — is the node running?')
  process.exit(1)
}
const WORDS = {
  'not-connected': 'this AGI ITEM has no GitHub repository or key yet — the person adds the key on the GitHub page of the node',
  'no-write': 'the key cannot write to the repository',
  'needs-workflow': 'the key lacks the workflow right (this item carries .github/workflows)',
  rejected: 'the repository has other history — ask the person',
  'auth-failed': 'GitHub refused the key',
  'commit-failed': 'the commit failed',
  'temporary-address': 'the core refused a request through its temporary public address',
}
try {
  const r = await fetch(`${core}/api/architect/items/${id}/github/push`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ commit: true }),
    signal: AbortSignal.timeout(180_000),
  })
  const d = await r.json().catch(() => null)
  if (d?.ok) {
    console.log(`===GITHUB_PUSH_OK=== ${d.repo ?? ''} ${d.lastCommit ?? ''}`)
  } else {
    const code = d?.error ?? String(r.status)
    console.error(`===GITHUB_PUSH_FAILED=== ${code}: ${WORDS[code] ?? 'see the GitHub page of the node'}`)
    process.exit(1)
  }
} catch (e) {
  console.error(`===GITHUB_PUSH_FAILED=== the core did not answer at ${core}: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
}
