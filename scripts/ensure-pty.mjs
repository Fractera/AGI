// ПРАВО НА ЗАПУСК У spawn-helper МОДУЛЯ ТЕРМИНАЛА (шаг 372). Запуск: `postinstall` и в `serve:start` перед запуском узла.
//
// ✗ ИЗМЕРЕНО НА MAC ВЛАДЕЛЬЦА 2026-10-02 (macOS 12.7.6, Intel x86_64, Node 22.19): кнопка «Start agent» мигала и гасла.
// `logs/agi-err.log`: `[pty] отказ: spawn-failed`; прямой тест `node-pty.spawn` → `Error: posix_spawnp failed`. Причина —
// `node_modules/node-pty/prebuilds/darwin-*/spawn-helper` лежит с правами `-rw-r--r--`: npm распаковал готовую сборку без бита
// запуска, и macOS отказывается её запускать. На Windows этого файла нет — у меня терминал работал, у владельца нет.
//
// 🔒 Лечение — выставить бит запуска всем `spawn-helper` модуля (macOS и Linux). Есть право — ничего не меняется. Нет модуля —
// молча: узел работает, терминал откажет сам и скажет почему. Маркер `===PTY_HELPER_OK===` с числом исправленных файлов.

import { chmodSync, existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.platform === 'win32') process.exit(0)

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = path.join(root, 'node_modules', 'node-pty')
const candidates = [path.join(base, 'build', 'Release', 'spawn-helper')]
try {
  for (const dir of readdirSync(path.join(base, 'prebuilds'))) candidates.push(path.join(base, 'prebuilds', dir, 'spawn-helper'))
} catch { /* готовых сборок нет — модуль собран на месте */ }

let fixed = 0
for (const file of candidates) {
  if (!existsSync(file)) continue
  const mode = statSync(file).mode
  if ((mode & 0o111) === 0o111) continue
  try {
    chmodSync(file, mode | 0o755)
    fixed++
  } catch (error) {
    console.error(`===PTY_HELPER_FAILED=== ${file}: ${error.message}`)
  }
}
console.log(`===PTY_HELPER_OK=== исправлено файлов: ${fixed}`)
