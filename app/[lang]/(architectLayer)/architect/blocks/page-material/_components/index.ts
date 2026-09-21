import type { Block } from '@/lib/content/blocks/types'
import { voiceStrings } from '@/lib/i18n/voice-field.i18n'
import { SPECIMEN, SPECIMEN_CODES } from '../_data/specimen'
import { blocksCatalogueUi } from '../_data/ui.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Материал страницы» — КАТАЛОГ СЕКЦИЙ.
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-21: каталог со страницы `/{lang}/blocks` «must live here» —
// на `/{lang}/architect/blocks/page-material`. Прежняя страница слоя `admin` удалена, её адрес
// переадресован сюда (`next.config.ts`); образцы, слова и обмен переводами переехали в эту папку.
//
// 🔒 КАТАЛОГ РАЗОБРАН В БЛОКИ, А НЕ ПЕРЕНЕСЁН ВЁРСТКОЙ. Страница слоя архитектора принимает
// `Block[]` и рисует их той же оболочкой, что и остальные разделы; рукописная разметка здесь завела
// бы вторую раскладку рядом с общей. Сам образец каждого вида по-прежнему рисует НАСТОЯЩИЙ рендерер
// — ради этого каталог и существует: вид, не нарисованный нигде, не «неиспользуемый», а непроверенный.
//
// 🛑 СЛОВА ОТСЮДА НЕ ПИШУТСЯ: подписи приходят из `ui.i18n.ts` и `voice-field.i18n`, тексты образцов —
// из `specimen.ts`.

const EXPORT_CMD = 'npm run i18n:export -- voice-field --langs es,fr,de,it,pt,pl,tr,nl'
const IMPORT_CMD = 'npm run i18n:import -- voice-field <файл-ответа.json>'

export function content(lang: string): Block[] {
  const ui = blocksCatalogueUi(lang)
  const voice = voiceStrings(lang)

  // Обмен переводами элементов формы: рамка про СЛОВАРЬ, а не про элемент —
  // команду надо видеть там же, где виден результат. Разделитель `--` в команде
  // обязателен: без него npm съедает всё после имени скрипта.
  const i18nExchange: Block[] = [
    { kind: 'callout', title: voice.specimenI18nTitle, text: voice.specimenI18nNote },
    { kind: 'code', text: `${EXPORT_CMD}\n${IMPORT_CMD}\n\nlib/i18n/voice-field.i18n.json` },
  ]

  const catalogue: Block[] = SPECIMEN.flatMap((section, i): Block[] => [
    {
      kind: 'badges',
      items: [
        // Имя вида не переводится ни на один язык: это машинная строка, она и
        // есть значение в данных материала.
        { label: SPECIMEN_CODES[i], tone: 'code' },
        ...(section.label ? [{ label: section.label, tone: 'muted' as const }] : []),
      ],
    },
    { kind: 'p', text: `**${ui.whenLabel}:** ${section.when}` },
    ...section.blocks,
  ])

  return [
    { kind: 'p', text: `**${SPECIMEN.length} ${ui.countLabel}.** ${ui.subtitle}` },
    ...i18nExchange,
    ...catalogue,
  ]
}
