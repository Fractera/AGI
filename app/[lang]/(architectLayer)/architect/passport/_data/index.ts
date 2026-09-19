import type { WorkspacePageData } from '@/lib/collection/types'
import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'

// 🔒 ГРУППА УСТРОЕНА ТАК ЖЕ, КАК РАЗДЕЛ, И РАЗЛИЧАЕТ ИХ ТОЛЬКО ГЛУБИНА. Отсюда и
// берётся то, что второй уровень не стоил ни строки: сканер не знает слов
// «группа» и «раздел» вовсе.
export const data: WorkspacePageData = { meta, en, overrides: { ru } }
