import type { Block } from '@/lib/content/blocks/types'
import { claudeSubscriptionWords } from '@/components/terminal/claude-subscription.i18n'
import { agentTerminalWords } from '@/components/terminal/agent-terminal.i18n'
import { telegramChannelWords } from '@/components/channel/telegram-channel.i18n'

// КОМПЛЕКТ АГЕНТА СЛУЖБЫ (269): подписка Claude Code, терминал, Telegram-бот.
//
// 🎯 Слово владельца 2026-09-22: «преврати это в техническое решение, которое в качестве параметров
// принимает и возвращает возможность быстро встраивать в новые микросервисы».
//
// 🔒 ВХОД ОДИН: `(страница, служба, язык) → блоки`. Страница службы вызывает только эту функцию; всё, что
// под ней, — двери `?service=`, сессия по службам, бот в сессии терминала — берёт имя службы отсюда.
// Встроить в новую службу: `npm run agent-kit:add -- <служба>` (штампует три папки страниц).
// 🔒 У КАЖДОЙ СЛУЖБЫ СВОЯ СЕССИЯ CLAUDE CODE И СВОЙ БОТ; подписка — одна на машину, и её страница у всех
// служб показывает одно и то же.

export const AGENT_KIT_PAGES = ['claude-code', 'terminal', 'telegram'] as const
export type AgentKitPage = (typeof AGENT_KIT_PAGES)[number]

export function agentKitContent(page: AgentKitPage, service: string, lang: string): Block[] {
  switch (page) {
    case 'claude-code':
      return [{ kind: 'claudeSubscription', words: claudeSubscriptionWords(lang) }]
    case 'terminal':
      return [{ kind: 'agentTerminal', service, words: agentTerminalWords(lang) }]
    case 'telegram':
      return [{ kind: 'telegramChannel', service, lang, words: telegramChannelWords(lang) }]
  }
}
