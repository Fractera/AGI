import type { Block } from '@/lib/content/blocks/types'
import { kitsUi, type KitDetailsSection, type KitWords } from '../_data/ui.i18n'

// СОДЕРЖИМОЕ ВКЛАДКИ «ГОТОВЫЕ РЕШЕНИЯ» (270).
//
// 🎯 Слово владельца 2026-09-22: «созданные здесь готовые технические решения позволяют создавать новые
// микросервисы без необходимости программировать базовые инструменты» — аккордеон, открыта одна полоса,
// список не выше 1000 px, подробности — в окне по иконке открытой книги.
// 🔒 Слова — в `_data/ui.i18n.ts`, здесь только их раскладка в блоки каталога.

function detailBlocks(sections: KitDetailsSection[]): Block[] {
  return sections.flatMap((s): Block[] => [
    { kind: 'h3', text: s.heading },
    ...(s.text ? [{ kind: 'p', text: s.text } as Block] : []),
    ...(s.items ? [{ kind: 'list', items: s.items } as Block] : []),
    ...(s.table ? [{ kind: 'table', headers: s.table.headers, rows: s.table.rows } as Block] : []),
  ])
}

function kitItem(w: KitWords): Block {
  return {
    kind: 'accordionItem',
    summary: w.summary,
    details: { title: w.detailsTitle, children: detailBlocks(w.details) },
    children: [
      { kind: 'p', text: w.intro },
      { kind: 'p', text: `**${w.embedLabel}**` },
      { kind: 'code', text: w.command },
      { kind: 'table', headers: w.paramsHeaders, rows: w.params },
      { kind: 'p', text: w.sample },
    ],
  }
}

export function content(lang: string): Block[] {
  const ui = kitsUi(lang)
  return [{ kind: 'accordion', capped: true, children: [kitItem(ui.agentKit)] }]
}
