// ЗАПУСК ВНЕ ДЕРЕВА ПРОЦЕССОВ ЯДРА (узел, шаг 337-1): `node scripts/spawn-free.mjs <скрипт> [аргументы…]`.
//
// 🛑 `detached` НЕ СПАСАЕТ ОТ pm2. Перезапуская ядро, pm2 убивает дерево по родителям (Windows — `taskkill /T`, Linux —
// группа и потомки); отсоединённый ребёнок ядра всё равно его потомок. ✗ 2026-09-29: пересборка ядра убила развёртывание
// mzjce через 51 с после старта. Лечение — двойной запуск: этот процесс порождает скрипт отсоединённым и сразу выходит, у
// скрипта не остаётся живого родителя, и дерево ядра до него больше не доходит (тот же приём, что `nohup … & exit`).

import { spawn } from 'node:child_process'

const [script, ...args] = process.argv.slice(2)
if (!script) process.exit(2)
const child = spawn(process.execPath, [script, ...args], { detached: true, windowsHide: true, stdio: 'ignore', cwd: process.cwd() })
child.unref()
process.exit(0)
