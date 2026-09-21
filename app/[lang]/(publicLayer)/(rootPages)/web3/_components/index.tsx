import { createContentPage } from '@/lib/content/create-content-page'
import { homePage, homeLead, data } from '../_data'
import { meta } from '../_data/meta'
import { PostBody } from '@/components/content-page/post-body'

// WEB3 ПОКА ПОКАЗЫВАЕТ ТЕКСТ СТРАНИЦЫ AGI — слово владельца 2026-09-21: «добавим
// страницу web3, пока у нас нет контента положи туда тот же самый контент который
// у нас находится на странице AGI». Данные — копия в `../_data` (см. её шапку): соседняя
// папка не импортируется. `noindex` — два адреса с одним текстом поисковик считает
// дублем. Свой текст появится — копия и признак меняются здесь.
const page = createContentPage({
  data,
  resolve: homePage,
  meta,
  noindex: true,
  titleInBody: true,
  afterHeader: (lang: string) => <PostBody blocks={homeLead(lang)} lang={lang} />,
})

export const generateMetadata = page.generateMetadata
export default page.Page
