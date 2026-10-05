import type { Block } from '@/lib/content/blocks/types'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Общение агентов» (408). Лента вызовов A2A узла — вид каталога `a2aFeed`: страница предрендерена,
// записи спрашиваются в браузере у двери `/api/node/a2a-log` (опрос раз в 3 с, пока вкладка видна — слово владельца).
export function content(lang: string): Block[] {
  return [{ kind: 'a2aFeed', lang }]
}
