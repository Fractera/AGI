import { CollectionPage } from '../../../_lib/collection-page'
import { collectionMetadata } from '../../../_lib/collection-metadata'
import { data } from './_data'
import { content, widget } from './_components'

// СТРАНИЦА ПУТИ ЗАПУСКА ПРОЕКТА (274-2). Тонкий вход: слова — в `_data`, работающая часть — в
// `_components`, а она зовёт перенесённую из панели страницу без единой правки.
export const generateMetadata = collectionMetadata(data, '/architect/project-start')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/project-start" page={data} content={content(lang)} widget={widget(lang)} />
}
