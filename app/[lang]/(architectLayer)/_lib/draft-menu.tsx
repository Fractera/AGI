import "server-only"
import type { WorkspaceItem } from '@/lib/content/blocks/types'
import { listDrafts } from '@/lib/agi-items/drafts'
import { addressOf } from '@/lib/agi-items/element-address'
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
// 327 (слово владельца 2026-09-27): «после вкладки ядро добавим горизонтальный сепаратор, под которым слева в бордюр напишем более
// мелким шрифтом нативные AGI ITEMS. После вкладки дизайн добавим сепаратор … кастомные AGI ITEMS. Задача визуально разделить
// меню на зоны». Якорь первой зоны — пункт «Ядро» (`build`); вторая встаёт за «Дизайном», над кнопкой создания.
const CORE = 'build'

/** Разделитель зоны меню: горизонтальная черта и мелкая подпись у левого края. */
function zone(label: string): WorkspaceItem {
  return {
    label,
    node: (
      <div className="mt-2 border-t border-border px-[9px] pt-2 text-[length:var(--fs-small)] text-muted-foreground" data-menu-zone>
        {label}
      </div>
    ),
  }
}

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
    // 325-3: пункт и пути — по адресу элемента в ядре (нет своего — id).
    const slug = addressOf(d.id)
    const dir = `${ARCHITECT_HOME}/${slug}`
    // 320: раздел со страницами раскрывается третьим уровнем (слово владельца 2026-09-27). Раздел «активен» только на
    // своей странице, «открыт» — пока человек на любой его странице: отметка «вы здесь» не стоит в двух местах.
    const children = ITEM_TREE.map((s) => {
      const path = `${dir}/${s.slug}`
      const inside = currentPath.startsWith(`${path}/`)
      const pages = (s.pages ?? []).map((p) => {
        const pagePath = `${path}/${p.slug}`
        return { label: p.words[l].title, href: at(pagePath), active: pagePath === currentPath }
      })
      return pages.length > 0
        ? { label: s.words[l].title, href: at(path), active: path === currentPath, open: path === currentPath || inside, children: pages }
        : { label: s.words[l].title, href: at(path), active: path === currentPath || inside }
    })
    return {
      label: slug,
      icon: 'box',
      href: at(dir),
      active: currentPath === dir,
      open: currentPath === dir || currentPath.startsWith(`${dir}/`),
      children,
    }
  })

  const i = menu.findIndex((m) => m.href === at(`${ARCHITECT_HOME}/${ANCHOR}`))
  const cut = i < 0 ? menu.length : i + 1
  const withCustom = [...menu.slice(0, cut), zone(ui.zoneCustom), button, ...drafts, ...menu.slice(cut)]
  // Нет пункта «Ядро» — первой зоны нет: подпись над пустотой хуже её отсутствия.
  const c = withCustom.findIndex((m) => m.href === at(`${ARCHITECT_HOME}/${CORE}`))
  return c < 0 ? withCustom : [...withCustom.slice(0, c + 1), zone(ui.zoneNative), ...withCustom.slice(c + 1)]
}
