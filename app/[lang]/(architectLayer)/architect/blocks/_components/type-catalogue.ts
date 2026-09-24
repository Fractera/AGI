import type { Block } from '@/lib/content/blocks/types'
import SECTIONS from '@/sections/SECTIONS.json'
import { SPECIMEN, SPECIMEN_CODES } from '../page-material/_data/specimen'
import { blocksCatalogueUi } from '../page-material/_data/ui.i18n'

// БЛОКИ ОДНОГО РАЗДЕЛА — ОДНА ФУНКЦИЯ НА ВСЕ СТРАНИЦЫ ГРУППЫ «Блоки» (шаг 296).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-24: «Блоки лежат на своих местах так как положено» — как на aifa.dev, где у каждого
// раздела своя кнопка. Здесь у каждого раздела своя страница, и она показывает ТОЛЬКО свои блоки.
//
// 🔒 РАЗДЕЛ БЛОКА ЗАПИСАН В ОДНОМ МЕСТЕ — `sections/taxonomy.json` (оттуда его переносит порождённый
// `SECTIONS.json`). Страница называет только себя (`meta.slug`), список блоков она не держит: новый блок,
// записанный в таксономию, появляется на своей странице сам. ✗ Оплачено: десять новых видов не попали в
// таксономию и молча упали в «Материал страницы» — сторож `check:blocks-catalogue` теперь это ловит.
//
// Образцы рисует НАСТОЯЩИЙ рендерер — те же `SPECIMEN`, что и раньше, просто отфильтрованные по разделу.

const TYPE_OF = new Map((SECTIONS.kinds as { kind: string; type: string }[]).map((k) => [k.kind, k.type]))

export function typeCatalogue(lang: string, type: string): Block[] {
  const ui = blocksCatalogueUi(lang)
  const shown = SPECIMEN.map((section, i) => ({ section, code: SPECIMEN_CODES[i] })).filter(
    ({ section }) => TYPE_OF.get(section.kind) === type,
  )
  const kinds = new Set(shown.map(({ section }) => section.kind)).size

  return [
    { kind: 'p', text: `**${kinds} ${ui.countLabel}.** ${ui.subtitle}` },
    // Разделитель ПЕРЕД каждым образцом (владелец 2026-09-25: «не видно границ блоков»).
    ...shown.flatMap(({ section, code }): Block[] => [
      { kind: 'separator' },
      {
        kind: 'badges',
        items: [
          // Имя вида не переводится: это машинная строка, она и есть значение в данных материала.
          { label: code, tone: 'code' },
          ...(section.label ? [{ label: section.label, tone: 'muted' as const }] : []),
        ],
      },
      { kind: 'p', text: `**${ui.whenLabel}:** ${section.when}` },
      ...section.blocks,
    ]),
  ]
}
