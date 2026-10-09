"use client"

import { useEffect, useState } from "react"
import { P } from "@/components/ui/typography"
import { ElementDoc } from "./element-doc"

// ISLAND «Links (A2A) → Deals» (step 412-6; 436-2 — formerly «Process → Orders»): the element's order summaries, newest first. Each opens to its summary and the
// conversation behind it — rows of the node's log with the same contextId (pinned by `order:save`, so they are not pushed out).
// Four states: loading · list · empty · refused (a refusal means «unknown», not «there are no orders»).

type Order = { order: string; closed: string; status: string; from: string; kind: string; tags: string; iterations: string; text: string }
type LogRow = { id: number; at: string; from_element: string; to_element: string; method: string | null; state: string | null }

export type ElementOrdersWords = {
  loading: string; failed: string; empty: string
  closed: string; status: string; from: string; kind: string; tags: string; iterations: string
  conversation: string; conversationEmpty: string; conversationFailed: string
}

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
          <span>{r.method ?? "—"}</span>
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

  if (orders === "loading") return <P className="text-muted-foreground" data-element-orders="loading">{words.loading}</P>
  if (orders === "failed") return <P className="text-muted-foreground" data-element-orders="failed">{words.failed}</P>
  if (orders.length === 0) return <P className="text-muted-foreground" data-element-orders="empty">{words.empty}</P>
  return (
    <div className="flex flex-col gap-3" data-element-orders="list">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[length:var(--fs-small)]">
          <thead>
            <tr>
              {[words.closed, words.status, words.from, words.kind, words.tags, words.iterations].map((h) => (
                <th key={h} className="border-b border-border px-2 py-1 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.order}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => setOpen(open === o.order ? null : o.order)}
                data-order={o.order}
              >
                <td className="border-b border-border px-2 py-1">{o.closed.replace("T", " ").slice(0, 16)}</td>
                <td className="border-b border-border px-2 py-1">{o.status}</td>
                <td className="border-b border-border px-2 py-1">{o.from}</td>
                <td className="border-b border-border px-2 py-1">{o.kind}</td>
                <td className="border-b border-border px-2 py-1">{o.tags}</td>
                <td className="border-b border-border px-2 py-1">{o.iterations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4" data-order-open={open}>
          <ElementDoc files={[{ name: `${open}.md`, text: orders.find((o) => o.order === open)?.text ?? "", json: false }]} words={{ empty: words.empty }} />
          <P className="font-medium">{words.conversation}</P>
          <Conversation order={open} words={words} />
        </div>
      )}
    </div>
  )
}
