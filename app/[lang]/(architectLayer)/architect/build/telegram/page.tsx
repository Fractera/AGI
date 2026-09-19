import { CollectionPage } from '../../../_lib/collection-page'
import { data } from './_data'

// Раздел коллекции. Тонкий вход: всё о странице — в её папке.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/build" page={data} />
}
