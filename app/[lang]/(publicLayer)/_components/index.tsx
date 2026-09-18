import { createContentPage } from '@/lib/content/create-content-page'
import { homePage, homeLead } from '../_data'
import { meta } from '../_data/meta'
import { PostBody } from '@/components/content-page/post-body'
import { StarterBanner } from './starter-banner.client'
import { starterBannerStrings } from './starter-banner.i18n'
import { adminUrlFromSite } from '@/lib/site-urls'
import { getAppConfig } from '@/config/app-config'

// Вход главной страницы — ТА ЖЕ ФАБРИКА, ЧТО У ПРАВОВЫХ СТРАНИЦ.
//
// 🔒 ЗДЕСЬ ЕДВА НЕ ПОЯВИЛСЯ ВТОРОЙ СТАНДАРТ (шаг 508 FNS, поймано владельцем).
// Сначала главная получила свой вход: «у лендинга другая анатомия». Проверка
// показала, что это неправда — из пятнадцати свойств шаблона четырнадцать
// исчезали сами, когда их не дают. Оговорка сохранена намеренно: соблазн завести
// отдельную фабрику вернётся вместе с настоящим лендингом.
//
// 🔒 ВЕРХНЯЯ ЧАСТЬ СТРАНИЦЫ ОБЪЯВЛЕНА СТАНДАРТНОЙ (231-1, слово владельца по
// образцу memory.aifa.dev): ярлык → H1 → подзаголовок → короткий абзац → ряд
// значков → два действия → оглавление. Первые три печатает шапка страницы,
// следующие три — слот `afterHeader`, оглавление строит фабрика сама.
//
// ✗ ОПЛАЧЕНО В ЭТОМ ЖЕ ПОДШАГЕ: сперва значки уехали в `afterHero` и встали ВЫШЕ
// собственного заголовка страницы, а до того — не нарисовались нигде, потому что
// поднятый вид без слота, который его рисует, исчезает молча. Ни одна проверка
// при этом не падает.
const page = createContentPage({
  resolve: homePage,
  meta,
  // 🔒 БАННЕР СТАРТОВОГО ШАБЛОНА — ИМЕННО В `afterHero`, И ЭТО НЕ СЛУЧАЙНОСТЬ.
  // Он `position: fixed` и рисуется поверх страницы: место в дереве ему нужно
  // только затем, чтобы исполняться на сервере и знать язык.
  afterHero: (lang: string) => (
    <StarterBanner
      strings={starterBannerStrings(lang)}
      lang={lang}
      href={
        adminUrlFromSite(getAppConfig().url)
          ? `${adminUrlFromSite(getAppConfig().url)}/${lang}/project-start`
          : ''
      }
    />
  ),
  // Верхняя часть: короткий абзац и поднятые виды — значки и действия.
  afterHeader: (lang: string) => {
    const { intro } = homePage(lang)
    return (
      <>
        {intro && (
          <p className="max-w-3xl text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
        <PostBody blocks={homeLead(lang)} lang={lang} />
      </>
    )
  },
})

export const generateMetadata = page.generateMetadata
export default page.Page
