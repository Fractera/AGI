import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'
import { PAGES } from './_list.generated'

// РУБРИКАТОР ГРУППЫ «Building» — `/{lang}/architect/build`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и отдаёт три вещи — свои слова
// (`_data`), свою работающую часть (`_components`) и список детей, порождённый
// сборкой. Ничего из этого она не знает сама. Устройство — в README рядом.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <CollectionIndex
      lang={lang}
      dir="/architect/build"
      page={data}
      pages={PAGES}
      content={content(lang)}
    />
  )
}
