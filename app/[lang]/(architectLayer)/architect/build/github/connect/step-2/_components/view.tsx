import type { ReactNode } from 'react'
import Ported from '../../../_connect/panel/default-template/step-2/page'

// ШАГ МАСТЕРА ПОДКЛЮЧЕНИЯ, ПЕРЕНЕСЁННЫЙ ИЗ ПАНЕЛИ (274-4).
//
// 🔒 СТРАНИЦА ШАГА НЕ ПЕРЕПИСАНА: она живёт в `_connect/panel` теми же байтами, что в панели, и
// получает `params` того вида, какого ждёт. Адреса она строит одной функцией `adminHref`, а та
// переписана — поэтому весь мастер переехал внутрь вкладки, не тронув ни одного шага.
export function widget(lang: string): ReactNode {
  return <Ported params={Promise.resolve({ lang })} />
}
