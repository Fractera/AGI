// СТОРОЖ: СТАРЫЕ НАСТРОЙКИ МАРШРУТА ЗАПРЕЩЕНЫ — КЭШ ТОЛЬКО ЧЕРЕЗ CACHE COMPONENTS (шаг 295).
//
//   node scripts/check-segment-config.mjs [папка проекта]      (по умолчанию — текущая)
//
// Первоисточник (docs Next 16.2.0, route-segment-config): «`dynamic`, `dynamicParams`, `revalidate`, and `fetchCache`
// removed when Cache Components is enabled». Слово владельца 2026-09-24: «i need similar 100% and using best next16
// atributes». Кэш описывается `'use cache'` + `cacheLife` (+ `cacheTag`) — в макете или помощнике данных, один раз.
// Сторож находит любую из четырёх строк (и `runtime`) в `app/**` и отказывает: вернуть старую модель молча нельзя.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.argv[2] ? process.argv[2] : process.cwd()
const APP = join(ROOT, 'app')
const BANNED = /^\s*export\s+const\s+(dynamic|dynamicParams|revalidate|fetchCache|runtime)\s*=/m
const hits = []
const walk = (d) => {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n.startsWith('.next')) continue
    const p = join(d, n)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|jsx?|mjs)$/.test(n)) {
      const m = readFileSync(p, 'utf8').match(BANNED)
      if (m) hits.push(`${relative(ROOT, p)} — export const ${m[1]}`)
    }
  }
}
walk(APP)
if (hits.length) {
  for (const h of hits) console.log(`  ✗ ${h}`)
  console.log(`  Кэш — 'use cache' + cacheLife (Cache Components, Next 16). Найдено: ${hits.length}`)
  console.log('===SEGMENT_CONFIG_FAILED===')
  process.exit(1)
}
console.log('===SEGMENT_CONFIG_OK===')
