import type { WorkspacePageData } from '@/lib/collection/types'
import { meta } from './meta'
import { en } from './en'
import { ru } from './ru'

// 🔒 ИМЕННО ЭТОТ ФАЙЛ ДЕЛАЕТ ПАПКУ СТРАНИЦЕЙ КОЛЛЕКЦИИ. Сканер ищет его и
// ничего больше: есть — папка попадает в список своей группы, нет — не попадает.
export const data: WorkspacePageData = { meta, en, overrides: { ru } }
