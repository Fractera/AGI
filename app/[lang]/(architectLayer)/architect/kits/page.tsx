import { CollectionPage } from '../../_lib/collection-page'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'

// РАЗДЕЛ «Ready-made kits» — `/{lang}/architect/kits` (270).
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и папку-родителя, отдаёт свои слова
// и свою работающую часть. Меню, раскладка и обработка пустоты — в оболочке.
// Устройство страницы и её правила — в README рядом.
// 🔒 ДЕТЕЙ У РАЗДЕЛА НЕТ: готовые решения — полосы аккордеона на этой странице, а не
// отдельные страницы (образец — раздел `data` до шага 269).
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect" page={data} content={content(lang)} />
}
