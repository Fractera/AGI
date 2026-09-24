import {
  AppWindow, Blocks, Clock, FlaskConical, Globe, Hammer, IdCard, LayoutTemplate, Package, Palette, Server, Settings,
  Store, ToggleRight, Wrench,
} from 'lucide-react'

// ЗНАЧКИ ЛЕВОГО МЕНЮ (шаг 288-2). Слово владельца 2026-09-24: «Слева от кнопок нужно нарисовать иконке … для корня
// авторизации и данных будет иконка глобус символизирующая интернет все остальные иконки расставь на своё усмотрение».
// Значок раздела — поле `icon` в его `_data/meta.ts` (одно место); здесь только словарь «имя → значок». Глобус — у
// служб, живущих в интернете (сайт, вход, данные); новая служба узла получает его же.
const ICONS = {
  globe: Globe,
  settings: Settings,
  toggle: ToggleRight,
  blocks: Blocks,
  hammer: Hammer,
  clock: Clock,
  palette: Palette,
  server: Server,
  package: Package,
  layout: LayoutTemplate,
  store: Store,
  passport: IdCard,
  flask: FlaskConical,
  wrench: Wrench,
  window: AppWindow,
} as const

export type MenuIconName = keyof typeof ICONS
export const MENU_ICON_NAMES = Object.keys(ICONS) as MenuIconName[]

export function MenuIcon({ name }: { name?: string }) {
  const Icon = name ? ICONS[name as MenuIconName] : undefined
  return Icon ? <Icon size={16} aria-hidden className="shrink-0" /> : null
}
