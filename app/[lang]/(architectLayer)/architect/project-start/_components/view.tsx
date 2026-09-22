import type { ReactNode } from 'react'
import Ported from '../_launch/panel/page'

// ЭКРАН ВЫБОРА ПУТИ — КОПИЯ ПАНЕЛИ (274-2): две карточки, выбор держится в памяти вкладки.
export function widget(lang: string): ReactNode {
  return <Ported params={Promise.resolve({ lang })} />
}
