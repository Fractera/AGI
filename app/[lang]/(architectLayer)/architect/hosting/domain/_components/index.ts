import type { Block } from '@/lib/content/blocks/types'
import { domainLadderWords } from '@/components/domain/domain-ladder.i18n'
import { homeHostingNotes } from './home-hosting-notes.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Domain activation» (259-1).
//
// 🔒 ЗДЕСЬ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА СТРАНИЦЫ. Лестница — не текст
// страницы, а переиспользуемая часть со своим словарём рядом с собой; поэтому её
// слова берутся у неё, а не у страницы. Разница проверяемая: слова страницы
// переводятся вместе со страницей, слова лестницы поедут с лестницей в любое
// место, где домен подключают снова.
//
// 🔒 ЯЗЫК ВЫБИРАЕТСЯ ЗДЕСЬ, НА СЕРВЕРЕ, И В БЛОК УХОДИТ ОДИН НАБОР СТРОК. Отдай
// мы островку весь словарь — он уехал бы в браузер целиком, и это поймал бы
// сторож `check:lang-delivery`.
export function content(lang: string): Block[] {
  const n = homeHostingNotes(lang)
  const item = (x: { summary: string; text: string[] }): Block => ({
    kind: 'accordionItem', summary: x.summary, children: x.text.map((text): Block => ({ kind: 'p', text })),
  })
  return [
    { kind: 'domainLadder', lang, words: domainLadderWords(lang) },
    // 344-5: когда подходит сайт с домашнего компьютера и что делать при посетителях из России — свёрнуто по умолчанию
    // (слово владельца: «По умолчанию эти карточки должны быть закрыты … пусть нажимает раскрыть если ему интересно»).
    { kind: 'accordion', title: n.title, cards: true, children: [item(n.home), item(n.russia)] },
  ]
}
