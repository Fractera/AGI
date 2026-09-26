import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArchitectPage } from '../../../_lib/architect-page'
import { ARCHITECT_HOME } from '../../../_lib/architect-menu'
import { agiDraftsUi } from '../../../_i18n/agi-drafts.i18n'
import { DraftCards } from '../../../_components/draft-cards'
import { DeleteDraftButton } from '../../../_components/delete-draft-button.client'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'
import { draftAddress, getDraft } from '@/lib/agi-items/drafts'
import { findTreePage, treeLang } from '@/lib/agi-items/item-tree'

// ОДНА СТРАНИЦА НА ВСЕ АДРЕСА ВСЕХ ЧЕРНОВИКОВ (314-1): `/architect/<id>`, `/architect/<id>/<раздел>`,
// `/architect/<id>/<раздел>/<страница>`. Дерево — `lib/agi-items/item-tree.ts`, черновики — `data/agi-drafts.json`.
//
// 🔒 НИ ОДНОГО НОВОГО ФАЙЛА НА НОВЫЙ ЧЕРНОВИК: адреса отдаются по первому запросу и кэшируются как весь слой (ISR); создание и
// удаление перерисовывают слой дверью. Поэтому группа появляется и исчезает без пересборки.
// 🔒 ПАПКА С ТОЧНЫМ ИМЕНЕМ ВАЖНЕЕ ЭТОЙ (правило Next): `architect/root`, `architect/blocks` и остальные разделы сюда не попадают.
// Черновика нет — 404, а не пустая группа с чужим именем.
// 🔒 В ПОИСК НЕ ИДЁТ: черновик — рабочее место, а не страница продукта.

type Params = { lang: string; item: string; page?: string[] }

function resolve(p: Params) {
  const draft = getDraft(p.item)
  if (!draft) return null
  const path = p.page ?? []
  if (path.length === 0) return { draft, found: null }
  const found = findTreePage(path)
  return found ? { draft, found } : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params
  const r = resolve(p)
  const l = treeLang(p.lang)
  const words = r?.found ? (r.found.page ?? r.found.section).words[l] : null
  return {
    title: words ? `${words.title} — ${p.item}` : p.item,
    description: words?.lead,
    robots: { index: false, follow: false },
  }
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params
  const r = resolve(p)
  if (!r) notFound()

  const { lang, item } = p
  const l = treeLang(lang)
  const ui = agiDraftsUi(lang)
  const address = draftAddress(item)
  const dir = `${ARCHITECT_HOME}/${item}`

  const bar = (
    <div className="mb-4 flex items-center justify-between gap-3">
      <span className="rounded-md border border-border px-2 py-0.5 text-[length:var(--fs-small)] text-muted-foreground">{ui.draftBadge}</span>
      <DeleteDraftButton lang={lang} id={item} address={address} ui={ui} dialogUi={appDialogUi(lang)} />
    </div>
  )

  // Главная группы — две карточки, как у корня.
  if (!r.found) {
    return (
      <ArchitectPage
        lang={lang}
        path={dir}
        title={address}
        pageTitle={address}
        widget={<>{bar}<DraftCards address={address} ui={ui} /></>}
      />
    )
  }

  const { section, page } = r.found
  const words = (page ?? section).words[l]
  const sectionPath = `${dir}/${section.slug}`
  const path = page ? `${sectionPath}/${page.slug}` : sectionPath

  // Страница раздела перечисляет свои страницы: третьего уровня в левом меню нет (закон вложенности меню).
  const list = !page && section.pages && section.pages.length > 0 ? (
    <nav aria-label={ui.sectionPages} className="flex flex-col gap-2">
      <p className="text-[length:var(--fs-small)] font-medium text-muted-foreground">{ui.sectionPages}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {section.pages.map((sp) => (
          <li key={sp.slug}>
            <Link
              href={`/${lang}${sectionPath}/${sp.slug}`}
              className="flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors hover:bg-muted/60"
            >
              <span className="font-medium text-foreground">{sp.words[l].title}</span>
              <span className="text-[length:var(--fs-small)] text-muted-foreground">{sp.words[l].lead}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  ) : null

  return (
    <ArchitectPage
      lang={lang}
      path={path}
      title={words.title}
      lead={words.lead}
      pageTitle={address}
      widget={<>{bar}{list}</>}
    />
  )
}
