import { CollectionPage } from '../../_lib/collection-page'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content } from './_components'

// РАЗДЕЛ «Authorization» — `/{lang}/architect/auth`.
//
// 🔒 ТОНКИЙ ВХОД: страница называет свою папку и папку-родителя, отдаёт свои слова
// и свою работающую часть. Меню, раскладка и обработка пустоты — в оболочке.
// Устройство страницы и её правила — в README рядом.
//
// 🔒 РАЗДЕЛ ПЕРВОГО УРОВНЯ БЕЗ ДЕТЕЙ — ЭТО `CollectionPage`, А НЕ `CollectionIndex`.
// Рубрикатор перечисляет детей и берёт их из `_list.generated.ts`, а генератор
// такого списка папке без детей не пишет вовсе (и удаляет устаревший): импорт
// уронил бы сборку. Появятся подразделы — вход меняется на рубрикатор, и это
// одна правка здесь.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect" page={data} content={content(lang)} />
}
