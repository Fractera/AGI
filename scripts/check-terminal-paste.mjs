// ПРИБОР ВСТАВКИ В ТЕРМИНАЛ (шаг 316). Проверяет функции мастера комплекта агента без сборки:
// очистка управляющих символов, режим вставки, ссылка → разбор обратно даёт тот же текст.
// 🛑 Проверяется порчей: сломать `cleanPaste` (вернуть text как есть) — прибор обязан покраснеть.
import { cleanPaste, bracketedPaste, terminalLink, pasteFromSearch, PASTE_LIMIT } from '../app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs'

const ESC = String.fromCharCode(27)
let bad = 0
const check = (name, ok) => { if (!ok) { bad++; console.log(`  ✗ ${name}`) } else console.log(`  ✓ ${name}`) }

check('ESC-последовательность вырезана', !cleanPaste(`a${ESC}[31mb`).includes(ESC))
check('перевод строки и табуляция сохранены', cleanPaste('a\r\nb\tc') === 'a\nb\tc')
check('длина ограничена', cleanPaste('x'.repeat(PASTE_LIMIT + 50)).length === PASTE_LIMIT)
check('режим вставки обрамляет текст', bracketedPaste('hi') === `${ESC}[200~hi${ESC}[201~`)
check('«отправить» добавляет Enter', bracketedPaste('hi', true).endsWith('\r'))
for (const text of ['Страница: /ru/privacy\nФайл: app/[lang]/(publicLayer)/_pages/privacy/ru.json\nБлок: kns6w (p)', 'a & b # c ? d', 'кириллица, «кавычки» и эмодзи 🍉']) {
  const link = terminalLink({ lang: 'ru', service: 'root', text })
  check(`ссылка → разбор: ${text.slice(0, 24).replace(/\n/g, '⏎')}…`, pasteFromSearch(new URL(link, 'http://x').search) === text)
}
check('ссылка без paste → null', pasteFromSearch('?a=1') === null)

if (bad) { console.log(`===TERMINAL_PASTE_FAILED=== ошибок: ${bad}`); process.exit(1) }
console.log('===TERMINAL_PASTE_OK===')
