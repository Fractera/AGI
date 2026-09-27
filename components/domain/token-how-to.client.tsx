"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Small } from "@/components/ui/typography"
import type { DomainLadderWords } from "./domain-ladder.i18n"

// «КАК СОЗДАТЬ ЭТОТ ТОКЕН — ПО ШАГАМ» (259 → 324-1). Одна инструкция на два места: шаг 4 лестницы и строка «Ключ узла» (замена
// ключа). Слово владельца 2026-09-27: «у нас существовало подробный инструкция которую мы разработали … вместо того чтобы
// рисовать сверху дурацкий текст … мог бы … в ней согласно той инструкции … прошел перенастройку». Две копии текста разошлись
// бы — поэтому компонент один, слова — из словаря лестницы.

type Words = Pick<DomainLadderWords, "tokenHowToggle" | "tokenHowSteps" | "tokenPermsTitle" | "tokenPermsHead" | "tokenPermsRows" | "tokenPermsWhy" | "tokenTail">

export function TokenHowTo({ words, defaultOpen = false }: { words: Words; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3" data-token-how>
      <button aria-expanded={open} className="flex w-full items-center justify-between gap-2 text-left" onClick={() => setOpen((v) => !v)} type="button">
        <Small className="font-semibold text-foreground">{words.tokenHowToggle}</Small>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <>
          <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">
            {words.tokenHowSteps.map((line) => <li key={line}>{line}</li>)}
          </ol>
          <Small className="mt-3 block font-semibold text-foreground">{words.tokenPermsTitle}</Small>
          {/* 🛑 Таблица в своей прокрутке: на телефоне три столбца шире экрана, а страница целиком горизонтально ездить не должна. */}
          <div className="mt-1 overflow-x-auto">
            <table className="w-full min-w-[20rem] border-collapse text-sm">
              <thead>
                <tr>
                  {words.tokenPermsHead.map((h) => (
                    <th className="border border-border bg-muted px-2 py-1 text-left font-semibold" key={h} scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {words.tokenPermsRows.map((row) => (
                  <tr key={row.join("-")}>
                    {row.map((cell) => <td className="border border-border px-2 py-1 font-mono" key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
            {words.tokenPermsWhy.map((line) => <li key={line}>{line}</li>)}
          </ul>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-foreground text-sm">
            {words.tokenTail.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </>
      ) : null}
    </div>
  )
}
