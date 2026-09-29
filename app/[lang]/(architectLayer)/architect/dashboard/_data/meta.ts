import type { WorkspacePageMeta } from '@/lib/collection/types'

// 339-1 (слово владельца 2026-09-29): «После кнопки паспорт в левом меню добавлять кнопку Dashboard». Паспорт — 10, хостинг — 15.
export const meta: WorkspacePageMeta = {
  slug: 'dashboard',
  order: 12,
  icon: 'dashboard',
}
