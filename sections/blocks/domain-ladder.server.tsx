import type { SectionRenderer } from '@/sections/contract'
import { DomainLadder } from '@/components/domain/domain-ladder.client'

// Лестница подключения своего домена (259-1).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ. Страницы коллекции собираются из блоков
// каталога; работающая часть входит туда своим видом, как `chat` или `voiceField`.
// Вставь мы островок мимо каталога — появился бы второй способ класть на страницу
// живое, и панель, читающая `SECTIONS.json`, о нём бы не знала.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ, А НЕ БЕРУТСЯ ЗДЕСЬ: рисовальщик серверный, язык
// известен странице, и словарь остаётся на сервере целиком.
export const domainLadder: SectionRenderer<'domainLadder'> = (b, { key: k }) => (
  <DomainLadder key={k} lang={b.lang} words={b.words} />
)
