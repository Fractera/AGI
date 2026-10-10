"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { P } from "@/components/ui/typography"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TableTools } from "@/components/table/table-tools.client"
import type { TableUi } from "@/sections/table.i18n"
import { ElementDoc } from "./element-doc"

// ISLAND «Links (A2A) → Deals» (step 412-6; 436-2 — formerly «Process → Orders»; 442 — the node's table standard).
// The table is `TableTools` (search on top, pages below, «incoming / outgoing» toggles), the same as Dashboard → Projects.
// A deal opens in a side sheet: its summary and the conversation behind it — rows of the node's log with the same contextId
// (pinned by `order:save`, so they are not pushed out).
// Lagrix columns (price, fee, escrow state, receipt, transaction, like) stay «—» until the element is connected to Lagrix:
// no invented values. Direction is «incoming» for every summary today — the element's agent writes one when it worked for
// another agent.
// Four states: loading · list · empty · refused (a refusal means «unknown», not «there are no deals»).
// Asked once when the page opens: no polling (it was not ordered).

type Order = { order: string; closed: string; status: string; from: string; kind: string; tags: string; iterations: string; text: string }
type LogRow = { id: number; at: string; from_element: string; to_element: string; method: string | null; state: string | null }

export type ElementOrdersWords = {
  loading: string; failed: string; empty: string
  /** Column heads, in table order (15). */
  head: string[]
  incoming: string; outgoing: string
  open: string
  /** Hint under the table: why the Lagrix columns show «—». */
  lagrixNote: string
  deal: string
  conversation: string; conversationEmpty: string; conversationFailed: string
  table: TableUi
}

const DASH = "—"

function Conversation({ order, words }: { order: string; words: ElementOrdersWords }) {
  const [rows, setRows] = useState<LogRow[] | "loading" | "failed">("loading")
  useEffect(() => {
    let live = true
    fetch(`/api/node/a2a-log?context=${encodeURIComponent(order)}&limit=200`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((b: { rows?: LogRow[] }) => live && setRows(Array.isArray(b.rows) ? [...b.rows].reverse() : "failed"))
      .catch(() => live && setRows("failed"))
    return () => {
      live = false
    }
  }, [order])
  if (rows === "loading") return <P className="text-muted-foreground">{words.loading}</P>
  if (rows === "failed") return <P className="text-muted-foreground">{words.conversationFailed}</P>
  if (rows.length === 0) return <P className="text-muted-foreground">{words.conversationEmpty}</P>
  return (
    <ul className="flex flex-col gap-1 text-[length:var(--fs-small)]" data-order-conversation={order}>
      {rows.map((r) => (
        <li key={r.id} className="flex flex-wrap gap-x-3 border-b border-border py-1">
          <span className="text-muted-foreground">{r.at.replace("T", " ").slice(0, 19)}</span>
          <span>{r.from_element} → {r.to_element}</span>
          <span>{r.method ?? DASH}</span>
          <span className="text-muted-foreground">{r.state ?? ""}</span>
        </li>
      ))}
    </ul>
  )
}

export function ElementOrdersIsland({ item, words }: { item: string; words: ElementOrdersWords }) {
  const [orders, setOrders] = useState<Order[] | "loading" | "failed">("loading")
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetch(`/api/node/element-orders?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean; orders?: Order[] }) => live && setOrders(b.ok && Array.isArray(b.orders) ? b.orders : "failed"))
      .catch(() => live && setOrders("failed"))
    return () => {
      live = false
    }
  }, [item])

  if (orders === "loading") {
    return (
      <p className="my-6 inline-flex items-center gap-2 text-sm text-muted-foreground" data-element-orders="loading">
        <Spinner /> {words.loading}
      </p>
    )
  }
  if (orders === "failed") return <p className="my-6 text-sm text-destructive" role="alert" data-element-orders="failed">{words.failed}</p>
  if (orders.length === 0) return <P className="text-muted-foreground" data-element-orders="empty">{words.empty}</P>

  const cell = "px-4 py-3 align-top whitespace-nowrap"
  const wide = "px-4 py-3 align-top min-w-[12rem] max-w-[20rem] whitespace-normal"
  const link = "text-primary underline-offset-4 hover:underline"

  const head = (
    <tr className="border-b border-border">
      {words.head.map((h) => (
        <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>
      ))}
    </tr>
  )

  const body = orders.map((o, i) => (
    <tr key={o.order} className="border-b border-border last:border-0 text-muted-foreground" data-order={o.order}>
      <td className={`${cell} font-medium text-foreground`}>{i + 1}</td>
      <td className={cell}>{o.closed.replace("T", " ").slice(0, 16)}</td>
      <td className={cell}>{words.incoming}</td>
      <td className={`${cell} text-foreground`}>{o.from || DASH}</td>
      <td className={cell}>{o.kind || DASH}</td>
      <td className={`${cell} text-foreground`} data-status={o.status}>{o.status || DASH}</td>
      <td className={cell}>{o.iterations || DASH}</td>
      <td className={wide}>{o.tags || DASH}</td>
      <td className={cell} data-lagrix="price">{DASH}</td>
      <td className={cell} data-lagrix="fee">{DASH}</td>
      <td className={cell} data-lagrix="escrow">{DASH}</td>
      <td className={cell} data-lagrix="receipt">{DASH}</td>
      <td className={cell} data-lagrix="transaction">{DASH}</td>
      <td className={cell} data-lagrix="like">{DASH}</td>
      <td className={cell}>
        <button type="button" className={link} onClick={() => setOpen(o.order)} data-order-open-button={o.order}>
          {words.open}
        </button>
      </td>
    </tr>
  ))

  const current = open ? orders.find((o) => o.order === open) : undefined

  return (
    <div className="flex flex-col gap-3" data-element-orders="list">
      <TableTools
        columns={words.head.length}
        head={head}
        rows={body}
        texts={orders.map((o) => [o.order, o.from, o.kind, o.status, o.tags].filter(Boolean).join(" "))}
        toggles={[
          { label: words.incoming, match: orders.map(() => true) },
          { label: words.outgoing, match: orders.map(() => false) },
        ]}
        words={words.table}
      />
      <p className="text-[length:var(--fs-small)] text-muted-foreground">{words.lagrixNote}</p>
      <Sheet open={!!current} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl" data-order-open={current?.order}>
          {current && (
            <>
              <SheetHeader>
                <SheetTitle>{words.deal}</SheetTitle>
                <SheetDescription className="break-all">{current.order}</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <ElementDoc files={[{ name: `${current.order}.md`, text: current.text, json: false }]} words={{ empty: words.empty }} />
                <P className="font-medium">{words.conversation}</P>
                <Conversation order={current.order} words={words} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
