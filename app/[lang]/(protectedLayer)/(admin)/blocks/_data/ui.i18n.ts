// Слова страницы «Каталог секций» (слой прав `admin`).
//
// 🔒 ЯЗЫКОВ СТОЛЬКО, СКОЛЬКО ВКЛЮЧЕНО (`NEXT_PUBLIC_SUPPORTED_LANGUAGES`, сейчас
// десять) — это строки ОДНОЙ страницы. Сторож `npm run check:i18n` держит число.
// Тексты самих образцов живут в `specimen.ts` и остаются английскими намеренно:
// они показывают форму секции, а не обращаются к посетителю.

export type BlocksCatalogueUi = {
  title: string
  subtitle: string
  countLabel: string
  whenLabel: string
}

const UI: Record<string, BlocksCatalogueUi> = {
  en: { title: 'Section catalogue', subtitle: 'Every kind of section the content engine can render, drawn by the real renderer with sample data.', countLabel: 'kinds', whenLabel: 'When to use it' },
  ru: { title: 'Каталог секций', subtitle: 'Все виды секций, которые умеет движок материалов, нарисованные настоящим рендерером на образцовых данных.', countLabel: 'видов', whenLabel: 'Когда уместен' },
}

export function blocksCatalogueUi(lang: string): BlocksCatalogueUi {
  return UI[lang] ?? UI.en
}
