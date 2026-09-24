// ПРИБОР: КАКИЕ МАРШРУТЫ СБОРКИ СТАТИЧЕСКИЕ, А КАКИЕ ДИНАМИЧЕСКИЕ (шаг 295-0).
//
//   node scripts/route-kinds-snapshot.mjs <папка сборки> <файл снимка>
//   node scripts/route-kinds-snapshot.mjs --diff <снимок ДО> <снимок ПОСЛЕ> [--allow /api/a,/api/b]
//
// 🛑 ДВЕРЬ, СТАВШАЯ СТАТИЧЕСКОЙ, — ТОЖЕ ОТКАЗ (295-1, измерено на входе): с Cache Components обработчик GET, не
// тронувший запрос, предрендерится при сборке. `/api/auth/architect` без ARCHITECT_TOKEN на сборке запомнил отказ
// навсегда; `/api/auth/methods` запомнил бы «ключей Google нет». Лечение — `await connection()`. Намеренно
// кэшируемые двери перечисляются в `--allow`.
//
// Слово владельца 2026-09-24: «ни в коем случае страницы не должны становиться динамическими». Переход на Cache Components
// доказывается СРАВНЕНИЕМ, а не словами: до и после — одна и та же таблица. Источник — манифесты уже собранной сборки
// (`app-path-routes-manifest.json` — все маршруты; `prerender-manifest.json` — предрендеренные и ISR), новая сборка не нужна.
// Маршрут страницы, которого нет среди предрендеренных (ни как готовый путь, ни как шаблон с `fallback`), — динамический.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function snapshot(dist) {
  const routes = JSON.parse(readFileSync(join(dist, 'app-path-routes-manifest.json'), 'utf8'))
  const pre = JSON.parse(readFileSync(join(dist, 'prerender-manifest.json'), 'utf8'))
  const staticPaths = new Set(Object.keys(pre.routes || {}))
  const srcRoutes = new Set(Object.values(pre.routes || {}).map((r) => r.srcRoute).filter(Boolean))
  const dynTemplates = new Set(Object.keys(pre.dynamicRoutes || {}))
  const out = {}
  for (const [entry, pattern] of Object.entries(routes)) {
    const kind = entry.endsWith('/page') ? 'page' : entry.endsWith('/route') ? 'route' : 'other'
    const prerendered = staticPaths.has(pattern) || srcRoutes.has(pattern) || dynTemplates.has(pattern)
    out[pattern] = { kind, prerendered }
  }
  return out
}

const args = process.argv.slice(2)
if (args[0] === '--diff') {
  const a = JSON.parse(readFileSync(args[1], 'utf8'))
  const b = JSON.parse(readFileSync(args[2], 'utf8'))
  let worse = 0
  const ai = args.indexOf('--allow')
  const allow = new Set(ai > 0 ? (args[ai + 1] ?? '').split(',').filter(Boolean) : [])
  for (const [p, v] of Object.entries(a)) {
    const n = b[p]
    if (!n) { console.log(`  − исчез: ${p}`); continue }
    if (v.prerendered && !n.prerendered) { worse++; console.log(`  ✗ СТАЛ ДИНАМИЧЕСКИМ: ${p} (${v.kind})`) }
    else if (!v.prerendered && n.prerendered && v.kind !== 'page' && !allow.has(p)) { worse++; console.log(`  ✗ ДВЕРЬ ЗАМОРОЖЕНА СБОРКОЙ: ${p} — ответ со сборки навсегда; await connection() или --allow`) }
    else if (!v.prerendered && n.prerendered) console.log(`  ✓ стал статическим: ${p} (${v.kind})`)
  }
  for (const p of Object.keys(b)) if (!a[p]) console.log(`  + появился: ${p} (${b[p].kind}, ${b[p].prerendered ? 'статика' : 'динамика'})`)
  const count = (s) => Object.values(s).filter((v) => v.kind === 'page' && !v.prerendered).length
  console.log(`  страниц-динамики: до ${count(a)} → после ${count(b)}`)
  if (worse) { console.log('===ROUTE_KINDS_WORSE==='); process.exit(1) }
  console.log('===ROUTE_KINDS_OK===')
} else {
  const [dist, file] = args
  if (!dist || !file || !existsSync(join(dist, 'prerender-manifest.json'))) {
    console.error('route-kinds: укажите папку сборки (с prerender-manifest.json) и файл снимка')
    process.exit(1)
  }
  const s = snapshot(dist)
  writeFileSync(file, JSON.stringify(s, null, 2) + '\n')
  const pages = Object.values(s).filter((v) => v.kind === 'page')
  const routesKind = Object.values(s).filter((v) => v.kind === 'route')
  console.log(`${file}: страниц ${pages.length} (статика ${pages.filter((v) => v.prerendered).length}, динамика ${pages.filter((v) => !v.prerendered).length}); дверей ${routesKind.length} (статика ${routesKind.filter((v) => v.prerendered).length})`)
  for (const [p, v] of Object.entries(s)) if (v.kind === 'page' && !v.prerendered) console.log(`  динамическая страница: ${p}`)
}
