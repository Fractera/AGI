import type { WorkspaceItem } from '@/lib/content/blocks/types'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'

// ЕДИНСТВЕННЫЙ ИСТОЧНИК РАЗДЕЛОВ СЛОЯ АРХИТЕКТОРА (236-1).
//
// 🔒 ЗАЧЕМ ОН ЕСТЬ. Разделов десять, а страниц столько же, и каждая обязана
// показать ОДНО И ТО ЖЕ меню. Написанное в каждой странице руками, оно разойдётся
// молча: добавили раздел — в девяти он есть, в десятой нет, и ни одна проверка не
// упадёт. Поэтому список живёт здесь, а страница говорит только СВОЙ адрес и
// получает меню с уже отмеченным пунктом.
// Это тот же закон, что у оглавления главной: оно строится из блоков `h2`, а не
// объявляется вторым списком рядом.
//
// 🔒 ДВА УРОВНЯ МЕНЮ ЛОЖАТСЯ НА ДВА ПОЛЯ ОДНОГО ВИДА, А НЕ НА ДВА ВИДА.
// Левое меню вида `workspace` — ГРУППЫ; его необязательный верхний ряд `tabs` —
// РАЗДЕЛЫ открытой группы. Ровно тот «второй случай», ради которого `tabs`
// сделан полем: два отдельных вида разошлись бы на первой же правке темы.
//
// 🛑 АДРЕС, А НЕ ПАРАМЕТР ЗАПРОСА — прямое слово владельца 2026-09-18 о показанном
// образце: «важно будет отличать, что в примере страницы вложенностью глубины не
// меняется, а используется вместо лица динамические параметры. Вот это нам точно
// не нужно — каждый раздел создавать отдельную страницу». Причина техническая, а
// не вкусовая: у страницы с `?section=…` нет собственного адреса, её нельзя
// предрендерить и нельзя дать ссылкой, и она обязана решать на лету, что
// показать, — то есть уходит в динамику.

/** Ключ группы левого меню. */
export type ArchitectGroup = 'passport' | 'tools' | 'build'

/**
 * Адреса без языка. Язык подставляется в момент сборки меню: маршрут слоя живёт
 * внутри `[lang]` с первой минуты, и второго набора адресов «для английского» не
 * существует.
 */
const PASSPORT = '/architect/passport'

const TOOLS = [
  { key: 'toolsRequired', path: '/architect/tools/required' },
  { key: 'toolsRecommended', path: '/architect/tools/recommended' },
] as const

const BUILD = [
  { key: 'buildSubscription', path: '/architect/build/subscription' },
  { key: 'buildTerminal', path: '/architect/build/terminal' },
  { key: 'buildDocs', path: '/architect/build/docs' },
  { key: 'buildEvolution', path: '/architect/build/evolution' },
  { key: 'buildAgent', path: '/architect/build/agent' },
  { key: 'buildAgentSettings', path: '/architect/build/agent-settings' },
  { key: 'buildTelegram', path: '/architect/build/telegram' },
] as const

/**
 * Все адреса слоя одним списком — для сторожа маршрутов (236-5) и для любого
 * обхода. Собирается из тех же констант, поэтому забыть здесь раздел нельзя.
 */
export const ARCHITECT_PATHS: readonly string[] = [
  PASSPORT,
  ...TOOLS.map((s) => s.path),
  ...BUILD.map((s) => s.path),
]

/**
 * Левое меню: три группы.
 *
 * 🔒 У ГРУППЫ АДРЕС ЕЁ ПЕРВОГО РАЗДЕЛА, А НЕ СВОЙ СОБСТВЕННЫЙ. Отдельная страница
 * группы была бы либо вторым адресом того же содержимого, либо честным 404 при
 * нажатии на пункт. Человеку нужно попасть внутрь, а не на перечисление того,
 * что он и так видит сверху.
 */
export function architectMenu(lang: string, currentPath: string): WorkspaceItem[] {
  const ui = architectLayerUi(lang)
  const at = (path: string) => `/${lang}${path}`

  return [
    {
      label: ui.groups.passport,
      href: at(PASSPORT),
      active: currentPath === PASSPORT,
    },
    {
      label: ui.groups.tools,
      href: at(TOOLS[0].path),
      // Группа активна, пока человек внутри ЛЮБОГО её раздела: иначе, открыв
      // «рекомендуемые», он видел бы меню без единого отмеченного пункта.
      active: TOOLS.some((s) => s.path === currentPath),
    },
    {
      label: ui.groups.build,
      href: at(BUILD[0].path),
      active: BUILD.some((s) => s.path === currentPath),
    },
  ]
}

/**
 * Верхний ряд: разделы открытой группы. У «Паспорта» разделов нет — возвращается
 * `undefined`, и вид рисуется без верхнего ряда. Это второй случай владельца, и
 * он обслуживается тем же видом.
 */
export function architectTabs(
  lang: string,
  group: ArchitectGroup,
  currentPath: string,
): WorkspaceItem[] | undefined {
  if (group === 'passport') return undefined
  const ui = architectLayerUi(lang)
  const list = group === 'tools' ? TOOLS : BUILD

  return list.map((s) => ({
    label: ui.sections[s.key],
    href: `/${lang}${s.path}`,
    active: s.path === currentPath,
  }))
}
