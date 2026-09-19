import { CollectionIndex } from '../../_lib/collection-index'
import { data } from './_data'
import { PAGES } from './_list.generated'

// РУБРИКАТОР ГРУППЫ «Домен и хостинг» (254).
//
// 🔒 СТРАНИЦА НЕ ЗНАЕТ СВОИХ РАЗДЕЛОВ И НЕ МОЖЕТ ИХ УЗНАТЬ ИНАЧЕ: список
// приходит из `_list.generated.ts`, который сборка складывает из папок рядом.
// Добавили папку — строка появилась и здесь, и в подменю слева.
//
// 🔒 СВОИ СЛОВА ОНА БЕРЁТ ИЗ СВОЕЙ ЖЕ ПАПКИ — `_data`. Группа устроена так же,
// как раздел; различает их только глубина.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <CollectionIndex lang={lang} dir="/architect/hosting" page={data} pages={PAGES} />
}
