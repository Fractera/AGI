import { PostBody } from '@/components/content-page/post-body'
import type { Block } from '@/lib/content/blocks/types'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'
import { architectMenu, architectTabs, type ArchitectGroup } from './architect-menu'
import { OwnerBand } from '../_components/owner-band.client'

// ОБОЛОЧКА СТРАНИЦЫ СЛОЯ АРХИТЕКТОРА (236-2).
//
// 🔒 ОДНА ОБОЛОЧКА НА ДЕСЯТЬ СТРАНИЦ — ПО ТОЙ ЖЕ ПРИЧИНЕ, ПО КОТОРОЙ МЕНЮ ЖИВЁТ
// В ОДНОМ МЕСТЕ. Десять страниц, каждая со своим куском разметки, разойдутся на
// первой же правке вида: у девяти появится новое поле, у десятой нет. Страница
// слоя обязана уметь сказать ровно три вещи — свой адрес, свою группу и своё имя,
// — а всё остальное берётся отсюда.
//
// 🔒 РИСУЕТ `PostBody` — ТОТ ЖЕ, ЧТО РИСУЕТ СТАТЬЮ. Это и есть исполнение закона
// «одно ядро, а не набор частей»: слой архитектора не получает второй системы
// разметки, он получает те же виды каталога под замком. ✗ Именно здесь служба
// памяти ушла в сторону — её экран мастерской собран собственными клиентскими
// островками, и рядом с каталогом видов появилась вторая вёрстка.
//
// 🔒 НИ ОДНОГО ЧТЕНИЯ СЕССИИ, `cookies()` ИЛИ `headers()`. Страница остаётся
// статической; кого пускать, решает замок слоя, а данные отдают двери `/api/*`.

export function ArchitectPage({
  lang,
  path,
  group,
  title,
  children = [],
  lead,
}: {
  lang: string
  /** Адрес БЕЗ языка, ровно как в источнике меню: по нему отмечается активный пункт. */
  path: string
  group: ArchitectGroup
  /** Имя раздела — заголовок правой части. */
  title: string
  /** Содержимое раздела. Пусто — страница показывает своё устройство, и это законно. */
  children?: Block[]
  lead?: string
}) {
  const ui = architectLayerUi(lang)

  const blocks: Block[] = [
    {
      kind: 'workspace',
      menuTitle: ui.menuTitle,
      menu: architectMenu(lang, path),
      tabs: architectTabs(lang, group, path),
      title,
      lead: lead ?? ui.emptyLead,
      children,
    },
  ]

  return (
    <>
      <OwnerBand text={ui.ownerBand} />
      <PostBody blocks={blocks} lang={lang} />
    </>
  )
}
