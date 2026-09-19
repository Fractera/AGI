import type { SectionRenderer } from '@/sections/contract'
import { H3 } from '@/components/ui/typography'
import { inline, headingId } from '@/lib/content/blocks/inline'

// Заголовок третьего уровня. Размер и шрифт — из примитива типографики.
//
// 🔒 СВОЙ ЯКОРЬ СИЛЬНЕЕ ВЫВЕДЕННОГО (2026-09-19). Обычно адрес заголовка
// считается из его текста, и для латиницы это верно: ссылка читается и совпадает
// с тем, что видно. Русский заголовок так не работает — генератор оставляет от
// него хеш, а на якоря ссылается навигация по странице. Поэтому материал вправе
// назвать якорь сам, и тогда адрес переживёт правку слов заголовка.
export const h3: SectionRenderer<'h3'> = (b, { key: k }) => (
  <H3 key={k} id={b.id ?? headingId(b.text)} className="mt-4 scroll-mt-24">
    {inline(b.text, k)}
  </H3>
)
