import type { MetadataRoute } from "next"
import { brand } from "@/lib/brand"
import { SUPPORTED_LANGUAGES } from "@/config/translations/translations.config"
import { urlFor } from "@/lib/seo/alternates"
import { ARCHITECT_PAGES } from "@/app/[lang]/(architectLayer)/_lib/architect-menu"
import { translatedLanguages } from "@/lib/seo/translation-state"
import { data as homeData } from "@/app/[lang]/(publicLayer)/_data"
import { data as agiItemData } from "@/app/[lang]/(publicLayer)/(rootPages)/agi-item/_data"
import { data as architectureData } from "@/app/[lang]/(publicLayer)/(rootPages)/m2m/_data"
import { data as hostData } from "@/app/[lang]/(publicLayer)/(rootPages)/host/_data"
import { data as privacyData } from "@/app/[lang]/(publicLayer)/(footerPages)/privacy/_data"
import { data as termsData } from "@/app/[lang]/(publicLayer)/(footerPages)/terms/_data"
import { data as cookiesData } from "@/app/[lang]/(publicLayer)/(footerPages)/cookies/_data"
import { data as accessibilityData } from "@/app/[lang]/(publicLayer)/(footerPages)/accessibility/_data"
import { architectSitemapPaths } from "@/app/[lang]/(architectLayer)/_lib/collection-visibility"

// ГЛАВНАЯ КАРТА САЙТА — страницы, множество которых конечно и авторское.
//
// 🪦 ТОВАРЫ И ИХ ОТДЕЛЬНАЯ КАРТА УДАЛЕНЫ ВМЕСТЕ С МАГАЗИНОМ (229-3, 2026-09-18).
// Здесь объяснялось, почему товары жили в своей карте, разбитой на порции: их
// множество росло в рантайме и умножалось на языки, а предел файла — 50 000
// адресов. Предмета больше нет.

// СТРАНИЦЫ ПОДВАЛА — `app/[lang]/(publicLayer)/(footerPages)/*`.
//
// 🔒 ИХ ЗДЕСЬ НЕ БЫЛО ВОВСЕ (найдено 2026-08-19, при заведении «Доступности»).
// Тот же дефект, что был у блога: страницы статические, переведённые, с
// разметкой для машин — и ни одна не названа в карте. Проверка `check:seo`
// молчала потому, что считает разделами только папки первого уровня в
// `app/[lang]`, а группы в скобках (`(publicLayer)`, `(footerPages)`) для неё
// прозрачны и в обход не попадают. Прозрачность групп для URL не делает их
// прозрачными для карты.
//
// Список литеральный, а не обход папок: карта — файл сборки, и обход дерева в
// ней означал бы, что забытая приватная страница попадает в карту сама. Новая
// страница подвала добавляется сюда строкой, как и в `lib/aio/surfaces.ts`.
// СТРАНИЦЫ ГРУППЫ `(rootPages)` — разделы верхнего меню (2026-09-20).
//
// 🔒 ОТДЕЛЬНО ОТ ПРАВОВЫХ, И НЕ РАДИ ПОРЯДКА: это то, ради чего на сайт приходят,
// поэтому частота и приоритет у них другие. `/architecture` раньше стояла среди
// страниц подвала с приоритетом 0.3 — то есть карта объявляла поисковику, что
// описание продукта на 49 КБ менее важно, чем страница cookie.
// 🔒 СПИСОК НЕСЁТ ДАННЫЕ, А НЕ ТОЛЬКО АДРЕС (256-6). Карта обязана знать, на
// каких языках у страницы есть СВОЙ текст, — а это знают только её данные. Голый
// путь заставлял карту догадываться, и она догадывалась неверно: печатала каждый
// включённый язык подряд, обещая поисковику страницы, помеченные `noindex`.
const ROOT_PAGES = [
  { sub: "/agi-item", data: agiItemData },
  { sub: "/m2m", data: architectureData },
  { sub: "/host", data: hostData },
] as const

const FOOTER_PAGES = [
  { sub: "/privacy", data: privacyData },
  { sub: "/terms", data: termsData },
  { sub: "/cookies", data: cookiesData },
  { sub: "/accessibility", data: accessibilityData },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const site = brand().siteUrl
  if (!site) return []

  // 🔒 АДРЕСА СТРОЯТСЯ ТЕМ ЖЕ `urlFor`, ЧТО И КАНОНИЧЕСКИЕ (шаг 503). Здесь стояла
  // своя склейка `${site}/${lang}${путь}` — второй источник правды об адресах, и он
  // разошёлся с первым ровно там, где это дороже всего: в одноязычном режиме прокси
  // убирает языковой сегмент, и каждая строка этой карты вела на 301. Карта сайта,
  // перечисляющая редиректы, обесценивает сама себя, а расхождение с каноническим
  // адресом поисковик читает как противоречие в сигналах.
  // 🔒 СТРАНИЦА ПЕРЕЧИСЛЯЕТСЯ НА ТЕХ ЯЗЫКАХ, ГДЕ У НЕЁ ЕСТЬ СВОЙ ТЕКСТ (256-6).
  //
  // ✗ ИЗМЕРЕНО 2026-09-20: включив третий язык, я получил карту из 315 адресов, в
  // которой 104 испанских — при том что каждая испанская страница в ТОЙ ЖЕ сборке
  // несла `noindex`. Карта обещала ровно то, что мета-тег запрещал: три сигнала об
  // одной странице говорили разное.
  //
  // 🛑 ЭТО ХУЖЕ ЛИШНИХ СТРОК. Карта, зовущая на страницы, помеченные «не
  // индексируй», обесценивает себя целиком, а набор почти одинаковых адресов,
  // обещанных поисковику, и есть дорвей — то, чего владелец велел избежать.
  //
  // Источник правды один на все три сигнала: `lib/seo/translation-state.ts`.
  const out: MetadataRoute.Sitemap = []

  // 🪦 БЛОГ УДАЛЁН ИЗ ПРОЕКТА (229-2, 2026-09-18, по слову владельца). Здесь
  // стоял перечень раздела /blog и всех его постов — вместе с разделом он
  // потерял предмет.
  for (const lang of translatedLanguages(homeData)) {
    out.push({ url: urlFor(lang, ""), changeFrequency: "daily", priority: 1 })
  }

  // Разделы верхнего меню: то, ради чего на сайт приходят. `weekly` и 0.8 —
  // между главной (1) и справочными документами (0.3).
  for (const { sub, data } of ROOT_PAGES) {
    for (const lang of translatedLanguages(data)) {
      out.push({ url: urlFor(lang, sub), changeFrequency: "weekly", priority: 0.8 })
    }
  }

  // Правовые страницы: приоритет ниже разделов, потому что это справочные
  // документы, а не то, ради чего приходят. Частота — `yearly`: их текст
  // меняется редко, и обещать поисковику иное значит тратить его обходы зря.
  for (const { sub, data } of FOOTER_PAGES) {
    for (const lang of translatedLanguages(data)) {
      out.push({ url: urlFor(lang, sub), changeFrequency: "yearly", priority: 0.3 })
    }
  }

  // 🔒 СЛОЙ АРХИТЕКТОРА — ТОЛЬКО КОГДА ОН ОТКРЫТ, И РЕШАЕТ ЭТО ОДИН
  // ПЕРЕКЛЮЧАТЕЛЬ (255, `_lib/collection-visibility.ts`): с 256-2 он отвечает
  // «да» на витрине `fractera.ai` и «нет» везде ещё.
  //
  // 🛑 ПОЧЕМУ НЕЛЬЗЯ ПЕРЕЧИСЛИТЬ ИХ «НА БУДУЩЕЕ»: закрытая страница в карте
  // сайта есть обещание поисковику того, чего он не получит — `proxy.ts`
  // отвечает чужому 404. Набор адресов, объявленных роботу и недоступных
  // человеку, и есть определение дорвея, а ярлык выдаётся САЙТУ ЦЕЛИКОМ, а не
  // одной странице.
  //
  // Адреса приходят из того же дерева, что строит меню, — карта и меню не могут
  // разойтись, потому что источник у них один. Языки — из данных каждой страницы,
  // по тому же правилу, что и у публичных.
  for (const { path, page } of ARCHITECT_PAGES) {
    if (architectSitemapPaths([path]).length === 0) continue
    for (const lang of translatedLanguages(page)) {
      out.push({ url: urlFor(lang, path), changeFrequency: "weekly", priority: 0.5 })
    }
  }
  // В одноязычном режиме `urlFor` для каждого языка даёт один и тот же адрес — но
  // язык там ровно один, так что дубликатов не возникает. Страховка на случай
  // будущей правки: карта обязана быть множеством, а не списком.
  return out.filter((row, i) => out.findIndex(r => r.url === row.url) === i)
}
