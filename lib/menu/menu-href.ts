// АДРЕС ПУНКТА МЕНЮ (283-1).
//
// Пункт меню своей службы — путь без языка (`/m2m`), и язык дописывается здесь. Пункт меню ПРОЕКТА, пришедший
// от сайта (дверь `/api/menu/<язык>`), — уже полный адрес сайта (`https://…/ru/m2m`), и его трогать нельзя.
// ✗ Оплачено 2026-09-24: компоненты меню дописывали язык к любому `href`, и кнопка вела на `/ru/ru/site`.
export function menuHref(lang: string, href: string | undefined, fallbackPath: string): string {
  if (href && /^https?:\/\//.test(href)) return href
  return href ? `/${lang}${href}` : fallbackPath
}
