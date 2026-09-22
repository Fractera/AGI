import { CollectionIndex } from '../../_lib/collection-index'
import { collectionMetadata } from '../../_lib/collection-metadata'
import { data } from './_data'
import { content, widget } from './_components'
import { PAGES } from './_list.generated'

// ГРУППА «ЗАПУСК ПРОЕКТА» (274-2) — экран выбора пути, перенесённый из панели один в один.
export const generateMetadata = collectionMetadata(data, '/architect')

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionIndex lang={lang} dir="/architect/project-start" page={data} pages={PAGES} content={content(lang)} widget={widget(lang)} />
}
