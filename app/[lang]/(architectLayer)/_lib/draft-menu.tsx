import "server-only"
import type { WorkspaceItem } from '@/lib/content/blocks/types'
import { listDrafts } from '@/lib/agi-items/drafts'
import { addressOf } from '@/lib/agi-items/element-address'
import { ITEM_TREE, TREE_GROUPS, treeLang, treeVisible, type TreePage } from '@/lib/agi-items/item-tree'
import { elementMessengers, elementPassport, hasCatalog } from '@/lib/a2a/element-passport'
import { hasDoc } from '@/lib/agi-items/element-docs'
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
    // 406-4: пункт «Каталог» — только у элемента, чей паспорт объявляет каталог.
    const catalog = hasCatalog(d.id)
    // 463 (владелец 2026-10-12: «…выпадающий список … отдельные страницы а не валить в одну кучу»): «Процесс → Подписки» раскрывается
    // пунктом на каждый внешний сервис элемента (OWN-SERVICE-PROPS/SUBSCRIPTIONS.json), у каждого своя страница.
    const services = elementPassport(d.id)?.subscriptions?.services ?? []
    // 472: разделы H2A/H2H и страницы по флагам паспорта элемента (`messengers`); одна функция и для маршрута.
    const ctx = { catalog, messengers: elementMessengers(d.id) }
    const children = ITEM_TREE.filter((s) => treeVisible(s, ctx)).map((s) => {
      const path = `${dir}/${s.slug}`
      const inside = currentPath.startsWith(`${path}/`)
      // 412-2: пункт документа — только пока его файл есть в папке элемента.
      const visible = (s.pages ?? []).filter((p) => treeVisible(p, ctx) && (!p.doc || hasDoc(d.id, p.doc)))
      const leaf = (p: TreePage): WorkspaceItem => {
        const pagePath = `${path}/${p.slug}`
        if (s.slug === 'process' && p.slug === 'subscriptions' && services.length) {
          const kids = services.map((x) => ({ label: x.name, href: at(`${pagePath}/${x.id}`), active: `${pagePath}/${x.id}` === currentPath }))
          return { label: p.words[l].title, href: at(pagePath), active: pagePath === currentPath, open: currentPath.startsWith(pagePath), children: kids }
        }
        return { label: p.words[l].title, href: at(pagePath), active: pagePath === currentPath }
      }
      // 435-3: страницы одной группы — раскрывающийся пункт без своей страницы, на месте первой из них; открыт, когда человек внутри.
      const pages: WorkspaceItem[] = []
      for (const p of visible) {
        if (!p.group) { pages.push(leaf(p)); continue }
        if (pages.some((x) => x.label === TREE_GROUPS[p.group!][l])) continue
        const members = visible.filter((m) => m.group === p.group).map(leaf)
        pages.push({ label: TREE_GROUPS[p.group][l], open: members.some((m) => m.active), children: members })
      }
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
