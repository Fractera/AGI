// ПРИБОР: ЖИВЫЕ АДРЕСА ОТВЕЧАЮТ ПРЕДРЕНДЕРЕННЫМИ СТРАНИЦАМИ (шаг 295-0).
//
//   node scripts/prerender-probe.mjs sitemap <база, напр. http://localhost:24683>
//   node scripts/prerender-probe.mjs snapshot <база> <снимок route-kinds> [язык]
//
// Что меряет: каждый адрес — 200 и заголовок `x-nextjs-prerender: 1` (страница отдана из предрендера, а не собрана на
// запрос). Источник адресов — карта сайта (SEO-страницы, ровно то, что видит поисковик) или снимок маршрутов сборки
// (страницы без параметров кроме языка). Отказ хоть одного — код 1: такой прибор годится и до, и после перевода.
import { readFileSync } from 'node:fs'

const [mode, base, file, lang = 'ru'] = process.argv.slice(2)
const trim = (s) => s.replace(/\/+$/, '')

async function urls() {
  if (mode === 'sitemap') {
    const xml = await (await fetch(`${trim(base)}/sitemap.xml`)).text()
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
      const u = new URL(m[1])
      return `${trim(base)}${u.pathname}`
    })
  }
  const snap = JSON.parse(readFileSync(file, 'utf8'))
  return Object.entries(snap)
    .filter(([p, v]) => v.kind === 'page' && !/\[(?!lang\])/.test(p))
    .map(([p]) => `${trim(base)}${p.replace('[lang]', lang)}`)
}

const list = [...new Set(await urls())]
// Прогрев: страница, собираемая ПРИ ПЕРВОМ ЗАХОДЕ (ISR по требованию), в первый раз отвечает без признака предрендера —
// измерено 295-0 (12 из 16 адресов сайта сразу после развёртывания). Считаем их отдельно, меряем второй проход.
let cold = 0
for (const u of list) {
  try { const r = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(30000) }); if (r.headers.get('x-nextjs-prerender') !== '1') cold++ } catch { /* второй проход скажет */ }
}
let bad = 0
for (const u of list) {
  try {
    const r = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(30000) })
    const pre = r.headers.get('x-nextjs-prerender') === '1'
    const ok = (r.status === 200 && pre) || (r.status >= 300 && r.status < 400)
    if (!ok) { bad++; console.log(`  ✗ ${r.status} prerender=${pre ? 1 : 0} ${u}`) }
  } catch (e) {
    bad++
    console.log(`  ✗ нет ответа ${u}: ${e instanceof Error ? e.message : e}`)
  }
}
console.log(`${mode}: адресов ${list.length}, собраны при первом заходе ${cold}, отказов ${bad}`)
if (bad) { console.log('===PRERENDER_PROBE_FAILED==='); process.exit(1) }
console.log('===PRERENDER_PROBE_OK===')
