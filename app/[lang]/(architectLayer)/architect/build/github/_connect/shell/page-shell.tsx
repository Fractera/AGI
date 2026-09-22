import type { ReactNode } from 'react'
import { H2, Lead } from '@/components/ui/typography'

// ОБОЛОЧКА СТРАНИЦЫ ПУТИ В НАШЕМ СЛОЕ (274-2).
//
// 🔒 ЗАМЕНА `PageShell` ПАНЕЛИ, А НЕ ЕЁ ПЕРЕПИСЬ. Перенесённые страницы пути зовут оболочку по своему
// имени и со своими пропсами — здесь они принимаются все до единого, чтобы код шага не правился вовсе
// (закон владельца 2026-09-22: «перенести один к одному»).
// 🛑 ЧЕГО ЭТА ОБОЛОЧКА НЕ ДЕЛАЕТ: не рисует крошки и имя раздела — их уже рисует страница слоя
// архитектора. Вторая шапка на одном экране читается как сбой вёрстки, а не как забота.
export function PageShell({
  title,
  hint,
  children,
}: {
  title?: string
  hint?: string
  notice?: string
  children?: ReactNode
  lang?: string
  slug?: string
  s?: unknown
  params?: Record<string, string | undefined>
  tail?: { label: string; href?: string }[]
  wide?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {title && <H2 variant="ui">{title}</H2>}
      {hint && <Lead>{hint}</Lead>}
      {children}
    </div>
  )
}
