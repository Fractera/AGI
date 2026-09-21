import type { Block } from '@/lib/content/blocks/types'
import { domainLadderWords } from '@/components/domain/domain-ladder.i18n'

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
  return [{ kind: 'domainLadder', lang, words: domainLadderWords(lang) }]
}
