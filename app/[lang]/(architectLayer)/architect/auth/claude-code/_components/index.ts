import type { Block } from '@/lib/content/blocks/types'
import { claudeSubscriptionWords } from '@/components/terminal/claude-subscription.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Claude Code subscription» (267-2).
//
// 🔒 ЗДЕСЬ ЖИВЁТ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА. Язык выбирается здесь, на
// сервере, и в блок уходит один набор строк — иначе словарь уехал бы в браузер целиком.
export function content(lang: string): Block[] {
  return [{ kind: 'claudeSubscription', words: claudeSubscriptionWords(lang) }]
}
