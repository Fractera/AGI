import { createContentPage } from '@/lib/content/create-content-page'
import { homePage, homeLead, data } from '../_data'
import { meta } from '../_data/meta'
import { PostBody } from '@/components/content-page/post-body'
import { SecurityOrbit } from '../../../_widgets/static/security-orbit'

// CORE ПОКАЗЫВАЕТ СОДЕРЖИМОЕ ГЛАВНОЙ — слово владельца 2026-09-21: «Верхнем меню
// сделаем страницу: стартер, и в эту страницу перенесём то что сейчас на главной»;
// главная при этом остаётся прежней, пока для неё не придёт новый лендинг. Текст и
// виджет берутся из главной, а не копируются: одна правка — оба адреса. `noindex` —
// пока у двух адресов один текст; когда главная станет лендингом, признак снимается.
const page = createContentPage({
  data,
  resolve: homePage,
  meta,
  noindex: true,
  titleInBody: true,
  afterHero: (lang: string) => (
    <>
      <div data-app-column className="px-6">
        <PostBody blocks={homeLead(lang)} lang={lang} />
      </div>
      <SecurityOrbit lang={lang} />
    </>
  ),
})

export const generateMetadata = page.generateMetadata
export default page.Page
