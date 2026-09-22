import type { Block } from '@/lib/content/blocks/types'
import { agentKitContent } from '@/lib/agent-kit/content'

// СОДЕРЖИМОЕ СТРАНИЦЫ — ИЗ КОМПЛЕКТА АГЕНТА СЛУЖБЫ (269, `lib/agent-kit/content.ts`).
// Здесь только имя страницы и имя службы; всё остальное — в комплекте, одно на все службы.
export function content(lang: string): Block[] {
  return agentKitContent('telegram', 'data', lang)
}
