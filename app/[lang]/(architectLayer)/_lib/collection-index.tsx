import type { Block, WorkspaceItem } from '@/lib/content/blocks/types'
import { type WorkspacePageData, pagesInOrder, wordsOf } from '@/lib/collection/types'
import { ArchitectPage } from './architect-page'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'

// РУБРИКАТОР ГРУППЫ — страница, которая перечисляет своих детей (254).
//
// 🔒 СПИСОК НЕ ПИШЕТСЯ РУКАМИ НИКОГДА. Он приходит из `_list.generated.ts`,
// который сборка складывает из самих папок. Добавили папку — строка появилась;
// удалили — исчезла. Расходиться списку и диску негде: это одно и то же знание.
//
// 🔒 ГРУППА — ТАКАЯ ЖЕ СТРАНИЦА-ПАПКА, КАК ЕЁ РАЗДЕЛЫ. Свои слова она берёт из
// своего `_data`, а не из общего словаря слоя; различает её и раздел только
// глубина, и потому второй уровень не стоил ни одной строки в сканере.
//
// 🔒 ПОРЯДОК — ПО `meta.order`, А НЕ ПО ИМЕНИ ПАПКИ. У блога эту роль играет
// дата; у страниц слоя даты нет, и без явного поля порядок задавал бы алфавит —
// то есть переименование папки молча перетасовало бы меню.
//
// 🛑 РАЗДЕЛ БЕЗ СЛОВ ВСЁ РАВНО НАЗВАН. Пропускать такие в списке нельзя: пункт
// меню без строки в рубрикаторе есть то самое расхождение двух половин, ради
// которого всё это и строилось.

export function CollectionIndex({
  lang,
  dir,
  page,
  pages,
}: {
  lang: string
  /** Адрес этой папки без языка, например `/architect/tools`. */
  dir: string
  /** Сама группа: её заголовок и подзаголовок лежат в её же `_data`. */
  page: WorkspacePageData
  /** Дети: ровно `PAGES` из порождённого списка этой папки. */
  pages: readonly WorkspacePageData[]
}) {
  const ui = architectLayerUi(lang)
  const words = wordsOf(page, lang)
  const ordered = pagesInOrder(pages)

  // 🔒 СТРОКА РУБРИКАТОРА — `docref`, А НЕ ПУНКТ СПИСКА. У неё есть имя, описание
  // и адрес, то есть ровно то, из чего состоит запись каталога; простой список
  // отдал бы одни имена, и человеку пришлось бы открывать разделы по очереди,
  // чтобы понять, куда ему надо.
  const children: Block[] = ordered.map((p) => {
    const w = wordsOf(p, lang)
    return {
      kind: 'docref',
      title: w.title,
      summary: w.lead ?? ui.emptyLead,
      href: `/${lang}${dir}/${p.meta.slug}`,
      label: ui.openSection,
    }
  })

  // Верхний ряд ведёт в сами разделы. Это единственная страница группы, где такой
  // ряд не дублирует подменю слева, а повторяет то, что лежит прямо под ним.
  const tabs: WorkspaceItem[] = ordered.map((p) => ({
    label: wordsOf(p, lang).title,
    href: `/${lang}${dir}/${p.meta.slug}`,
  }))

  return (
    <ArchitectPage
      lang={lang}
      path={dir}
      pageTitle={words.title}
      pageLead={words.lead}
      title={words.title}
      tabs={tabs}
      children={children}
    />
  )
}
