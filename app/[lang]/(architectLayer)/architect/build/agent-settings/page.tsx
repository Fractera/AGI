import { ArchitectPage } from '../../../_lib/architect-page'
import { architectLayerUi } from '../../../_i18n/architect-layer.i18n'

// Раздел слоя архитектора (236). Тонкий вход: страница называет только себя —
// адрес, группу и своё имя. Меню, верхний ряд и раскладка приходят из оболочки.
// Содержимого нет намеренно: слово владельца «empty pages with correct i18n
// structure» — строится раскладка и маршруты, не содержимое.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const ui = architectLayerUi(lang)

  return (
    <ArchitectPage
      lang={lang}
      path="/architect/build/agent-settings"
      group="build"
      title={ui.sections.buildAgentSettings}
    />
  )
}
