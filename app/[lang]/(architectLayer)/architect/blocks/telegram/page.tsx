import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content, widget } from './_components'

// РАЗДЕЛ «Telegram bot» — `/{lang}/architect/blocks/telegram`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и папку-родителя, отдаёт свои слова
// и свою работающую часть. Меню, раскладка и обработка пустоты — в оболочке.
// Устройство страницы и её правила — в README рядом.
export const generateMetadata = collectionMetadata(data, '/architect/blocks')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/blocks" page={data} content={content(lang)} widget={widget(lang)} />
}
