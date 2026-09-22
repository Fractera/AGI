import type { Block } from '@/lib/content/blocks/types'
import { agentTerminalWords } from '@/components/terminal/agent-terminal.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Terminal» (267-1).
//
// 🔒 ЗДЕСЬ ЖИВЁТ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА. Терминал — переиспользуемая
// часть со своим словарём рядом с собой; язык выбирается здесь, на сервере, и в блок
// уходит один набор строк — иначе словарь уехал бы в браузер целиком.
export function content(lang: string): Block[] {
  return [{ kind: 'agentTerminal', words: agentTerminalWords(lang) }]
}
