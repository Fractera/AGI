"use client"

import { useState } from "react"
import { AppDialog, type AppDialogSize } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"

// ОБРАЗЕЦ МОДАЛЬНОГО ОКНА — ОДНА НАСТРОЙКА СТАНДАРТА (296; перенос каталога окон fractera-next-starter, шаг 62-2).
//
// Слово владельца 2026-09-25: «Нужно проверить почему нет модальных окон» — каталог окон жил на aifa.dev
// (`architect/design?section=dialogs`) и в ядро не приехал. Здесь каждая настройка открывается НАСТОЯЩИМ
// `AppDialog`, а не рисунком: витрина, перерисовывающая предмет по-своему, показывает себя, а не продукт.
// Длинный образец главный: тело прокручивается, заголовок и кнопки стоят на месте.

export type DialogSampleShape = "plain" | "footer" | "long" | "locked"

export type DialogSampleWords = {
  show: string
  name: string
  note: string
  title: string
  description: string
  body?: string
  footerOk?: string
  footerCancel?: string
  longLine: string
  lockedHint: string
}

const SHAPE: Record<DialogSampleShape, { size: AppDialogSize; footer: boolean; long: boolean; locked: boolean }> = {
  plain: { size: "sm", footer: false, long: false, locked: false },
  footer: { size: "md", footer: true, long: false, locked: false },
  long: { size: "lg", footer: true, long: true, locked: false },
  locked: { size: "sm", footer: true, long: false, locked: true },
}

export function DialogSample({ sample, words, dialogUi }: { sample: DialogSampleShape; words: DialogSampleWords; dialogUi: AppDialogUi }) {
  const [open, setOpen] = useState(false)
  const shape = SHAPE[sample] ?? SHAPE.plain

  return (
    <section data-dialog-sample={sample} className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[length:var(--fs-body)] font-medium text-foreground">{words.name}</p>
          <p className="mt-1 text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">{words.note}</p>
        </div>
        <button
          type="button"
          data-show-dialog={sample}
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-md border border-border px-4 py-2 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          {words.show}
        </button>
      </div>

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        ui={dialogUi}
        size={shape.size}
        title={words.title}
        description={words.description}
        dismissible={!shape.locked}
        footer={
          shape.footer ? (
            <>
              {!shape.locked && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {words.footerCancel}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-4 py-2 text-[length:var(--fs-small)] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {words.footerOk}
              </button>
            </>
          ) : undefined
        }
      >
        {shape.long ? (
          // Длина — часть образца: тело обязано перерасти экран, иначе прокрутку не увидеть.
          <div className="flex flex-col gap-3">
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} className="text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">
                {i + 1}. {words.longLine}
              </p>
            ))}
          </div>
        ) : shape.locked ? (
          <p className="text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">{words.lockedHint}</p>
        ) : words.body ? (
          <p className="text-[length:var(--fs-small)] leading-relaxed text-muted-foreground">{words.body}</p>
        ) : undefined}
      </AppDialog>
    </section>
  )
}
