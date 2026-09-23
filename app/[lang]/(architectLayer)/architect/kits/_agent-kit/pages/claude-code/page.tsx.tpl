import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content, widget } from './_components'

// РАЗДЕЛ «Claude Code subscription» — `/{lang}/architect/__SERVICE__/__SLUG__`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и папку-родителя, отдаёт свои слова
// и свою работающую часть. Меню, раскладка и обработка пустоты — в оболочке.
// Устройство страницы и её правила — в README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/__SERVICE__')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/__SERVICE__" page={data} content={content(lang)} widget={widget(lang)} />
}
