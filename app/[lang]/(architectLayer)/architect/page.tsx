import { ArchitectPage } from '../_lib/architect-page'
import { architectLayerUi } from '../_i18n/architect-layer.i18n'
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
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectLayerUi(lang)

  return (
    <ArchitectPage
      lang={lang}
      path={ARCHITECT_HOME}
      group="home"
      title={ui.home.title}
      lead={ui.home.lead}
      children={[{ kind: 'p', text: ui.home.body }]}
    />
  )
}
