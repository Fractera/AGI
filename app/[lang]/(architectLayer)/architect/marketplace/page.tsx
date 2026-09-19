import { CollectionIndex } from '../../_lib/collection-index'
import { data } from './_data'
import { PAGES } from './_list.generated'

// РУБРИКАТОР ГРУППЫ «Блокчейн-маркетплейс» (254-7).
//
// 🔒 СПИСОК РАЗДЕЛОВ ПРИХОДИТ ИЗ `_list.generated.ts` — сборка складывает его из
// папок рядом. Эта страница не знает своих детей и не может узнать иначе.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionIndex lang={lang} dir="/architect/marketplace" page={data} pages={PAGES} />
}
