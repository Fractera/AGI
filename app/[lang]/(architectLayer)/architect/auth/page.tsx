import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'
import { PAGES } from './_list.generated'

// РУБРИКАТОР ГРУППЫ «Authorization» — `/{lang}/architect/auth`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и отдаёт три вещи — свои слова
// (`_data`), свою работающую часть (`_components`) и список детей, порождённый
// сборкой. Ничего из этого она не знает сама. Устройство — в README рядом.
//
// 🪦 ДО 264-3 ЗДЕСЬ СТОЯЛ `CollectionPage`, И ЭТО БЫЛО ВЕРНО: у папки не было
// детей, а генератор не пишет `_list.generated.ts` бездетной папке — импорт
// такого списка уронил бы сборку. Появились пять подразделов — появился и
// список, и вход стал рубрикатором. Ровно эта правка описана в README как
// «Growing children», и больше делать было нечего.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <CollectionIndex
      lang={lang}
      dir="/architect/auth"
      page={data}
      pages={PAGES}
      content={content(lang)}
    />
  )
}
