// СТОРОЖ: КАЖДЫЙ БЛОК ЛЕЖИТ НА СВОЕЙ СТРАНИЦЕ ГРУППЫ «Блоки» (шаг 296).
//
//   node scripts/check-blocks-catalogue.mjs
//
// Слово владельца 2026-09-24: «Блоки лежат на своих местах так как положено» (образец — каталог на aifa.dev, кнопка
// на каждый раздел). ✗ Оплачено: десять новых видов не были записаны в `sections/taxonomy.json`, генератор карты
// молча отдал их «Материалу страницы», а двенадцать страниц разделов стояли пустыми — и ни одна проверка не
// покраснела.
//
// Три отказа:
//   1. вид из реестра рендереров (`sections/index.ts`) не записан в таксономию — ему некуда лечь;
//   2. у раздела таксономии нет страницы `architect/blocks/<раздел>/` или она не зовёт `typeCatalogue`;
//   3. раздел пуст — страница показала бы «скоро будет» вместо блоков.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const BLOCKS = join(ROOT, 'app', '[lang]', '(architectLayer)', 'architect', 'blocks')
const taxonomy = JSON.parse(readFileSync(join(ROOT, 'sections', 'taxonomy.json'), 'utf8'))

// Реестр рендереров: перечисление видов в наборе `sections/index.ts` (одна строка через запятую).
const index = readFileSync(join(ROOT, 'sections', 'index.ts'), 'utf8')
const setLine = index.split('\n').find((l) => /^\s*p, h2, h3/.test(l)) ?? ''
const kinds = setLine.split(',').map((s) => s.trim()).filter((s) => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s))

const errors = []
if (kinds.length === 0) errors.push('не нашёл набор видов в sections/index.ts — сторож слеп, чиню сторожа')

for (const k of kinds) if (!taxonomy.kinds[k]) errors.push(`вид ${k} не записан в sections/taxonomy.json — у него нет раздела`)

const count = {}
for (const k of kinds) { const t = taxonomy.kinds[k]?.type; if (t) count[t] = (count[t] ?? 0) + 1 }

for (const t of taxonomy.types) {
  const file = join(BLOCKS, t.id, '_components', 'index.ts')
  if (!existsSync(file)) { errors.push(`раздел ${t.id}: нет страницы architect/blocks/${t.id}/`); continue }
  if (!readFileSync(file, 'utf8').includes('typeCatalogue(')) errors.push(`раздел ${t.id}: страница не показывает свои блоки (нет typeCatalogue)`)
  if (!count[t.id]) errors.push(`раздел ${t.id}: ни одного блока`)
}

if (errors.length) {
  for (const e of errors) console.log(`  ✗ ${e}`)
  console.log('===BLOCKS_CATALOGUE_FAILED===')
  process.exit(1)
}
console.log(`  блоков ${kinds.length}, разделов ${taxonomy.types.length}: ${taxonomy.types.map((t) => `${t.id} ${count[t.id]}`).join(' · ')}`)
console.log('===BLOCKS_CATALOGUE_OK===')
