import { createContentPage } from '@/lib/content/create-content-page'
import { homePage } from '../_data'
import { meta } from '../_data/meta'
import { StarterBanner } from './starter-banner.client'
import { starterBannerStrings } from './starter-banner.i18n'
import { adminUrlFromSite } from '@/lib/site-urls'
import { getAppConfig } from '@/config/app-config'

// Вход главной страницы — ТА ЖЕ ФАБРИКА, ЧТО У ПРАВОВЫХ СТРАНИЦ.
//
// 🔒 ЗДЕСЬ ЕДВА НЕ ПОЯВИЛСЯ ВТОРОЙ СТАНДАРТ (шаг 508 FNS, поймано владельцем).
// Сначала главная получила свой вход: «у лендинга другая анатомия». Проверка
// показала, что это неправда — из пятнадцати свойств шаблона четырнадцать
// исчезали сами, когда их не дают. Оговорка сохранена при вычитании намеренно:
// соблазн завести отдельную фабрику вернётся вместе с настоящим лендингом.
//
// 🪦 СОДЕРЖИМОЕ УДАЛЕНО ПОЛНОСТЬЮ (230-6, 2026-09-18). Отсюда ушли: лента мер
// `homeLead`, виджет `SecurityOrbit`, заглушка «hello world» и строка с хэшем
// сборки. Страница осталась страницей стартера: метаданные, языки, шапка и
// подвал — всё на месте, пусто только тело.
const page = createContentPage({
  resolve: homePage,
  meta,
  // 🔒 БАННЕР СТАРТОВОГО ШАБЛОНА ОСТАВЛЕН НАМЕРЕННО. Он говорит человеку, что
  // перед ним ещё шаблон, а не его проект, — и это верно тем более теперь, когда
  // страница пуста. Адрес панели берётся из настроек; пустой адрес — законный
  // исход свежего сервера, и тогда баннер показывается БЕЗ ссылки.
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
})

export const generateMetadata = page.generateMetadata
export default page.Page
