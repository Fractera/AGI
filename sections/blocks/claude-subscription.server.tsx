import type { SectionRenderer } from '@/sections/contract'
import { ClaudeSubscription } from '@/components/terminal/claude-subscription.client'

// Подписка Claude Code (267-2).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ — как `agentTerminal`: работающая часть входит
// на страницу своим видом каталога. Слова приходят в блоке, словарь остаётся на сервере.
export const claudeSubscription: SectionRenderer<'claudeSubscription'> = (b, { key: k }) => (
  <ClaudeSubscription key={k} words={b.words} />
)
