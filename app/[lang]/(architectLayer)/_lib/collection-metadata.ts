import type { Metadata } from 'next'
import { type WorkspacePageData, wordsOf } from '@/lib/collection/types'
import { buildAlternates, urlFor } from '@/lib/seo/alternates'
import { brand } from '@/lib/brand'
import { architectLayerIsPublic } from './collection-visibility'

// МЕТАДАННЫЕ СТРАНИЦЫ КОЛЛЕКЦИИ — ОДНА ФАБРИКА НА ВСЕ СТРАНИЦЫ (255).
//
// ✗ ОПЛАЧЕНО ИЗМЕРЕНИЕМ, А НЕ ДОГАДКОЙ. Перед тем как описывать SEO в README
// страницы, я спросил сам сайт — и получил ответ, которого не ожидал:
//
//   $ curl .../ru/architect/tools | grep '<title>\|robots'
//   <title>Fractera — Agentic Engineering Infrastructure</title>
//   <meta name="robots" content="index, follow"/>
//
// То есть у страницы слоя НЕ БЫЛО своего заголовка — во вкладке и в выдаче стояло
// имя сайта, — и при этом весь слой объявлял себя индексируемым, хотя чужому он
// отвечает 404. Хуже обоих дефектов по отдельности: набор адресов, обещанных
// поисковику и недоступных человеку, и есть определение дорвея.
//
// 🔒 ФАБРИКА, А НЕ КОПИЯ В КАЖДОЙ СТРАНИЦЕ. Двадцать девять собственных
// `generateMetadata` разошлись бы на первой же правке — ровно тот класс, ради
// которого делался шаг 254. Страница пишет одну строку:
//
//     export const generateMetadata = collectionMetadata(data)
//
// 🔒 ШАБЛОН УНИВЕРСАЛЕН, И ПОТОМУ ЗДЕСЬ ПОЛНЫЙ НАБОР, А НЕ УРЕЗАННЫЙ. Решение
// владельца: тот же компонент должен работать в публичном слое, если ограничения
// доступа снимут. Значит канонический адрес, альтернативные языки и Open Graph
// строятся ВСЕГДА и одинаково; переключатель меняет только одно — объявляем ли мы
// страницу индексируемой (`collection-visibility.ts`).

export function collectionMetadata(page: WorkspacePageData, parentDir: string) {
  return async function generateMetadata(
    { params }: { params: Promise<{ lang: string }> },
  ): Promise<Metadata> {
    const { lang } = await params
    const words = wordsOf(page, lang)
    // Адрес складывается из папки-родителя и имени папки — тем же правилом, что
    // и в меню. Второго источника правды об адресе страницы не существует.
    const path = `${parentDir}/${page.meta.slug}`

    // 🔒 ОПИСАНИЕ НИКОГДА НЕ ПУСТОЕ. Страница без `description` получает его от
    // родителя или от сайта — и в выдаче десять страниц выглядят одинаково, что
    // поисковик читает как набор пустых копий. Запасной текст здесь именует саму
    // страницу, поэтому одинаковых описаний не бывает даже до того, как их напишут.
    const description = words.lead ?? `${words.title} — ${brand().name}.`

    return {
      title: words.title,
      description,

      // 🔒 КАНОНИЧЕСКИЙ АДРЕС И АЛЬТЕРНАТИВНЫЕ ЯЗЫКИ — ВСЕГДА, В ОБОИХ РЕЖИМАХ.
      // Это и есть защита от ярлыка «дорвей»: две языковые версии, не связанные
      // `hreflang`, выглядят двумя самостоятельными страницами с одинаковым
      // смыслом, то есть дублем. Связанные — одной страницей на двух языках.
      // Строится тем же `buildAlternates`, что у публичных страниц: второго
      // источника правды об адресах в проекте не существует.
      alternates: buildAlternates(lang, path),

      openGraph: {
            title: words.title,
            description,
            siteName: brand().name,
            locale: lang,
            url: urlFor(lang, path),
      },

      // 🛑 ЕДИНСТВЕННОЕ, ЧТО МЕНЯЕТ ПЕРЕКЛЮЧАТЕЛЬ. Пока слой закрыт замком,
      // объявлять его индексируемым нельзя: `proxy.ts` отвечает чужому 404, и
      // обещание поисковику было бы ложным. Снимут ограничение — та же страница
      // станет полноценно публичной, не меняя ни строки здесь.
      robots: architectLayerIsPublic()
        ? { index: true, follow: true }
        : { index: false, follow: false, nocache: true },
    }
  }
}
