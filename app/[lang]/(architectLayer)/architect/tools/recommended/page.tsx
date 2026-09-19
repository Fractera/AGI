import { CollectionPage } from '../../../_lib/collection-page'
import { data } from './_data'

// Раздел «Рекомендуемые инструменты». Устройство — см. соседний `required`.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/tools" page={data} />
}
