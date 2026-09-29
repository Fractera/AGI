import type { Block } from '@/lib/content/blocks/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Проекты» (339). Таблица всех AGI ITEMS узла — вид каталога `projectsBoard`: страница предрендерена,
// поэтому строки спрашиваются в браузере у двери `/api/node/projects`, а не читаются здесь при сборке.
export function content(lang: string): Block[] {
  return [{ kind: 'projectsBoard', lang }]
}
