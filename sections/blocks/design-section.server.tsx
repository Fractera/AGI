import type { SectionRenderer } from '@/sections/contract'
import { DesignSectionLoader } from '@/components/design/design-section-loader.client'
import { designUi } from '@/components/design/design.i18n'

// РЕДАКТОР ОФОРМЛЕНИЯ САЙТА (280-6): четыре островка из fractera-next-starter — цвета, шрифты,
// типографика, форма, — пришедшие ОДНИМ видом каталога с параметром раздела. Слова берутся здесь, на
// сервере, и уходят островку пропсами.
const WAIT: Record<string, { loading: string; unavailable: string }> = {
  en: {
    loading: 'Asking the site for its design settings…',
    unavailable: 'The site did not answer, so its design settings are not shown — nothing here would be saved over them.',
  },
  ru: {
    loading: 'Спрашиваю у сайта его оформление…',
    unavailable: 'Сайт не ответил, поэтому его оформление не показано — поверх него ничего не будет сохранено.',
  },
}

export const designSection: SectionRenderer<'designSection'> = (b, { key: k }) => {
  const w = WAIT[b.lang] ?? WAIT.en
  return <DesignSectionLoader key={k} section={b.section} ui={designUi(b.lang)} loading={w.loading} unavailable={w.unavailable} />
}
