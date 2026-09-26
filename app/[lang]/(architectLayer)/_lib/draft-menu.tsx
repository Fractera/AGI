import "server-only"
import type { WorkspaceItem } from '@/lib/content/blocks/types'
import { listDrafts } from '@/lib/agi-items/drafts'
import { ITEM_TREE, treeLang } from '@/lib/agi-items/item-tree'
import { agiDraftsUi } from '../_i18n/agi-drafts.i18n'
import { CreateDraftButton } from '../_components/create-draft-button.client'
import { ARCHITECT_HOME } from './architect-menu'

// ЧЕРНОВИКИ И КНОПКА «СОЗДАТЬ МИКРОСЕРВИС» В ЛЕВОМ МЕНЮ (314-1). Слово владельца: «в левом меню после кнопки дизайн
// добавляем кнопку создать микро service». Меню слоя собирается из папок при сборке; черновики — данные узла, поэтому их
// пункты вставляются здесь, при отрисовке страницы, и появляются без пересборки (после записи дверь перерисовывает слой).
//
// 🔒 ОТДЕЛЬНЫЙ МОДУЛЬ, А НЕ `architect-menu.ts`: тот читают и не-серверные места (`lib/menu/account-links.ts`,
// сторож маршрутов), а здесь чтение файла с диска.
// 🔒 ЯКОРЬ — ГРУППА `design`. Её нет — кнопка и черновики встают в конец, а не пропадают.

const ANCHOR = 'design'

/** Меню слоя с кнопкой и группами черновиков, вставленными за «Дизайном». */
export function withDrafts(menu: WorkspaceItem[], lang: string, currentPath: string): WorkspaceItem[] {
  const ui = agiDraftsUi(lang)
  const l = treeLang(lang)
  const at = (path: string) => `/${lang}${path}`

  const button: WorkspaceItem = {
    label: ui.create,
    node: <CreateDraftButton lang={lang} label={ui.create} busyLabel={ui.creating} failed={ui.createFailed} />,
  }

  const drafts: WorkspaceItem[] = listDrafts().map((d) => {
    const dir = `${ARCHITECT_HOME}/${d.id}`
    const children = ITEM_TREE.map((s) => {
      const path = `${dir}/${s.slug}`
      return { label: s.words[l].title, href: at(path), active: path === currentPath || currentPath.startsWith(`${path}/`) }
    })
    return {
      label: d.id,
      icon: 'box',
      href: at(dir),
      active: currentPath === dir,
      open: currentPath === dir || currentPath.startsWith(`${dir}/`),
      children,
    }
  })

  const i = menu.findIndex((m) => m.href === at(`${ARCHITECT_HOME}/${ANCHOR}`))
  const cut = i < 0 ? menu.length : i + 1
  return [...menu.slice(0, cut), button, ...drafts, ...menu.slice(cut)]
}
