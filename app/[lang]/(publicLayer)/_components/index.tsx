import { createContentPage } from '@/lib/content/create-content-page'
import { homePage } from '../_data'
import { meta } from '../_data/meta'
import { StarterBanner } from './starter-banner.client'
import { starterBannerStrings } from './starter-banner.i18n'
import { adminUrlFromSite } from '@/lib/site-urls'
import { getAppConfig } from '@/config/app-config'

// Вход главной страницы — ТА ЖЕ ФАБРИКА, ЧТО У ПРАВОВЫХ СТРАНИЦ.
//
// 🔒 ЗДЕСЬ ЕДВА НЕ ПОЯВИЛСЯ ВТОРОЙ СТАНДАРТ (шаг 508, поймано владельцем FNS).
// Сначала главная получила свой вход: «у лендинга другая анатомия». Проверка
// показала, что это неправда — из пятнадцати свойств шаблона четырнадцать
// исчезали сами, когда их не дают. Разной была не анатомия страницы, а
// обязательность трёх свойств. Оговорка сохранена при вычитании намеренно:
// соблазн завести отдельную фабрику вернётся вместе с настоящим лендингом.
//
// 🪦 СОДЕРЖИМОЕ ЛЕНДИНГА УБРАНО (229-4, 2026-09-18). Отсюда ушли: `titleInBody`
// (заголовок печатала секция первого экрана — её больше нет, и H1 снова рисует
// шапка страницы), лента мер `homeLead` и виджет `SecurityOrbit`. Страница
// осталась страницей стартера: метаданные, языки, хром, подвал — всё на месте.
const page = createContentPage({
  resolve: homePage,
  meta,
  // 🔒 БАННЕР СТАРТОВОГО ШАБЛОНА ОСТАВЛЕН НАМЕРЕННО. Он говорит человеку, что
  // перед ним ещё шаблон, а не его проект, — и это верно тем более теперь,
  // когда на главной заглушка. Адрес панели берётся из настроек; пустой адрес —
  // законный исход свежего сервера, и тогда баннер показывается БЕЗ ссылки.
  afterHero: (lang: string) => (
    <>
      <StarterBanner
        strings={starterBannerStrings(lang)}
        lang={lang}
        href={
          adminUrlFromSite(getAppConfig().url)
            ? `${adminUrlFromSite(getAppConfig().url)}/${lang}/project-start`
            : ''
        }
      />
      {/* 🔒 ХЭШ СБОРКИ НА СТРАНИЦЕ — НАСЛЕДИЕ ШАГА 228 И ЕДИНСТВЕННЫЙ СПОСОБ
          ОТЛИЧИТЬ «сайт работает» от «работает ИМЕННО та сборка». Значение
          кладёт в окружение наш `server.js` при запуске: страница его только
          печатает. Нет `.git` — будет `unknown`, и это честный ответ. */}
      <div data-app-column className="px-6">
        <p className="font-mono text-xs text-muted-foreground">
          commit <strong className="text-foreground">{process.env.AGI_COMMIT ?? 'unknown'}</strong>
        </p>
      </div>
    </>
  ),
})

export const generateMetadata = page.generateMetadata
export default page.Page
