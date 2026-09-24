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

// 280-11a: плашка после «Сохранить» и напоминание о начальной стадии (слово владельца 2026-09-24).
const DEPLOY: Record<string, { hint: string; savedTitle: string; savedText: string; savedButton: string }> = {
  en: {
    hint: 'Settle the design early: every change is applied by a deployment, and a deployment rebuilds every part of the project that uses these settings.',
    savedTitle: 'Saved. The site does not show it yet.',
    savedText: 'Design changes are applied by a deployment, not by saving. Make all the changes you need first, then deploy once — each deployment rebuilds the project.',
    savedButton: 'Go to deployments',
  },
  ru: {
    hint: 'Оформление дешевле решить в начале: каждое изменение применяется развёртыванием, а развёртывание пересобирает все части проекта, которые пользуются этими настройками.',
    savedTitle: 'Сохранено. На сайте этого пока нет.',
    savedText: 'Изменения оформления применяются развёртыванием, а не сохранением. Сначала сделайте все нужные правки, потом разверните один раз — каждое развёртывание пересобирает проект.',
    savedButton: 'Перейти к развёртываниям',
  },
}

export const designSection: SectionRenderer<'designSection'> = (b, { key: k }) => {
  const w = WAIT[b.lang] ?? WAIT.en
  const d = DEPLOY[b.lang] ?? DEPLOY.en
  const deploy = { ...d, deployHref: `/${b.lang}/architect/build/deployments` }
  return <DesignSectionLoader key={k} section={b.section} ui={designUi(b.lang)} loading={w.loading} unavailable={w.unavailable} deploy={deploy} />
}
