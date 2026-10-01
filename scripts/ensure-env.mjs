// ФАЙЛ ОКРУЖЕНИЯ УЗЛА НА ЧИСТОМ КЛОНЕ (шаг 369). Запуск: `preinstall`, в `prebuild` до проверки подлинности, в `serve:start`.
//
// ✗ Долг линии установки с шага 258: `.env.local` читают скрипты сборки, а не пишет ни один — чистый клон без него не собирался
// (список языков пуст, сторож контента падал). Агент облачной установки 2026-10-01 скопировал его вручную «как сказано в заметках».
// Агент человека этого знать не обязан: нет `.env.local` — он создаётся из `.env.local.example`. Существующий файл не трогается
// никогда. Порядок важен: `check-origin.mjs` дописывает в `.env.local` адрес форка и без этого шага создал бы файл из одной строки.

import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = join(root, '.env.local')
const example = join(root, '.env.local.example')
if (!existsSync(env) && existsSync(example)) {
  copyFileSync(example, env)
  console.log('===ENV_CREATED=== .env.local создан из .env.local.example')
}
