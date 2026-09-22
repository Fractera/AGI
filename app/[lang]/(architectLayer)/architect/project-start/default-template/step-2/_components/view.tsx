import type { ReactNode } from 'react'
import Ported from '../../../_launch/panel/default-template/step-2/page'

// ПЕРЕНЕСЁННАЯ СТРАНИЦА ПАНЕЛИ, ВСТАВЛЕННАЯ В НАШУ (274-2).
//
// 🔒 КОПИЯ НЕ ПРАВИТСЯ (слово владельца 2026-09-22: «перенести один к одному»): она живёт в `_launch/panel`
// и получает `params` ровно того вида, какого ждёт. Наша оболочка рисует шапку и меню, её — сам шаг.
export function widget(lang: string): ReactNode {
  return <Ported params={Promise.resolve({ lang })} />
}
