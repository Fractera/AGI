"use client"

import { Search } from "lucide-react"
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Small } from "@/components/ui/typography"
import type { TableUi } from "@/sections/table.i18n"

// ПОЛНЫЙ НАБОР ТАБЛИЦЫ: ПОИСК СВЕРХУ, СТРАНИЦЫ СНИЗУ (262).
//
// 🎯 СЛОВО ВЛАДЕЛЬЦА 2026-09-21: «должен содержать в своей верхней части секцию поиска и в своей нижней
// части секцию пагинации… в точности один-к-одному скопировать верхнюю и нижнюю часть… чтобы в случае,
// если мы будем переиспользовать таблицу, она у нас представляла из себя полный набор».
// Образец — раздел «Автоматизации» службы Telegram (`automations-view.tsx`, `automations-search.client.tsx`):
// вёрстка, классы и слова перенесены оттуда.
//
// 🔒 ВИД ПЕРЕНЕСЁН ОДИН В ОДИН, МЕХАНИЗМ — НЕТ, И ЭТО НАЗВАНО ВЛАДЕЛЬЦУ. Там отбор и номер страницы живут
// в адресе и их читает сервер на каждый запрос — страница динамическая. Таблица здесь стоит на
// СТАТИЧЕСКИХ страницах публичного слоя, где чтение запроса запрещено (`check:static`). Поэтому вся
// таблица предрендерена в HTML целиком, а отбор и листание делает этот островок в браузере.
//
// 🔒 ДО ЗАПУСКА СКРИПТА ВИДНЫ ВСЕ СТРОКИ. Пока островок не ожил (и у читателя без JavaScript, и у
// поискового робота), страница показывает таблицу полностью: скрыть строки на сервере значило бы
// спрятать их от поиска. Деление на страницы включается после гидратации.

const PER_PAGE = [10, 25, 50, 100] as const

export function TableTools({
  caption,
  head,
  rows,
  texts,
  columns,
  words,
}: {
  caption?: ReactNode
  head: ReactNode
  /** Готовые строки `<tr>`, нарисованные сервером. */
  rows: ReactNode[]
  /** Текст каждой строки без разметки — по нему идёт поиск. */
  texts: string[]
  columns: number
  words: TableUi
}) {
  const [ready, setReady] = useState(false)
  const [draft, setDraft] = useState("")
  const [q, setQ] = useState("")
  const [per, setPer] = useState<number>(PER_PAGE[0])
  const [page, setPage] = useState(1)

  useEffect(() => setReady(true), [])

  const matched = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.map((_, i) => i).filter((i) => !needle || texts[i].toLowerCase().includes(needle))
  }, [q, rows, texts])

  const size = ready ? per : Math.max(1, matched.length)
  const pages = Math.max(1, Math.ceil(matched.length / size))
  const current = Math.min(page, pages)
  const visible = matched.slice((current - 1) * size, current * size)
  const from = matched.length === 0 ? 0 : (current - 1) * size + 1
  const to = (current - 1) * size + visible.length
  const atFirst = current <= 1
  const atLast = current >= pages

  const navLink =
    "inline-flex items-center rounded-md border border-border px-2.5 py-1.5 text-[length:var(--fs-small)] transition-colors hover:bg-muted"
  const navOff = "pointer-events-none opacity-40"

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setQ(draft)
    setPage(1)
  }

  function reset() {
    setDraft("")
    setQ("")
    setPer(PER_PAGE[0])
    setPage(1)
  }

  return (
    <div className="my-6 flex flex-col gap-4" data-table-tools={matched.length}>
      {/* ── ПАНЕЛЬ УПРАВЛЕНИЯ ТАБЛИЦЕЙ ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 rounded-md border border-border p-3">
        <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmit} role="search">
          <div className="relative min-w-[16rem] flex-1">
            <Search
              aria-hidden
              className="-translate-y-1/2 absolute top-1/2 left-2.5 size-4 text-muted-foreground"
            />
            <input
              aria-label={words.search}
              className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-8 text-[length:var(--fs-small)] text-foreground placeholder:text-muted-foreground"
              data-table-search
              onChange={(e) => setDraft(e.target.value)}
              placeholder={words.search}
              type="search"
              value={draft}
            />
          </div>

          <button className={navLink} type="submit">
            {words.searchDo}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="ml-auto text-[length:var(--fs-small)] text-muted-foreground underline-offset-4 hover:underline"
            onClick={reset}
            type="button"
          >
            {words.reset}
          </button>
        </div>
      </div>

      {/* ── ТАБЛИЦА ───────────────────────────────────────────────────────── */}
      <figure className="overflow-x-auto rounded-2xl border border-border">
        {caption && (
          <figcaption className="border-b border-border bg-muted/40 px-5 py-3 text-sm font-semibold text-muted-foreground">
            {caption}
          </figcaption>
        )}
        <table className="w-full border-collapse text-left text-sm">
          <thead>{head}</thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="px-4 py-3" colSpan={columns}>
                  <Small className="text-muted-foreground" data-table-empty>
                    {words.empty}
                  </Small>
                </td>
              </tr>
            ) : (
              visible.map((i) => rows[i])
            )}
          </tbody>
        </table>
      </figure>

      {/* ── СТРАНИЦЫ ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Small className="text-muted-foreground" data-table-shown>
          {words.shown
            .replace("{from}", String(from))
            .replace("{to}", String(to))
            .replace("{total}", String(matched.length))}
        </Small>

        <div className="flex items-center gap-2">
          <Small className="text-muted-foreground">{words.perPage}</Small>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5" data-filter="per">
            {PER_PAGE.map((n) => (
              <button
                aria-current={n === per ? "true" : undefined}
                className={
                  n === per
                    ? "rounded px-2 py-1 text-[length:var(--fs-small)] bg-muted font-medium text-foreground"
                    : "rounded px-2 py-1 text-[length:var(--fs-small)] text-muted-foreground transition-colors hover:text-foreground"
                }
                key={n}
                onClick={() => {
                  setPer(n)
                  setPage(1)
                }}
                type="button"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent data-table-pager={`${current}/${pages}`}>
            <PaginationItem>
              <button
                aria-label={words.first}
                className={`${navLink} ${atFirst ? navOff : ""}`}
                onClick={() => setPage(1)}
                type="button"
              >
                ««
              </button>
            </PaginationItem>
            <PaginationItem>
              <button
                aria-label={words.prev}
                className={`${navLink} ${atFirst ? navOff : ""}`}
                onClick={() => setPage(Math.max(1, current - 1))}
                type="button"
              >
                {words.prev}
              </button>
            </PaginationItem>
            <PaginationItem>
              <Small className="px-2 text-muted-foreground">
                {words.page.replace("{n}", String(current)).replace("{of}", String(pages))}
              </Small>
            </PaginationItem>
            <PaginationItem>
              <button
                aria-label={words.next}
                className={`${navLink} ${atLast ? navOff : ""}`}
                onClick={() => setPage(Math.min(pages, current + 1))}
                type="button"
              >
                {words.next}
              </button>
            </PaginationItem>
            <PaginationItem>
              <button
                aria-label={words.last}
                className={`${navLink} ${atLast ? navOff : ""}`}
                onClick={() => setPage(pages)}
                type="button"
              >
                »»
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
