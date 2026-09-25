import type { Block } from '@/lib/content/blocks/types'

// Живой просмотр элемента «Блоки» — тот же вид, что у root, auth, data (стандарт владельца 2026-09-24).
export function content(lang: string): Block[] {
  return [{ kind: 'elementPreview', lang, serviceId: 'blocks' }]
}
