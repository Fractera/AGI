import type { Block } from '@/lib/content/blocks/types'
import { telegramChannelWords } from '@/components/channel/telegram-channel.i18n'

// СОДЕРЖИМОЕ СТРАНИЦЫ «Telegram bot» (267-3).
//
// 🔒 ЗДЕСЬ ЖИВЁТ РАБОТАЮЩАЯ ЧАСТЬ, А В `_data` — СЛОВА. Язык выбирается здесь, на
// сервере, и в блок уходит один набор строк — иначе словарь уехал бы в браузер целиком.
export function content(lang: string): Block[] {
  return [{ kind: 'telegramChannel', lang, words: telegramChannelWords(lang) }]
}
