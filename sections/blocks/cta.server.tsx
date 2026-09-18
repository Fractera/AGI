import type { SectionRenderer } from '@/sections/contract'
import { inline } from '@/lib/content/blocks/inline'
import { CtaButton, CtaLink } from '@/sections/cta-button.server'

// Призыв к действию.
//
// 🔒 ПОДПИСЬ НАД КНОПКОЙ НЕОБЯЗАТЕЛЬНА (2026-08-16, замечено владельцем). Когда
// кнопка стоит внутри раздела, чей заголовок уже сказал то же самое, подпись —
// дословный повтор через полэкрана.
//
// 🔒 НЕТ ПОДПИСИ — НЕТ И РАМКИ (владелец 2026-08-19). Рамка существует, чтобы
// держать подпись; без неё она держала пустоту: кнопка жалась влево, а справа
// тянулся пустой прямоугольник во всю ширину. Владелец назвал это словом
// «некрасиво», и он прав — контейнер без содержимого читается как поломка
// вёрстки, а не как воздух.
//
// 🔒 КНОПКА СТОИТ ПО ЦЕНТРУ (владелец 2026-08-20). Прижатая влево, она читается
// как продолжение абзаца, а не как приглашение к действию: взгляд, дойдя до
// конца текста, уходит вниз по левому краю и минует её. Центр — единственное
// место, где кнопка принадлежит СЕБЕ, а не предыдущей строке. Это касается обеих
// её раскладок: и внутри рамки с подписью, и отдельно стоящей.
//
// Кнопка одна на все места, где предлагается действие, — sections/cta-button:
// вторая копия классов совпадала бы с первой ровно до первой правки цвета.
// 🔒 ВТОРАЯ КНОПКА — КОНТУРНАЯ И В ТОЙ ЖЕ СТРОКЕ (231-1). Две сплошные кнопки
// рядом спорят за взгляд, и человек выбирает по расположению, а не по смыслу.
// Контур говорит «это тоже можно», заливка — «это главное».
//
// 🔒 ПЕРЕНОС РАЗРЕШЁН (`flex-wrap`): на телефоне две кнопки в строку не влезают,
// а сжатая до многоточия подпись действия — худший исход из возможных.
export const cta: SectionRenderer<'cta'> = (b, { key: k }) =>
  b.text ? (
    <div key={k} className="my-4 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/[0.06] p-6 text-center">
      <p className="text-base font-medium text-foreground">{inline(b.text, k)}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CtaButton href={b.href}>{b.label}</CtaButton>
        {b.secondary ? <CtaLink href={b.secondary.href}>{b.secondary.label}</CtaLink> : null}
      </div>
    </div>
  ) : (
    <div key={k} className="my-4 flex flex-wrap items-center justify-center gap-3">
      <CtaButton href={b.href}>{b.label}</CtaButton>
      {b.secondary ? <CtaLink href={b.secondary.href}>{b.secondary.label}</CtaLink> : null}
    </div>
  )
