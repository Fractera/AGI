// СЛОВА ОБОЛОЧКИ, КОТОРЫХ ЖДУТ ПЕРЕНЕСЁННЫЕ СТРАНИЦЫ (274-2).
//
// 🔒 В ПАНЕЛИ ЭТО СЛОВАРЬ НА 82 ЯЗЫКА, И НУЖЕН ОН БЫЛ ШАПКЕ И КРОШКАМ. Шапку и крошки здесь рисует слой
// архитектора из `_data` страницы, поэтому словами отсюда ничего не рисуется — но зовут его перенесённые
// страницы по-прежнему, и он обязан отвечать: так копия остаётся копией, а не переписанным кодом.
// 🛑 ПУСТАЯ СТРОКА, А НЕ ВЫДУМАННАЯ: оболочка `shell/page-shell.tsx` не рисует пустой заголовок вовсе.
export type AdminStrings = { pages: Record<string, { title: string; hint: string }> }

const EMPTY = { title: '', hint: '' }

export function getAdminStrings(_lang: string): AdminStrings {
  return { pages: new Proxy({}, { get: () => EMPTY }) as Record<string, { title: string; hint: string }> }
}
