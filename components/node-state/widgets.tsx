import type { ReactNode } from 'react'
import { NodePlace } from './node-place.client'
import { nodePlaceWords } from './node-place.i18n'

// ВХОД СТРАНИЦ В ОСТРОВКИ СОСТОЯНИЯ УЗЛА (276-3).
//
// 🔒 `(язык) → островок`. Страница зовёт одну функцию; язык выбирается здесь, на сервере, и в островок
// уходит один набор строк — словарь не едет в браузер целиком.
// 🔒 ЗАЧЕМ ОТДЕЛЬНЫЙ ФАЙЛ: `_components/index.ts` страницы — модуль без JSX, как у всех остальных
// страниц слоя. Тот же приём, что у комплекта агента (`_agent-kit/widgets.tsx`), и по той же причине:
// разметка живёт в `.tsx`, а вход страницы остаётся одинаковым у всех.

export function nodePlaceWidget(lang: string): ReactNode {
  return <NodePlace lang={lang} words={nodePlaceWords(lang)} />
}
