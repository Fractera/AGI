import { BanIcon, ClipboardListIcon, FlameIcon, MessageSquareDashedIcon, ShieldAlertIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eyebrow, Small } from "@/components/ui/typography"

// THE ELEMENT'S REPUTATION IN Lagrix (step 436-3) — on the home page of «Links (A2A)» and on the node passport (478-1).
//
// Until an element is connected to the network there is no source of these numbers, so every value is «—», never an invented number
// (the same rule as «—» on Dashboard → Projects, owner 2026-09-30).
//
// 495-1 (owner 2026-10-15): «под каждую позицию нужна своя карточка … в два ряда … на телефоне они стояли в колонку». Six indicators of
// the protocol (changelog entries 43 and 44), each a pair «count · sum»: all orders, likes, dislikes, burned, cancelled orders, unreviewed.
// Likes, dislikes and burned are weight (the fee paid, USDC); all orders, cancelled and unreviewed are sums of the deals' network parts.
// Under them the «proven violation as a super-node» line. No balance: the card shows reputation, not money. The passport passes its own
// title, lead, a marker before the title and a slot under the header; the A2A home page passes nothing.

export type LagrixRatingWords = {
  eyebrow: string
  title: string
  lead: string
  orders: string
  likes: string
  dislikes: string
  burned: string
  cancelled: string
  unreviewed: string
  /** «count · weight» — under likes, dislikes and burned. */
  weightUnit: string
  /** «count · sum» — under all orders, cancelled and unreviewed. */
  sumUnit: string
  violation: string
  empty: string
  note: string
}

type Indicator = { key: "orders" | "likes" | "dislikes" | "burned" | "cancelled" | "unreviewed"; Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>; tone: string; unit: "weightUnit" | "sumUnit" }
const INDICATORS: Indicator[] = [
  { key: "orders", Icon: ClipboardListIcon, tone: "text-primary", unit: "sumUnit" },
  { key: "likes", Icon: ThumbsUpIcon, tone: "text-primary", unit: "weightUnit" },
  { key: "dislikes", Icon: ThumbsDownIcon, tone: "text-muted-foreground", unit: "weightUnit" },
  { key: "burned", Icon: FlameIcon, tone: "text-destructive", unit: "weightUnit" },
  { key: "cancelled", Icon: BanIcon, tone: "text-destructive", unit: "sumUnit" },
  { key: "unreviewed", Icon: MessageSquareDashedIcon, tone: "text-muted-foreground", unit: "sumUnit" },
]

export function LagrixRating({ words, title, lead, marker, children, id }: {
  words: LagrixRatingWords
  title?: ReactNode
  lead?: ReactNode
  marker?: ReactNode
  children?: ReactNode
  id?: string
}) {
  return (
    <Card className="my-6 bg-primary/5 ring-primary/40" data-lagrix-rating="placeholder" data-rating-of={id}>
      <CardHeader>
        <Eyebrow>{words.eyebrow}</Eyebrow>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">{marker}{title ?? words.title}</CardTitle>
        <CardDescription>{lead ?? words.lead}</CardDescription>
        <CardAction>
          <StarIcon role="img" aria-hidden className="size-6 text-primary" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {children}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" data-lagrix-indicators>
          {INDICATORS.map(({ key, Icon, tone, unit }) => (
            <div key={key} className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/70 p-4" data-lagrix-indicator={key}>
              <Small className="flex items-center gap-2 font-medium text-foreground">
                <Icon aria-hidden className={`size-4 ${tone}`} />
                {words[key]}
              </Small>
              <p className="flex items-baseline gap-2 font-mono text-4xl font-black tracking-tight tabular-nums text-foreground" aria-label={`${words[key]}: ${words[unit]}`}>
                {words.empty}
                <span aria-hidden className="text-2xl font-semibold text-muted-foreground">·</span>
                {words.empty}
              </p>
              <Small>{words[unit]}</Small>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-background/70 px-4 py-3" data-lagrix-violation>
          <Small className="flex items-center gap-2 font-medium text-foreground">
            <ShieldAlertIcon aria-hidden className="size-4 text-destructive" />
            {words.violation}
          </Small>
          <span className="font-mono text-lg font-bold tabular-nums text-foreground">{words.empty}</span>
        </div>
        <Small>{words.note}</Small>
      </CardContent>
    </Card>
  )
}
