'use client'

import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

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

export type AccordionPanel = {
  /** Видимая подпись свёрнутой полосы. */
  summary: string
  /** Уже нарисованное содержимое — результат работы каталога видов. */
  content: ReactNode
  /** Ключ полосы: стабильный, из ключа блока. */
  id: string
}

export function AccordionSection({
  panels,
  defaultOpen,
}: {
  panels: AccordionPanel[]
  /** Идентификатор полосы, раскрытой при загрузке. Не задан — все свёрнуты. */
  defaultOpen?: string
}) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen}
      className="divide-y divide-border rounded-lg border border-border"
    >
      {panels.map(panel => (
        <AccordionItem key={panel.id} value={panel.id} className="border-b-0 px-4">
          <AccordionTrigger className="py-4 text-left text-base font-medium hover:no-underline">
            {panel.summary}
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-col gap-4">{panel.content}</div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
