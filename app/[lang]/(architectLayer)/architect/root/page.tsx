import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'
import { PAGES } from './_list.generated'

// РУБРИКАТОР ГРУППЫ «Root» — `/{lang}/architect/root` (280-4).
//
// 🔒 ТОНКИЙ ВХОД, как у «Авторизации»: страница называет свою папку и отдаёт свои слова,
// свою работающую часть и список детей, порождённый сборкой.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <CollectionIndex
      lang={lang}
      dir="/architect/root"
      page={data}
      pages={PAGES}
      content={content(lang)}
    />
  )
}
