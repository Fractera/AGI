'use client'

import { useState, type ReactNode } from 'react'
import { BookOpen } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { AppDialog } from '@/components/dialog/app-dialog.client'
import type { AppDialogUi } from '@/components/dialog/app-dialog.i18n'
import { cn } from '@/lib/utils'

// ОСТРОВОК РАСКРЫВАЮЩИХСЯ ПОЛОС (244-1).
//
// 🔒 ПОЧЕМУ ВИД СОСТОИТ ИЗ ДВУХ ПОЛОВИН. Ни один файл под `sections/` не бывает
// клиентским — это свойство слоя видов, а не удобство. Раскрытие полосы живёт
// движением, значит серверный рендерер только переводит поля блока в пропсы, а
// поведение держит островок. Тот же приём, что у `workspace` и у диаграмм.
//
// 🔒 СОДЕРЖИМОЕ ПРИХОДИТ ГОТОВЫМ ДЕРЕВОМ, А НЕ ТЕКСТОМ. Рендерер уже нарисовал
// вложенные блоки средствами каталога и передал сюда результат: островок ничего
// не знает о видах и не заводит второй системы разметки. Пришли бы строки —
// пришлось бы уметь разбирать их здесь, и рядом с каталогом выросла бы его
// маленькая копия.
//
// 🔒 `type="single" collapsible` — ОДНА ОТКРЫТАЯ ПОЛОСА ЗА РАЗ. Две открытые
// делают из аккордеона простыню, ради сворачивания которой он и заведён; а
// закрыть последнюю оставшуюся человек обязан иметь право — отсюда `collapsible`.
//
// 🔒 ПОДРОБНОСТИ — В ОКНЕ, А НЕ В ПОЛОСЕ (270): иконка открытой книги рядом с подписью открывает общее
// окно продукта `AppDialog` с прокруткой. Иконка стоит ВНЕ кнопки раскрытия: кнопка внутри кнопки —
// неверная разметка, и нажатие на книгу раскрывало бы полосу.
// 🔒 `capped` — список не выше 1000 px, дальше прокрутка: список растёт с каждой новой записью.

export type AccordionPanel = {
  /** Видимая подпись свёрнутой полосы. */
  summary: string
  /** Уже нарисованное содержимое — результат работы каталога видов. */
  content: ReactNode
  /** Ключ полосы: стабильный, из ключа блока. */
  id: string
  /** Подробности для окна по иконке книги — уже нарисованные. */
  details?: { title: string; content: ReactNode }
}

export function AccordionSection({
  panels,
  defaultOpen,
  capped = false,
  cards = false,
  dialogUi,
}: {
  panels: AccordionPanel[]
  /** Идентификатор полосы, раскрытой при загрузке. Не задан — все свёрнуты. */
  defaultOpen?: string
  /** Каждая полоса — отдельная карточка с отступом (279). */
  cards?: boolean
  /** Не выше 1000 px, дальше прокрутка. */
  capped?: boolean
  /** Слова общего окна — резолвятся на сервере; нужны, только если у полос есть подробности. */
  dialogUi?: AppDialogUi
}) {
  const [reading, setReading] = useState<string | null>(null)
  const shown = panels.find(panel => panel.id === reading)
  return (
    <>
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className={cn(
        // p-0.5: рамка последней карточки и обводка фокуса не срезаются контейнером с прокруткой.
        cards ? 'flex flex-col gap-3 p-0.5' : 'divide-y divide-border rounded-lg border border-border',
        capped && 'max-h-[1000px] overflow-y-auto',
      )}
    >
      {panels.map(panel => (
        <AccordionItem
          key={panel.id}
          value={panel.id}
          className={cn('px-4', cards ? 'rounded-xl border border-border bg-card' : 'border-b-0')}
        >
          <div className="flex items-center gap-2">
            <AccordionTrigger className="flex-1 py-4 text-left text-base font-medium hover:no-underline">
              {panel.summary}
            </AccordionTrigger>
            {panel.details && dialogUi ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={panel.details.title}
                title={panel.details.title}
                onClick={() => setReading(panel.id)}
                data-accordion-details
              >
                <BookOpen className="size-5" aria-hidden />
              </Button>
            ) : null}
          </div>
          <AccordionContent className="pb-4">
            <div className="flex flex-col gap-4">{panel.content}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
    {shown?.details && dialogUi ? (
      <AppDialog
        open
        onOpenChange={open => {
          if (!open) setReading(null)
        }}
        title={shown.details.title}
        ui={dialogUi}
        size="xl"
      >
        <div className="flex flex-col gap-4">{shown.details.content}</div>
      </AppDialog>
    ) : null}
    </>
  )
}
