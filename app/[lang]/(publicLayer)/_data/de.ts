import type { HomeCell } from './index'

// 🪦 СОДЕРЖИМОЕ ЛЕНДИНГА УДАЛЕНО (229-4, 2026-09-18, слово владельца: «без
// содержимого лендинга вместо него оставь пока текущий текст который ты уже
// сделал»). Здесь стоял первый экран Fractera, лента направлений, ряд мер,
// ярлыки и вопросы-ответы.
//
// 🔒 ФОРМА ЯЧЕЙКИ СОХРАНЕНА ЦЕЛИКОМ, и это не формальность: вокруг заглушки
// продолжает работать вся обвязка стартера — метаданные, языковые варианты,
// карта сайта, машинные поверхности. Наполнить страницу — значит дописать сюда
// блоки, а не строить её заново.
export const de: HomeCell = {
  title: 'hello world',
  description: "Eine vorläufige Startseite. Die Architektur des Starters bleibt vollständig: Sprachen, SEO, Konfigurationen, Menü und Fußzeile.",
  keywords: '',
  blocks: [{ kind: 'p', text: "AGI Fractera · lokaler Server" }],
  faq: [],
}
