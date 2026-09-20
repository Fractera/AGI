// Слова диалога переводов — 82 языка (`/code/CLAUDE.md` §4д).
//
// Строки интерфейса живут в коде и едут со сборкой; сообщения об ОТКАЗАХ сюда не
// входят — они общие для голоса, перевода и любой думающей части и лежат один
// раз в `lib/i18n/platform-errors.ts`.
//
// 🔒 СЕРВЕРНЫЙ РЕЗОЛВ. 82 языка × словарь — сотни килобайт; клиентский компонент
// не имеет права импортировать этот файл. Серверная страница зовёт
// `translationsUi(lang)` и передаёт строки островку пропсами.
//
// Языки, кроме английского, переведены моделью 2026-08-11 одним прогоном на
// язык — все ключи разом, чтобы перевод был согласован внутри себя. Правку
// отдельной строки вносите руками: перегонять весь словарь ради одного слова
// дороже и рискованнее.

export type TranslationsUi = {
  title: string
  intro: string
  translateTab: string
  translateAllTabs: string
  translating: string
  saveOne: string
  saving: string
  savedMark: string
  skip: string
  close: string
  /** Текст у вопросика — почему пропуск это нормально. */
  hint: string
  saved: string
}

const UI: Record<string, TranslationsUi> = {
  en: { title: 'Add translations', intro: 'Fill the languages your app ships in. Nothing is translated until you ask.', translateTab: 'Translate this tab', translateAllTabs: 'Translate all tabs', translating: 'Translating…', saveOne: 'Save this translation', saving: 'Saving…', savedMark: 'saved', skip: 'Skip for now', close: 'Close', hint: 'Designing a page and not sure it is final? Skip the translations. The record lives in the language you are working in, and you add the rest when the wording settles — translating a draft spends time and tokens on text you are about to rewrite.', saved: 'Translation saved' },
  ru: { title: 'Добавьте переводы', intro: 'Укажите языки, на которых доступно ваше приложение. Ничего не переводится, пока вы не попросите.', translateTab: 'Перевести эту вкладку', translateAllTabs: 'Перевести все вкладки', translating: 'Перевод…', saveOne: 'Сохранить этот перевод', saving: 'Сохранение…', savedMark: 'сохранено', skip: 'Пока пропустить', close: 'Закрыть', hint: 'Проектируете страницу и не уверены, что это финал? Пропустите переводы. Запись останется на языке, с которым вы работаете, а остальные добавите, когда формулировки определятся — перевод черновика тратит время и токены на текст, который вы всё равно перепишете.', saved: 'Перевод сохранён' },
}

export function translationsUi(lang: string): TranslationsUi {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
