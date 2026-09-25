// ПАПКА СБОРКИ ЯДРА — ОДНО МЕСТО, ГДЕ ОНА ОПРЕДЕЛЯЕТСЯ (2026-09-25).
//
// ✗ Оплачено: `serve:rebuild` собирал прямо в `.next`, который читает живой сервер. `next build` стирает папку
// В НАЧАЛЕ, поэтому упавшая сборка оставляла ядро без сборки вовсе — 2026-09-25 08:22 сайт ядра не отвечал 20 минут,
// хотя сообщение обещало «сайт продолжает работать на прежней сборке».
//
// 🔒 ЯДРО СОБИРАЕТСЯ В ЗАПАСНУЮ ПАПКУ (`.next-a` ↔ `.next-b`), живой сервер переключается на неё ТОЛЬКО после успешной
// сборки и проверок. Та же схема, что у элементов в `services-install.mjs`. Какая папка живая — пишет `logs/core-dist.txt`;
// её читают `next.config.ts` (на старте сервера), `serve.mjs rebuild` и `check-seo-html.mjs`.
// Переменная `NEXT_DIST_DIR` сильнее файла: ею сборка говорит, КУДА собирать.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const CORE_DIST_FILE = join(ROOT, 'logs', 'core-dist.txt')
const SLOTS = ['.next-a', '.next-b']

/** Папка, из которой сейчас работает сервер ядра. Файла нет — прежняя `.next`. */
export function liveDist() {
  try {
    const d = readFileSync(CORE_DIST_FILE, 'utf8').trim()
    if (d.startsWith('.next')) return d
  } catch { /* узел до этой правки */ }
  return '.next'
}

/** Куда собирать: папка, которая сейчас НЕ живая. */
export function nextSlot() {
  return liveDist() === SLOTS[0] ? SLOTS[1] : SLOTS[0]
}

/** Сделать папку живой — зовётся ТОЛЬКО после успешной сборки и проверок. */
export function setLiveDist(dist) {
  mkdirSync(dirname(CORE_DIST_FILE), { recursive: true })
  writeFileSync(CORE_DIST_FILE, dist + '\n', 'utf8')
}

/** Папка, которую читает проверка: явная переменная, иначе живая. */
export function currentDist() {
  return process.env.NEXT_DIST_DIR || liveDist()
}
