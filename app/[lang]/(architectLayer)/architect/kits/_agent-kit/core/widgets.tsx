import type { ReactNode } from 'react'
import { AgentTerminal } from './client/agent-terminal.client'
import { ClaudeSubscription } from './client/claude-subscription.client'
import { TelegramChannel } from './client/telegram-channel.client'
import { agentTerminalWords } from './words/agent-terminal.i18n'
import { claudeSubscriptionWords } from './words/claude-subscription.i18n'
import { telegramChannelWords } from './words/telegram-channel.i18n'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { getService } from '@/lib/microservices/registry'

// ВХОД СТРАНИЦ СЛУЖБЫ В КОПИЮ КОМПЛЕКТА АГЕНТА (271).
//
// 🔒 `(страница, служба, язык) → островок`. Страница службы зовёт только эту функцию; язык выбирается здесь,
// на сервере, и в островок уходит один набор строк — словарь не едет в браузер целиком.
// 🔒 ЭТО НЕ ВИД КАТАЛОГА (до 271 были `agentTerminal`, `claudeSubscription`, `telegramChannel`): вещь живёт в
// папке своего маршрута, и удаление маршрута уносит её целиком. На страницу она встаёт полем `widget`.

export type AgentKitPage = 'claude-code' | 'terminal' | 'telegram'

/**
 * 336-5: поле ключа OpenAI для голоса в окне вставки. Элемент (род `user`) — его вкладка «Переменные окружения» (ключ ядра, нет —
 * ключ элемента: слово владельца 2026-09-29); служба ядра — вкладка ядра.
 */
export function openAiKeyHref(service: string, lang: string): string {
  return getService(service)?.kind === 'user'
    ? `/${lang}/architect/${service}/build/environment#OPENAI_API_KEY`
    : `/${lang}/architect/build/environment#OPENAI_API_KEY`
}

export function agentKitWidget(page: AgentKitPage, service: string, lang: string): ReactNode {
  switch (page) {
    case 'claude-code':
      return <ClaudeSubscription service={service} lang={lang} words={claudeSubscriptionWords(lang)} />
    case 'terminal':
      return <AgentTerminal service={service} lang={lang} words={agentTerminalWords(lang)} dialogUi={appDialogUi(lang)} keyHref={openAiKeyHref(service, lang)} />
    case 'telegram':
      return <TelegramChannel service={service} lang={lang} words={telegramChannelWords(lang)} />
  }
}
