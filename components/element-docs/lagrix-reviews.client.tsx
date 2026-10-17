"use client"

import { useEffect, useState } from "react"
import { CheckIcon, CopyIcon, ExternalLinkIcon, MessageSquareTextIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import { Small } from "@/components/ui/typography"
import { IndicatorHint } from "./indicator-hint.client"
import { SAMPLE_ORDERS, type SampleOrder } from "./lagrix-reviews.sample"

// «REVIEWS» UNDER THE PROVEN-VIOLATION LINE (step 517-1, owner 2026-10-17): «ниже чем вкладка доказанный нарушения в роли супер узла
// нарисуй карточку которая показывает закрытом виде какой процент отзывов был добавлен … При раскрытии внутри будут карточки которые
// будут отмечены зелёным шариком отзывы добавлен красным шариком отзыв не добавлен. Ещё будут карточки которые будут показывать заказы
// которые ещё не закончились и будут показывать таймер … пока заказ не закрыт отзыв поставить нельзя».
//
// A mockup on SAMPLE_ORDERS («only hard code»). Closed: the share of closed orders that already have a review — reviews ÷ closed
// orders (open orders are left out: no review is possible before closing, Lagrix 17.5). Open: one card per order — green dot with the
// review page, red dot with «Recall and review» (a dialog: the order number to copy and the keyword of the element skill
// `review-order`), grey dot with a countdown. The countdown ticks once a second only while the list is open (closed content is
// unmounted) and asks no door — it is a display, not a behaviour of the system.

export type LagrixReviewsWords = {
  /** BCP 47 tag for dates, the page language. */
  locale: string
  title: string
  hint: string[]
  toggle: string
  ofClosed: string
  sample: string
  provider: string
  customer: string
  with: string
  closedAt: string
  amount: string
  like: string
  dislike: string
  noReview: string
  open: string
  left: string
  afterClosing: string
  reviewPage: string
  noPage: string
  recall: string
  networkNumber: string
  samples: string[]
  dialog: { title: string; why: string; number: string; copy: string; copied: string; copyFailed: string; terminal: string; telegram: string; telegramPhrase: string; close: string }
}

function pad(n: number): string { return String(n).padStart(2, "0") }

function Countdown({ minutes, words }: { minutes: number; words: LagrixReviewsWords }) {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    const deadline = Date.now() + minutes * 60_000
    const tick = () => setLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [minutes])
  const text = left === null ? "—:—" : `${left >= 3600 ? `${Math.floor(left / 3600)}:` : ""}${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`
  return (
    <span className="font-mono text-lg font-bold tabular-nums text-foreground" data-review-countdown>
      <span className="sr-only">{words.left} </span>{text}
    </span>
  )
}

function RecallDialog({ order, words }: { order: string; words: LagrixReviewsWords }) {
  // The clipboard API exists only in a secure context; the old `execCommand` is the fallback, and a failure says what to do instead of
  // repeating the button's label (ANTI-PATTERNS: «Возможность браузера есть только на HTTPS»).
  const [copied, setCopied] = useState<"no" | "yes" | "failed">("no")
  const copy = async () => {
    let ok = false
    try { await navigator.clipboard.writeText(order); ok = true } catch {
      const t = document.createElement("textarea")
      t.value = order
      document.body.appendChild(t)
      t.select()
      try { ok = document.execCommand("copy") } catch { ok = false }
      t.remove()
    }
    setCopied(ok ? "yes" : "failed")
    if (ok) setTimeout(() => setCopied("no"), 1500)
  }
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setOpen(true)} data-review-recall>
        <MessageSquareTextIcon aria-hidden />
        {words.recall}
      </Button>
      <AppDialog open={open} onOpenChange={setOpen} title={words.dialog.title} description={words.dialog.why} ui={{ close: words.dialog.close }}>
        <div className="flex flex-col gap-4" data-review-dialog>
          <div className="flex flex-col gap-2">
            <Small className="font-medium text-foreground">{words.dialog.number}</Small>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-3 py-2 font-mono text-xs" data-review-dialog-order>{order}</code>
              <Button size="sm" variant="outline" onClick={copy} aria-label={words.dialog.copy}>
                {copied === "yes" ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
                {copied === "yes" ? words.dialog.copied : words.dialog.copy}
              </Button>
            </div>
            {copied === "failed" && <Small className="text-destructive">{words.dialog.copyFailed}</Small>}
          </div>
          <div className="flex flex-col gap-2">
            <Small className="font-medium text-foreground">{words.dialog.terminal}</Small>
            <code className="rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all" data-review-dialog-keyword>/review-order {order}</code>
          </div>
          <div className="flex flex-col gap-2">
            <Small className="font-medium text-foreground">{words.dialog.telegram}</Small>
            <code className="rounded-md border bg-muted px-3 py-2 font-mono text-xs break-all">{words.dialog.telegramPhrase} {order}</code>
          </div>
        </div>
      </AppDialog>
    </>
  )
}

function OrderCard({ o, words }: { o: SampleOrder; words: LagrixReviewsWords }) {
  const state = o.closed === null ? "open" : o.review ? "done" : "missing"
  const dot = state === "done" ? "bg-emerald-500" : state === "missing" ? "bg-destructive" : "bg-muted-foreground/60"
  const date = o.closed ? new Date(o.closed).toLocaleString(words.locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background/70 p-4" data-review-state={state} data-review-order={o.order}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`size-3 shrink-0 rounded-full ${dot}`} role="img" aria-label={state === "done" ? (o.review === "like" ? words.like : words.dislike) : state === "missing" ? words.noReview : words.open} />
        <Badge variant="outline">{o.role === "provider" ? words.provider : words.customer}</Badge>
        <code className="min-w-0 truncate font-mono text-xs text-muted-foreground" title={o.order}>{o.order}</code>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{words.samples[o.about]}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <span>{words.with}: <span className="font-mono text-foreground">{o.counterpart}</span></span>
        <span>{words.amount}: <span className="font-mono text-foreground">{o.amount.toFixed(2)} USDC</span></span>
        {date && <span>{words.closedAt}: <span className="text-foreground">{date}</span></span>}
        <span>{words.networkNumber}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {state === "done" && (
          <>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              {o.review === "like" ? <ThumbsUpIcon aria-hidden className="size-4 text-primary" /> : <ThumbsDownIcon aria-hidden className="size-4 text-muted-foreground" />}
              {o.review === "like" ? words.like : words.dislike}
            </Small>
            {o.page ? (
              <a href={o.page} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })} data-review-page>
                <ExternalLinkIcon aria-hidden />
                {words.reviewPage}
              </a>
            ) : (
              <Small>{words.noPage}</Small>
            )}
          </>
        )}
        {state === "missing" && (
          <>
            <Small className="font-medium text-destructive">{words.noReview}</Small>
            <RecallDialog order={o.order} words={words} />
          </>
        )}
        {state === "open" && (
          <>
            <Small className="flex items-center gap-2">{words.left} <Countdown minutes={o.minutesLeft ?? 0} words={words} /></Small>
            <Small>{words.afterClosing}</Small>
          </>
        )}
      </div>
    </div>
  )
}

export function LagrixReviews({ words, id }: { words: LagrixReviewsWords; id?: string }) {
  const closed = SAMPLE_ORDERS.filter((o) => o.closed !== null)
  const reviewed = closed.filter((o) => o.review !== null)
  const percent = closed.length ? Math.round((reviewed.length / closed.length) * 100) : 0
  return (
    <Accordion type="single" collapsible className="rounded-lg border border-primary/20 bg-background/70 px-4" data-lagrix-reviews={id ?? ""}>
      <AccordionItem value="reviews" className="border-b-0">
        <div className="flex items-center gap-2">
          <Small className="flex items-center gap-2 font-medium text-foreground">
            <MessageSquareTextIcon aria-hidden className="size-4 text-primary" />
            {words.title}
            <IndicatorHint label={`${words.title}: ${words.toggle}`} text={words.hint} />
          </Small>
          <AccordionTrigger aria-label={words.toggle} className="items-center justify-end py-3">
            <span className="flex items-baseline gap-2" data-reviews-percent={percent}>
              <span className="font-mono text-lg font-bold tabular-nums text-foreground">{percent} %</span>
              <span className="text-xs font-normal text-muted-foreground">{reviewed.length} / {closed.length} {words.ofClosed}</span>
            </span>
          </AccordionTrigger>
        </div>
        <AccordionContent className="flex flex-col gap-3 pb-4">
          <Small>{words.sample}</Small>
          {SAMPLE_ORDERS.map((o) => <OrderCard key={o.order} o={o} words={words} />)}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
