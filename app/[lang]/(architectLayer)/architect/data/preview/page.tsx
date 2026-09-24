import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'

export const generateMetadata = collectionMetadata(data, '/architect/data')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/data" page={data} content={content(lang)} />
}
