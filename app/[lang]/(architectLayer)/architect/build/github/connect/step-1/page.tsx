import { CollectionPage } from '../../../../../_lib/collection-page'
import { collectionMetadata } from '../../../../../_lib/collection-metadata'
import { data } from './_data'
import { content, widget } from './_components'

// ШАГ 1 МАСТЕРА ПОДКЛЮЧЕНИЯ РЕПОЗИТОРИЯ (274-4).
export const generateMetadata = collectionMetadata(data, '/architect/build/github/connect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/build/github/connect" page={data} content={content(lang)} widget={widget(lang)} />
}
