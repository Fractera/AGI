import type { Block, WorkspaceItem } from '@/lib/content/blocks/types'
import { ArchitectPage } from '../../_lib/architect-page'
import { architectBuildUi } from '../../_i18n/architect-build.i18n'
import { ARCHITECT_BUILD_HOME } from '../../_lib/architect-menu'

// СТРАНИЦА ГРУППЫ «СТРОИТЕЛЬСТВО» — `/{lang}/architect/build` (253).
//
// ✗ ОПЛАЧЕНО ВОПРОСОМ ВЛАДЕЛЬЦА: он открыл `/ru/architect/build` и получил 404.
// Формально это было задумано — адресом группы служил её первый раздел, — но
// «честный 404 под пальцем» и «человек уткнулся в тупик» на экране неотличимы.
//
// 🔒 УСТРОЕНА ТАК ЖЕ, КАК ВХОД В СЛОЙ, И ЭТО ТРЕБОВАНИЕ ВЛАДЕЛЬЦА, А НЕ УДОБСТВО:
// «ты сделаешь также, как делал контент для группы страниц архитектор, то есть
// будет верхнее меню, которое будет обеспечивать вертикальную прокрутку».
// Значит: разделы — раскрытые блоки с заголовком своего уровня, верхний ряд —
// якоря на них, плавность даёт `scroll-smooth` на корне документа, без скрипта.
//
// 🔒 ЯКОРЬ ЗАДАН ЯВНО, А НЕ ВЫВЕДЕН ИЗ ЗАГОЛОВКА: генератор оставляет от русского
// заголовка нечитаемый хеш, и ссылка на такой адрес рвётся при первой правке слов.
//
// 🛑 СОДЕРЖИМОЕ — МАКЕТ. Слова живут в `_i18n/architect-build.i18n.ts`; владелец
// проверяет дизайн и даст настоящий текст отдельно. Заменяется словарь, не эта
// страница.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectBuildUi(lang)

  const children: Block[] = ui.topics.flatMap((t): Block[] => [
    { kind: 'h3', text: t.title, id: t.anchor },
    { kind: 'p', text: t.text },
    ...(t.points ? [{ kind: 'list' as const, items: t.points }] : []),
  ])

  const tabs: WorkspaceItem[] = ui.topics.map((t) => ({ label: t.tab, href: `#${t.anchor}` }))

  return (
    <ArchitectPage
      lang={lang}
      path={ARCHITECT_BUILD_HOME}
      group="build"
      pageTitle={ui.title}
      pageLead={ui.lead}
      title={ui.sectionTitle}
      tabs={tabs}
      children={children}
    />
  )
}
