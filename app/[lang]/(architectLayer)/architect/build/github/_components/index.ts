import type { ReactNode } from 'react'
import type { Block } from '@/lib/content/blocks/types'
import { githubWidget } from '../_github/widget'

// СОДЕРЖИМОЕ ВКЛАДКИ «GITHUB» (273): весь экран — собственный островок маршрута.
export function content(_lang: string): Block[] {
  return []
}

export function widget(lang: string): ReactNode {
  return githubWidget(lang)
}
