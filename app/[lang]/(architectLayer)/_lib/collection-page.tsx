import type { Block, WorkspaceItem } from '@/lib/content/blocks/types'
import { type WorkspacePageData, wordsOf } from '@/lib/collection/types'
import { ArchitectPage } from './architect-page'

// СТРАНИЦА КОЛЛЕКЦИИ — оболочка для страницы, которая живёт папкой (254).
//
// 🔒 ЧТО ОНА ДЕЛАЕТ И ЧЕГО НЕ ДЕЛАЕТ. Она превращает ДАННЫЕ папки в блоки
// каталога и отдаёт их общей оболочке слоя. Второй раскладки здесь не заводится:
// `ArchitectPage` по-прежнему единственная, и всё, что она умеет, доступно и
// странице-папке.
//
// 🔒 СТРАНИЦА НАЗЫВАЕТ ТОЛЬКО СВОЮ ПАПКУ И ПАПКУ-РОДИТЕЛЯ. Адрес складывается
// здесь (`dir` + `meta.slug`), поэтому переименование раздела — это
// переименование папки, а не правка адреса в трёх местах.
//
// 🛑 ГРУППА ВЫВОДИТСЯ ИЗ АДРЕСА, А НЕ ПЕРЕДАЁТСЯ СТРАНИЦЕЙ. Переданная руками,
// она разошлась бы с местом папки на диске — и меню отметило бы не ту группу,
// ничего при этом не сломав.

export function CollectionPage({
  lang,
  dir,
  page,
}: {
  lang: string
  /** Адрес папки-родителя без языка, например `/architect/tools`. */
  dir: string
  page: WorkspacePageData
}) {
  const words = wordsOf(page, lang)
  const path = `${dir}/${page.meta.slug}`
  const topics = words.topics ?? []

  // Темы страницы: заголовок третьего уровня с явным якорем, текст, список.
  const children: Block[] = topics.flatMap((t): Block[] => [
    { kind: 'h3', text: t.title, id: t.anchor },
    { kind: 'p', text: t.text },
    ...(t.points ? [{ kind: 'list' as const, items: t.points }] : []),
  ])

  // Верхний ряд — навигация ПО ЭТОЙ странице. Тем нет — ряда нет вовсе, и это
  // законное состояние раздела, у которого ещё нет содержимого.
  const tabs: WorkspaceItem[] | undefined =
    topics.length > 0 ? topics.map((t) => ({ label: t.tab, href: `#${t.anchor}` })) : undefined

  return (
    <ArchitectPage
      lang={lang}
      path={path}
      title={words.title}
      lead={words.lead}
      tabs={tabs}
      children={children}
    />
  )
}
