import type { WorkspacePageMeta } from '@/lib/collection/types'

export const meta: WorkspacePageMeta = {
  slug: 'step-3',
  order: 30,
  // 🔒 СТРАНИЦА ЕСТЬ, ПУНКТА МЕНЮ НЕТ (274-4). Это шаг ПРОЦЕССА, а не раздел: человек попадает сюда
  // кнопкой со вкладки GitHub и уходит отсюда, пройдя четыре шага. Четыре пункта в левом меню
  // назвали бы процессом то, что читается как четыре независимых места.
  hidden: true,
}
