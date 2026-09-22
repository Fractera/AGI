import type { SectionRenderer } from '@/sections/contract'
import { TelegramChannel } from '@/components/channel/telegram-channel.client'

// Канал Telegram → Claude Code (267-3).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ — как `agentTerminal`. Язык едет в блоке: островок
// строит ссылку на раздел «Терминал» того же языка.
export const telegramChannel: SectionRenderer<'telegramChannel'> = (b, { key: k }) => (
  <TelegramChannel key={k} lang={b.lang} words={b.words} />
)
