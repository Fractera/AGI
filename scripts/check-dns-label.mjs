// СТОРОЖ ИМЕНИ-МЕТКИ DNS (325-7). Случаи из первоисточников (`lib/agi-items/dns-label.mjs`): каждое правило — хотя бы один
// случай «отказать». Порча правила в модуле обязана окрасить этот прибор красным (проверено порчей запрета «--»).
import { isDnsLabel, isElementAddress } from '../lib/agi-items/dns-label.mjs'

const ok = [
  'shop', 'shop-2', 'my-shop-2026', 'a1b2', 'xn-a', 'abcdefghijklmnopqrstuvwx',
]
const no = [
  ['', 'пусто'], ['abc', 'короче 4'], ['abcdefghijklmnopqrstuvwxy', 'длиннее 24'],
  ['-shop', 'дефис первым (RFC 1035, 5891)'], ['shop-', 'дефис последним (RFC 1035, 5891)'],
  ['xn--shop', '«--» на 3-4 местах — R-LDH (RFC 5890)'], ['ab--cd', '«--» на 3-4 местах'], ['shop--2', '«--» (политика узла)'],
  ['1shop', 'первой цифра (RFC 1123 разрешает, узел — нет)'], ['Shop', 'заглавная (одно имя — один регистр)'],
  ['my_shop', 'подчёркивание'], ['my.shop', 'точка'], ['my shop', 'пробел'], ['ёжик-shop', 'не-ASCII'],
  ['shop​', 'невидимый знак'], ['shop/2', 'косая черта'],
]
const stdNo = ['-a', 'a-', 'ab--c', 'a'.repeat(64), 'a_b', 'é']
const stdOk = ['a', '1', '1abc', 'a'.repeat(63)]

const fails = []
for (const n of ok) if (!isElementAddress(n)) fails.push(`должен пройти: «${n}»`)
for (const [n, why] of no) if (isElementAddress(n)) fails.push(`должен получить отказ: «${n}» — ${why}`)
for (const n of stdOk) if (!isDnsLabel(n)) fails.push(`метка по стандарту: «${n.slice(0, 20)}»`)
for (const n of stdNo) if (isDnsLabel(n)) fails.push(`не метка по стандарту: «${n.slice(0, 20)}»`)

if (fails.length) {
  console.log(fails.map((f) => `  ${f}`).join('\n'))
  console.log('===DNS_LABEL_FAILED===')
  process.exit(1)
}
console.log(`===DNS_LABEL_OK=== случаев: ${ok.length + no.length + stdOk.length + stdNo.length}`)
