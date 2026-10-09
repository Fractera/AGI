import { HandshakeIcon, StarIcon, ThumbsDownIcon, ThumbsUpIcon, WalletIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eyebrow, Small } from "@/components/ui/typography"

// THE ELEMENT'S RATING IN AIFA (step 436-3) — on the home page of «Links (A2A)».
//
// Owner 2026-10-09: a hard-coded placeholder «as large and expressive as the address on the element's home page»: completed
// orders, partners' likes and dislikes, balance. AIFA is the external architecture that settles paid work between agents; until an
// element is connected to it there is no source of these numbers, so every value is «—», never an invented number (the same rule
// as «—» on Dashboard → Projects, owner 2026-09-30). The style repeats the port card (`service-port.client.tsx`): big mono digits.

export type AifaRatingWords = {
  eyebrow: string
  title: string
  lead: string
  completed: string
  ratings: string
  likes: string
  dislikes: string
  balance: string
  balanceUnit: string
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

export function AifaRating({ words }: { words: AifaRatingWords }) {
  const tile = "flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/70 p-4"
  return (
    <Card className="my-6 bg-primary/5 ring-primary/40" data-aifa-rating="placeholder">
      <CardHeader>
        <Eyebrow>{words.eyebrow}</Eyebrow>
        <CardTitle className="text-xl font-semibold">{words.title}</CardTitle>
        <CardDescription>{words.lead}</CardDescription>
        <CardAction>
          <StarIcon role="img" aria-hidden className="size-6 text-primary" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className={tile} data-aifa-completed>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              <HandshakeIcon aria-hidden className="size-4 text-primary" />
              {words.completed}
            </Small>
            <Value empty={words.empty} label={words.completed}>{null}</Value>
          </div>
          <div className={tile} data-aifa-ratings>
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
          <div className={tile} data-aifa-balance>
            <Small className="flex items-center gap-2 font-medium text-foreground">
              <WalletIcon aria-hidden className="size-4 text-primary" />
              {words.balance}
            </Small>
            <Value empty={words.empty} label={words.balance}>{null}</Value>
            <Small>{words.balanceUnit}</Small>
          </div>
        </div>
        <Small>{words.note}</Small>
      </CardContent>
    </Card>
  )
}
