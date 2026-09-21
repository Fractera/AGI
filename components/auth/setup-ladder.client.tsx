"use client"

import { useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { H3, Small } from "@/components/ui/typography"

// ОБЩИЕ СТУПЕНИ ЛЕСТНИЦЫ НАСТРОЙКИ ПРОВАЙДЕРА (266-1).
//
// 🔒 ВЫНЕСЕНЫ ИЗ ЭКРАНА GOOGLE В ТОТ ДЕНЬ, КОГДА ПОЯВИЛСЯ ВТОРОЙ ЭКРАН. Два экрана
// с одинаковыми ступенями, собранные врозь, расходятся молча: в одном поправят
// отступ или подпись кнопки копирования, во втором — нет, и никто этого не
// заметит, потому что оба по отдельности выглядят правильно. Требование владельца
// того же дня — переиспользовать проверенный блок, а не строить похожий рядом.
//
// 🔒 ЗДЕСЬ ТОЛЬКО ФОРМА, А НЕ СЛОВА. Каждый экран приносит свои строки: общий
// модуль не знает ни одного слова, иначе он стал бы словарём, который тянет в
// браузер строки всех провайдеров сразу.

/** Ступень лестницы: номер в кружке, заголовок и содержимое. */
export function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-step={n}>
      <H3 className="mb-2 flex items-center gap-2" variant="ui">
        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
          {n}
        </span>
        {title}
      </H3>
      {children}
    </section>
  )
}

/** Маркированный список внутри ступени. */
export function StepPoints({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-foreground text-sm">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )
}

/** Строка-значение с кнопкой «скопировать». */
export function CopyRow({
  id,
  label,
  value,
  note,
  copy,
  copied,
}: {
  id: string
  label: string
  value: string
  note?: string
  copy: string
  copied: string
}) {
  const [done, setDone] = useState(false)
  return (
    <div className="mt-3 flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} readOnly value={value} className="font-mono text-xs" />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              setDone(true)
              window.setTimeout(() => setDone(false), 2000)
            } catch {
              // Копирование запрещено политикой страницы — строка видна и
              // выделяется руками. Молча ничего не происходит, и это законно.
            }
          }}
        >
          {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          <span className="ml-2">{done ? copied : copy}</span>
        </Button>
      </div>
      {note && <Small className="text-muted-foreground">{note}</Small>}
    </div>
  )
}
