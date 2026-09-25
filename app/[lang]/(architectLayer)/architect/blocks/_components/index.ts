import type { Block } from '@/lib/content/blocks/types'
import { blocksHomeWords } from '../_data/body'

// ГЛАВНАЯ СТРАНИЦА ЭЛЕМЕНТА «БЛОКИ» (шаг 297). Раскладка — по образцу главной корня: ряд мер, ярлыки, карточки, три
// шага; под ними оболочка группы сама ставит карточки 14 разделов — это и есть превью блоков.
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ: весь текст — `../_data/body.ts` (en + ru).
export function content(lang: string): Block[] {
  const w = blocksHomeWords(lang)
  const cardsOf = (items: { title: string; text: string }[]): Block[] =>
    items.map((i) => ({ kind: 'card', children: [{ kind: 'h3', text: i.title }, { kind: 'p', text: i.text }] }))

  return [
    { kind: 'metrics', items: w.metrics },
    { kind: 'badges', items: w.badges.map((label) => ({ label, tone: 'code' as const })) },
    { kind: 'cards', badge: w.why.badge, title: w.why.title, note: w.why.note, cols: 3, children: cardsOf(w.why.items) },
    { kind: 'cards', badge: w.who.badge, title: w.who.title, note: w.who.note, cols: 3, children: cardsOf(w.who.items) },
    {
      kind: 'cards',
      badge: w.custom.badge,
      title: w.custom.title,
      note: w.custom.note,
      cols: 2,
      children: [
        { kind: 'card', tone: 'data', children: [{ kind: 'h3', text: w.custom.block.title }, { kind: 'p', text: w.custom.block.text }] },
        { kind: 'card', tone: 'access', children: [{ kind: 'h3', text: w.custom.widget.title }, { kind: 'p', text: w.custom.widget.text }] },
      ],
    },
    { kind: 'flow', badge: w.choose.badge, title: w.choose.title, note: w.choose.note, steps: w.choose.steps },
  ]
}
