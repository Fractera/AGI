import { CollectionPage } from '../../../_lib/collection-page'
import { data } from './_data'

// Раздел «Обязательные инструменты». Тонкий вход: страница называет только свою
// папку — слова, порядок и имя приходят из `_data`, а раскладка из оболочки.
//
// 🔒 ВСЕ ЕЁ СВЕДЕНИЯ ЛЕЖАТ РЯДОМ, В ОДНОЙ ПАПКЕ (254). Прежде страница брала имя
// из общего словаря слоя, а свой адрес — из рукописного массива в меню: три
// места на одну страницу, и забытое третье ломалось молча.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionPage lang={lang} dir="/architect/tools" page={data} />
}
