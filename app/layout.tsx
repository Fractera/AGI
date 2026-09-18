import './globals.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AGI Fractera',
  description: 'AGI Fractera — локальная установка, первый сервер.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // suppressHydrationWarning на <html> и <body>. Причина не в нашем коде:
  // расширения браузера (замечено на html — overscroll-behavior-x, ставит
  // расширение) правят разметку ДО того, как React сверит её с серверной.
  // Наших расхождений здесь нет — стили вынесены в globals.css именно
  // для этого. Подавление стоит только на двух корневых тегах, куда лезут
  // расширения, и НЕ распространяется на содержимое страницы: настоящее
  // расхождение внутри main по-прежнему будет видно в логе.
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
