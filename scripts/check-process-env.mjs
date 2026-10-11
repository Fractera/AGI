// СТОРОЖ: НИ ОДИН ЖИВОЙ ЭЛЕМЕНТ НЕ НЕСЁТ ОКРУЖЕНИЕ ЯДРА (446-1).
//
// ✗ 2026-10-11: gyr1i, рождённый дверью ядра, получил `__NEXT_PROCESSED_ENV=true` сервера Next ядра. Next элемента, увидев метку,
// не читал свой `.env.local` → не знал домена узла → «Войти» вела на несуществующие `auth.lagrix.dev` и
// `auth.gyr1i.throughsongs.com`. Снаружи сайт был жив, ломалось только то, что читает `.env.local` на сервере. pm2 хранит окружение
// первого запуска, поэтому метка переживает перезапуски — видна она только в `pm2 jlist`.
//
// Запуск: `npm run check:process-env`. Проверка самого сторожа: `--from <файл с выводом pm2 jlist>`.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const IS_WIN = process.platform === 'win32'
const fromAt = process.argv.indexOf('--from')
let list
if (fromAt > 0) {
  list = JSON.parse(readFileSync(process.argv[fromAt + 1], 'utf8'))
} else {
  const r = spawnSync(IS_WIN ? 'pm2.cmd' : 'pm2', ['jlist'], { encoding: 'utf8', shell: IS_WIN, windowsHide: true, maxBuffer: 64 * 1024 * 1024 })
  if (r.status !== 0) {
    console.error('pm2 jlist не ответил — проверить нечем')
    process.exit(2)
  }
  list = JSON.parse(r.stdout)
}

const bad = []
for (const p of list) {
  if (!/^fractera-svc-/.test(p.name) || /-watch$/.test(p.name)) continue
  const e = p.pm2_env ?? {}
  const env = { ...e, ...(e.env ?? {}) }
  if (env.__NEXT_PROCESSED_ENV !== undefined) bad.push(p.name)
}

if (bad.length) {
  console.error(`процессы с окружением ядра (__NEXT_PROCESSED_ENV): ${bad.join(', ')}`)
  console.error('лечение: pm2 delete <имя> && pm2 start ecosystem.config.cjs --only <имя> (из чистой оболочки) && pm2 save')
  process.exit(1)
}
console.log('===PROCESS_ENV_OK=== ни один элемент не несёт окружение ядра')
