import type { Block } from '@/lib/content/blocks/types'
import { voiceStrings } from '@/lib/i18n/voice-field.i18n'
import { typeCatalogue } from '../../_components/type-catalogue'
import { meta } from '../_data/meta'

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
  const voice = voiceStrings(lang)

  // Обмен переводами элементов формы: рамка про СЛОВАРЬ, а не про элемент —
  // команду надо видеть там же, где виден результат. Разделитель `--` в команде
  // обязателен: без него npm съедает всё после имени скрипта.
  const i18nExchange: Block[] = [
    { kind: 'callout', title: voice.specimenI18nTitle, text: voice.specimenI18nNote },
    { kind: 'code', text: `${EXPORT_CMD}\n${IMPORT_CMD}\n\nlib/i18n/voice-field.i18n.json` },
  ]

  return [
    ...i18nExchange,
    // 296: только блоки своего раздела — остальные стоят на своих страницах группы «Блоки».
    ...typeCatalogue(lang, meta.slug),
  ]
}
