import type { Block } from '@/lib/content/blocks/types'
import { typeCatalogue } from '../../_components/type-catalogue'
import { meta } from '../_data/meta'

// БЛОКИ ЭТОГО РАЗДЕЛА (шаг 296). Страница называет только себя — свою папку (`meta.slug` = раздел в
// `sections/taxonomy.json`); какие блоки здесь стоят, решает таксономия. Устройство — `../../_components/type-catalogue.ts`.
export function content(lang: string): Block[] {
  return typeCatalogue(lang, meta.slug)
}
