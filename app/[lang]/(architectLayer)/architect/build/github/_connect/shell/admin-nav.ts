// АДРЕС МАСТЕРА ПОДКЛЮЧЕНИЯ РЕПОЗИТОРИЯ (274-4).
//
// 🔒 ЗАМЕНА `adminHref` ПАНЕЛИ. В панели четыре шага были разделом верхнего уровня
// (`/{lang}/project-start/default-template/step-N`). Здесь они не раздел, а ПРОЦЕСС внутри вкладки
// «Строительство → GitHub» — решение владельца 2026-09-22: «те четыре шага вполне могут остаться в
// нашем проекте, но только как процесс входа в новый репозиторий».
//
// 🔒 ОДНО МЕСТО, А НЕ ЧЕТЫРЕ. Перенесённые страницы строят этой функцией и крошки, и шкалу, и ссылки
// «назад»; переписав её, мы переадресовали весь мастер, не тронув ни одной страницы шага.
// 🔒 БЕЗ РАЗДЕЛА — ВХОД В СЛОЙ: перенесённая страница зовёт `adminHref(lang, undefined)`, то есть «домой».
export function adminHref(lang: string, slug?: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  if (slug === 'project-start') return `${base}/${lang}/architect/build/github/connect`
  return slug ? `${base}/${lang}/architect/${slug}` : `${base}/${lang}/architect`
}

/** Вкладка, внутри которой живёт мастер: сюда он возвращает пройденного человека. */
export function githubHref(lang: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${base}/${lang}/architect/build/github`
}

/** База дверей мастера. Двери лежат в маршруте своей страницы — закон комплекта (271). */
export function connectApi(lang: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${base}/${lang}/architect/build/github/api/connect`
}
