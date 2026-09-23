import type { SectionRenderer } from '@/sections/contract'
import { DesignColorsLoader } from '@/components/design/design-colors-loader.client'
import { designUi } from '@/components/design/design.i18n'

// РЕДАКТОР ЦВЕТОВ САЙТА (280-6): островок из fractera-next-starter, пришедший видом каталога.
// Слова берутся здесь, на сервере, и уходят островку пропсами — словарь в браузер не грузится.
const WAIT: Record<string, { loading: string; unavailable: string }> = {
  en: {
    loading: 'Asking the site for its colours…',
    unavailable: 'The site did not answer, so its colours are not shown — nothing here would be saved over them.',
  },
  ru: {
    loading: 'Спрашиваю у сайта его цвета…',
    unavailable: 'Сайт не ответил, поэтому его цвета не показаны — поверх них ничего не будет сохранено.',
  },
}

export const designColors: SectionRenderer<'designColors'> = (b, { key: k }) => {
  const w = WAIT[b.lang] ?? WAIT.en
  return <DesignColorsLoader key={k} ui={designUi(b.lang).colors} loading={w.loading} unavailable={w.unavailable} />
}
