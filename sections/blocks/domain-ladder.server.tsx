import type { SectionRenderer } from '@/sections/contract'
import { DomainLadder } from '@/components/domain/domain-ladder.client'
import { DomainList } from '@/components/domain/domain-list.client'
import { domainListWords } from '@/components/domain/domain-list.i18n'

// Лестница подключения своего домена (259-1).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ. Страницы коллекции собираются из блоков
// каталога; работающая часть входит туда своим видом, как `chat` или `voiceField`.
// Вставь мы островок мимо каталога — появился бы второй способ класть на страницу
// живое, и панель, читающая `SECTIONS.json`, о нём бы не знала.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ, А НЕ БЕРУТСЯ ЗДЕСЬ: рисовальщик серверный, язык
// известен странице, и словарь остаётся на сервере целиком.
// 324-1: ДОМЕНЫ УЗЛА СПИСКОМ — лестница стала первой карточкой аккордеона (основной домен), за ней дополнительные домены и
// «Добавить домен». Вид блока тот же: второй вид ради одной обёртки завёл бы вторую точку входа того же знания.
export const domainLadder: SectionRenderer<'domainLadder'> = (b, { key: k }) => (
  <DomainList key={k} lang={b.lang} words={domainListWords(b.lang)} ladder={<DomainLadder lang={b.lang} words={b.words} />} />
)
