import { ArchitectPage } from '../../_lib/architect-page'
import { architectLayerUi } from '../../_i18n/architect-layer.i18n'

// ПАСПОРТ УЗЛА — первая страница слоя архитектора (236-2).
//
// 🔒 ТОНКИЙ ВХОД: страница называет только СЕБЯ — свой адрес, свою группу и своё
// имя. Меню, верхний ряд и раскладка приходят из оболочки; здесь их нет и быть
// не должно, иначе десять страниц станут десятью источниками одного списка.
//
// 🔒 У ГРУППЫ «ПАСПОРТ» РАЗДЕЛОВ НЕТ, поэтому верхний ряд не рисуется вовсе —
// `architectTabs` возвращает `undefined`. Это второй случай вида `workspace`, и
// он обслуживается тем же видом, а не вторым.
//
// Содержимого пока нет намеренно: слово владельца 2026-09-18 — «empty pages with
// correct i18n structure». Строится раскладка и маршруты, не содержимое.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectLayerUi(lang)

  return (
    <ArchitectPage
      lang={lang}
      path="/architect/passport"
      group="passport"
      title={ui.groups.passport}
    />
  )
}
