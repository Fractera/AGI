import { BanIcon, HandshakeIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon, WalletIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eyebrow, Small } from "@/components/ui/typography"

// THE ELEMENT'S RATING IN Lagrix (step 436-3) — on the home page of «Links (A2A)».
//
// Owner 2026-10-09: a hard-coded placeholder «as large and expressive as the address on the element's home page»: completed
// orders, partners' likes and dislikes, balance. Lagrix is the external architecture that settles paid work between agents; until an
// element is connected to it there is no source of these numbers, so every value is «—», never an invented number (the same rule
// as «—» on Dashboard → Projects, owner 2026-09-30). The style repeats the port card (`service-port.client.tsx`): big mono digits.
//
// 478-1 (owner 2026-10-14): the same card is the design of the node passport — once for the whole node (the accumulated rating of all
// elements) and once per element under it; a fourth tile «cancelled orders» (count and sum — the rejection metric of step 482). The
// passport passes its own title, lead, a marker before the title and a slot under the header (the description and the button that
// orders it); the A2A home page passes nothing and looks as before, with the fourth tile.

export type LagrixRatingWords = {
  eyebrow: string
  title: string
  lead: string
  completed: string
  ratings: string
  likes: string
  dislikes: string
  balance: string
  balanceUnit: string
  cancelled: string
  cancelledUnit: string
  empty: string
  note: string
}

function Value({ label, empty, children }: { label: string; empty: string; children: ReactNode }) {
  return (
    <p className="flex items-baseline gap-2" aria-label={label}>
      {children}
      <span className="font-mono text-5xl font-black tracking-tight tabular-nums text-foreground">{empty}</span>
    </p>
  )
}

export function LagrixRating({ words, title, lead, marker, children, id }: {
  words: LagrixRatingWords
  title?: ReactNode
  lead?: ReactNode
  marker?: ReactNode
  children?: ReactNode
  id?: string
}) {
  const tile = "flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/70 p-4"
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className={tile} data-lagrix-completed>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              <HandshakeIcon aria-hidden className="size-4 text-primary" />
              {words.completed}
            </Small>
            <Value empty={words.empty} label={words.completed}>{null}</Value>
          </div>
          <div className={tile} data-lagrix-ratings>
            <Small className="font-medium text-foreground">{words.ratings}</Small>
            <div className="flex flex-wrap items-baseline gap-6">
              <Value empty={words.empty} label={words.likes}>
                <ThumbsUpIcon aria-hidden className="size-6 self-center text-primary" />
              </Value>
              <Value empty={words.empty} label={words.dislikes}>
                <ThumbsDownIcon aria-hidden className="size-6 self-center text-muted-foreground" />
              </Value>
            </div>
          </div>
          <div className={tile} data-lagrix-balance>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              <WalletIcon aria-hidden className="size-4 text-primary" />
              {words.balance}
            </Small>
            <Value empty={words.empty} label={words.balance}>{null}</Value>
            <Small>{words.balanceUnit}</Small>
          </div>
          <div className={tile} data-lagrix-cancelled>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              <BanIcon aria-hidden className="size-4 text-destructive" />
              {words.cancelled}
            </Small>
            <Value empty={words.empty} label={words.cancelled}>{null}</Value>
            <Small>{words.cancelledUnit}</Small>
          </div>
        </div>
        <Small>{words.note}</Small>
      </CardContent>
    </Card>
  )
}
