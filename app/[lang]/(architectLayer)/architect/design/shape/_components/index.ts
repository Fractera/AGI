import type { Block } from '@/lib/content/blocks/types'

// 280-6: редактор оформления САЙТА (элемент root), раздел «shape» — островок из
// fractera-next-starter; пишет через дверь настроек сайта, после записи ядро пересобирает сайт.
export function content(lang: string): Block[] {
  return [{ kind: 'designSection', lang, section: 'shape' }]
}
