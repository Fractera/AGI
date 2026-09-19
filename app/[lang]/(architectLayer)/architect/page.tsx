import type { Block } from '@/lib/content/blocks/types'
import { ArchitectPage } from '../_lib/architect-page'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'
import { architectHomeUi } from '../_i18n/architect-home.i18n'
import { ARCHITECT_HOME } from '../_lib/architect-menu'

// ВХОД В СЛОЙ АРХИТЕКТОРА — страница `/{lang}/architect` (240).
//
// ✗ ОПЛАЧЕНО ВЛАДЕЛЬЦЕМ: он открыл `/ru/architect` и получил 404. Десять
// разделов слоя работали, а самого входа не существовало — в 236 строились
// разделы, и вход в список не попал. Снаружи это неотличимо от «слоя нет».
//
// 🔒 РИСУЕТСЯ ТЕМ ЖЕ ВИДОМ, ЧТО И ОСТАЛЬНЫЕ ДЕСЯТЬ — `workspace` с верхним рядом,
// то есть образец `workspace02` каталога видов. Второй раскладки для входа не
// заводится: она разошлась бы с разделами на первой же правке темы.
//
// 🔒 ПЕРЕЧНЯ РАЗДЕЛОВ В СОДЕРЖИМОМ НЕТ НАМЕРЕННО. Список живёт в одном месте —
// `_lib/architect-menu.ts`, — и виден человеку слева и сверху. Написанный здесь
// в третий раз, он разошёлся бы молча: добавили раздел, в меню он есть, в тексте
// входа нет, и ничего не падает.
//
// 🔒 ЗАГОЛОВОК И ПОДЗАГОЛОВОК ПРОДИКТОВАНЫ ВЛАДЕЛЬЦЕМ 2026-09-19 и говорят о
// ГРУППЕ страниц, а не о конкретном разделе: «здесь вы управляете строительством
// этого микросервиса и устанавливаете связи с другими микросервисами вашего
// приложения, управляете видимостью вашего микросервиса в глобальной видимости
// блокчейн-архитектуры Fractera». Мой прежний текст о слое отменён им же —
// собственного содержимого у входа больше нет, и это законное состояние: строится
// раскладка, а не наполнение.
// 🔒 СОДЕРЖИМОЕ СОБРАНО ИЗ ВИДОВ КАТАЛОГА, А НЕ ИЗ СОБСТВЕННОЙ РАЗМЕТКИ (244-2).
// Ни одного `<div>` с классами здесь нет намеренно: страница слоя пользуется тем
// же набором видов, что и статья, — это и есть исполнение закона «одно ядро, а не
// набор частей». Появись тут своя вёрстка, рядом с каталогом выросла бы вторая
// система разметки, и первая же правка темы развела бы их.
//
// 🛑 УСЛОВИЕ ПРОДАКШНА СТОИТ ДО АККОРДЕОНА И НЕ СВОРАЧИВАЕТСЯ. Свёрнутое не
// читают, а это то, что человек обязан прочесть: либо авторизация, либо снос
// этих страниц. В аккордеоне живут подробности, а не условия.
function homeBlocks(lang: string): Block[] {
  const t = architectHomeUi(lang)
  const { topics } = t

  return [
    { kind: 'p', text: t.intro },
    { kind: 'callout', title: t.production.title, text: t.production.text },

    // 🔒 БЛОКЧЕЙН-ВИДИМОСТЬ СТОИТ ВЫШЕ ВСЕХ ПОДРОБНОСТЕЙ И НЕ СВОРАЧИВАЕТСЯ.
    // ✗ оплачено дважды: владелец дважды указал, что я не раскрыл это, хотя «это
    // сердце проекта… основная часть проекта — возможность пользователя поделиться
    // своим опытом через микросервис, доступный в глобальной сети». Первый раз я
    // свёл тему к строке в аккордеоне, второй — оставил её там же. Свёрнутое не
    // читают, а это то, ради чего продукт существует.
    //
    // 🔒 ЗАГОЛОВОК РАЗДЕЛА РИСУЕТ САМ `flow` — своей шапкой (`SectionHead`).
    // Отдельный `h2` рядом дал бы ДВА заголовка подряд об одном и том же: ровно
    // тот дефект, который владелец нашёл на главной («две одинаковые кнопки
    // подряд» и «Что дальше?» перед «Три шага»).
    {
      kind: 'flow',
      badge: t.market.badge,
      title: t.market.title,
      note: t.market.lead,
      steps: t.market.steps,
    },
    { kind: 'statement', text: t.market.closing },

    {
      kind: 'accordion',
      title: t.moreTitle,
      lead: t.moreLead,
      children: [
        {
          kind: 'accordionItem',
          summary: topics.agent.summary,
          children: [
            { kind: 'p', text: topics.agent.text },
            { kind: 'list', items: topics.agent.points },
          ],
        },
        {
          kind: 'accordionItem',
          summary: topics.languages.summary,
          children: [
            { kind: 'p', text: topics.languages.text },
            { kind: 'list', items: topics.languages.points },
          ],
        },
        {
          kind: 'accordionItem',
          summary: topics.performance.summary,
          children: [{ kind: 'p', text: topics.performance.text }],
        },
        {
          kind: 'accordionItem',
          summary: topics.auth.summary,
          children: [{ kind: 'p', text: topics.auth.text }],
        },
        {
          kind: 'accordionItem',
          summary: topics.data.summary,
          children: [{ kind: 'p', text: topics.data.text }],
        },
        {
          kind: 'accordionItem',
          summary: topics.design.summary,
          children: [
            { kind: 'p', text: topics.design.text },
            { kind: 'list', items: topics.design.points },
          ],
        },
        {
          kind: 'accordionItem',
          summary: topics.network.summary,
          children: [
            { kind: 'p', text: topics.network.text },
            { kind: 'list', items: topics.network.points },
          ],
        },
      ],
    },
    { kind: 'note', text: t.outro },
  ]
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectLayerUi(lang)

  return (
    <ArchitectPage
      lang={lang}
      path={ARCHITECT_HOME}
      group="home"
      // 🔒 ЗАГОЛОВОК САМОЙ СТРАНИЦЫ ПЕРЕЕХАЛ НАВЕРХ, НАД РАБОЧИМ ЭКРАНОМ (решение
      // владельца 2026-09-19). Внутри экрана остаётся имя ОТКРЫТОГО РАЗДЕЛА — у
      // входа это «Обзор»: то, что человек сейчас видит в правой колонке.
      pageTitle={ui.home.title}
      pageLead={ui.home.lead}
      title={ui.home.sectionTitle}
      children={homeBlocks(lang)}
    />
  )
}
