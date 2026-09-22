import type { Block } from '@/lib/content/blocks/types'

// 🔒 JSX ЖИВЁТ В `view.tsx`: сторож маршрутов ждёт именно `_components/index.ts`, а имя файла — это
// договор, а не вкус.
export { widget } from './view'

export function content(_lang: string): Block[] {
  return []
}
