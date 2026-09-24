// СТОРОЖ ЗНАЧКОВ ЛЕВОГО МЕНЮ (шаг 288-2). У каждого раздела слоя архитектора в `_data/meta.ts` есть `icon`, и это имя
// есть в словаре `components/workspace/menu-icons.tsx`. Раздел без значка выбивается из ряда молча — сборка его пропустит.
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const DIR = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect')
const dict = readFileSync(join(ROOT, 'components', 'workspace', 'menu-icons.tsx'), 'utf8')
const names = new Set([...dict.matchAll(/^\s{2}([a-z]+): [A-Z]\w+,$/gm)].map((m) => m[1]))
let bad = 0
for (const d of readdirSync(DIR, { withFileTypes: true })) {
  if (!d.isDirectory()) continue
  const meta = join(DIR, d.name, '_data', 'meta.ts')
  if (!existsSync(meta)) continue
  const m = readFileSync(meta, 'utf8').match(/\bicon:\s*'([^']+)'/)
  if (!m) { bad++; console.log(`  ✗ ${d.name}: нет icon в _data/meta.ts`) }
  else if (!names.has(m[1])) { bad++; console.log(`  ✗ ${d.name}: значка «${m[1]}» нет в menu-icons.tsx`) }
}
if (bad) { console.log('===MENU_ICONS_FAILED==='); process.exit(1) }
console.log(`===MENU_ICONS_OK=== словарь ${names.size} значков`)
