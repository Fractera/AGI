import type { WorkspacePageMeta } from '@/lib/collection/types'

// Факты, одинаковые на всех языках. `order` задан явно: у разделов нет даты, и
// без него порядок в меню решал бы алфавит имён папок.
export const meta: WorkspacePageMeta = {
  slug: 'required',
  order: 10,
}
