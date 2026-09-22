// АДРЕС РАЗДЕЛА ПУТИ В НАШЕМ СЛОЕ (274-2).
//
// 🔒 ЗАМЕНА `adminHref` ПАНЕЛИ: там разделы жили в корне (`/{lang}/<раздел>`), здесь — в слое
// архитектора (`/{lang}/architect/<раздел>`). Перенесённые страницы строят адреса шагов этой функцией,
// поэтому переписывать их не нужно ни в одной строке.
// 🔒 БЕЗ РАЗДЕЛА — ВХОД В СЛОЙ: перенесённая страница прощания зовёт `adminHref(lang, undefined)`, то есть
// «домой». В панели домом был корень, здесь — вход слоя архитектора.
export function adminHref(lang: string, slug?: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return slug ? `${base}/${lang}/architect/${slug}` : `${base}/${lang}/architect`
}
