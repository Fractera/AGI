import type { ReactNode } from 'react'
import { AgentTerminal } from './client/agent-terminal.client'
import { ClaudeSubscription } from './client/claude-subscription.client'
import { TelegramChannel } from './client/telegram-channel.client'
import { agentTerminalWords } from './i18n/agent-terminal.i18n'
import { claudeSubscriptionWords } from './i18n/claude-subscription.i18n'
import { telegramChannelWords } from './i18n/telegram-channel.i18n'

// ВХОД СТРАНИЦ СЛУЖБЫ В КОПИЮ КОМПЛЕКТА АГЕНТА (271).
//
// 🔒 `(страница, служба, язык) → островок`. Страница службы зовёт только эту функцию; язык выбирается здесь,
// на сервере, и в островок уходит один набор строк — словарь не едет в браузер целиком.
// 🔒 ЭТО НЕ ВИД КАТАЛОГА (до 271 были `agentTerminal`, `claudeSubscription`, `telegramChannel`): вещь живёт в
// папке своего маршрута, и удаление маршрута уносит её целиком. На страницу она встаёт полем `widget`.

export type AgentKitPage = 'claude-code' | 'terminal' | 'telegram'

export function agentKitWidget(page: AgentKitPage, service: string, lang: string): ReactNode {
  switch (page) {
    case 'claude-code':
      return <ClaudeSubscription service={service} lang={lang} words={claudeSubscriptionWords(lang)} />
    case 'terminal':
      return <AgentTerminal service={service} lang={lang} words={agentTerminalWords(lang)} />
    case 'telegram':
      return <TelegramChannel service={service} lang={lang} words={telegramChannelWords(lang)} />
  }
}
