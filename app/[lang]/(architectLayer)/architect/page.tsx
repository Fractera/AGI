import type { Block, WorkspaceItem } from '@/lib/content/blocks/types'
import { ArchitectPage } from '../_lib/architect-page'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'
import { architectHomeUi } from '../_i18n/architect-home.i18n'
import { ARCHITECT_HOME } from '../_lib/architect-menu'

// ВХОД В СЛОЙ АРХИТЕКТОРА — страница `/{lang}/architect`.
//
// ✗ ОПЛАЧЕНО ВЛАДЕЛЬЦЕМ: он открыл `/ru/architect` и получил 404. Десять разделов
// слоя работали, а самого входа не существовало — снаружи это неотличимо от
// «слоя нет».
//
// 🔒 РИСУЕТСЯ ТЕМ ЖЕ ВИДОМ, ЧТО И ОСТАЛЬНЫЕ ДЕСЯТЬ — `workspace`. Второй раскладки
// для входа не заводится: она разошлась бы с разделами на первой правке темы.
//
// 🪦 АККОРДЕОН ОТМЕНЁН 2026-09-19 (владелец: «уберём с этой страницы аккордеоны и
// представим страницу в виде раскрытых блоков с заголовками своего уровня и
// описанием»). Свёрнутое здесь мешало: сюда приходят разбираться в своём узле, а
// не открывать полосы по одной.
//
// 🔒 ВЕРХНИЙ РЯД — НАВИГАЦИЯ ПО ЭТОЙ ЖЕ СТРАНИЦЕ, А НЕ КОПИЯ ЛЕВОГО МЕНЮ.
// ✗ Оплачено его прямым указанием: «ошибка, которую ты совершил, — ты
// продублировал это меню и слева, и сверху; это меню предназначено только для
// навигации по странице с плавной прокруткой». Ряд собирается из ТЕХ ЖЕ тем, что
// и разделы ниже, — второго списка не существует, и разойтись им негде.
// Плавность даёт `scroll-smooth` на корне документа, без единой строки скрипта.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectLayerUi(lang)
  const home = architectHomeUi(lang)

  // Разделы страницы: заголовок третьего уровня с явным якорем, текст, список.
  //
  // 🔒 ЯКОРЬ ЗАДАН ЯВНО, А НЕ ВЫВЕДЕН ИЗ ЗАГОЛОВКА. Генератор якорей оставляет от
  // русского заголовка нечитаемый хеш (`h-1f4c…`) — ссылка на такой адрес ничего
  // не говорит человеку и рвётся при первой правке слов.
  const children: Block[] = [
    { kind: 'p', text: home.intro },
    { kind: 'callout', title: home.production.title, text: home.production.text },
    ...home.topics.flatMap((t): Block[] => [
      { kind: 'h3', text: t.title, id: t.anchor },
      { kind: 'p', text: t.text },
      ...(t.points ? [{ kind: 'list' as const, items: t.points }] : []),
    ]),
    { kind: 'note', text: home.outro },
  ]

  const tabs: WorkspaceItem[] = home.topics.map(t => ({ label: t.tab, href: `#${t.anchor}` }))

  return (
    <ArchitectPage
      lang={lang}
      path={ARCHITECT_HOME}
      group="home"
      pageTitle={ui.home.title}
      pageLead={ui.home.lead}
      title={ui.home.sectionTitle}
      tabs={tabs}
      children={children}
    />
  )
}
