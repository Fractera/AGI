// SAMPLE ORDERS OF THE «REVIEWS» CARD (step 517-1). The owner, 2026-10-17: «only hard code , for skill - it is first draft, no more» and
// «я сейчас моделирую интерфейс для того чтобы вспомнить все имеющиеся опции которые у нас будут будущем взаимодействовать и выстроить
// очерёдность их разработки не более того». So the card is a mockup: these rows are invented examples, the card says so above the list,
// and this file is their only source — real orders (summaries `data/services/<id>/orders/`, the A2A journal) replace this one file later.
//
// The shape follows Lagrix: a review exists only after the deal is closed (document 17, section 17.5), each side reviews the other, and
// the author of a review may attach the address of a review page once (document 25). Order numbers have the Fractera form
// `<element id>-<uuidv7>`; the network's deal number (the escrow `taskId`, document 04) does not exist yet.

export type SampleReview = "like" | "dislike" | null

export type SampleOrder = {
  /** Fractera order number: `<element id>-<uuidv7>`. */
  order: string
  role: "provider" | "customer"
  /** The other side of the deal: an element id, never a person's name. */
  counterpart: string
  /** Closed deals carry their closing date; open deals carry minutes left until their deadline, counted from opening the card. */
  closed: string | null
  minutesLeft?: number
  /** Index into the words' `samples` — what the deal was about, in the page language. */
  about: number
  /** The network part of the deal, USDC. */
  amount: number
  review: SampleReview
  /** The address of the review page its author attached, if any (an example domain). */
  page?: string
}

export const SAMPLE_ORDERS: SampleOrder[] = [
  { order: "roman-0199f3a2-6c1e-7b40-9d2a-4e8f1c7a5b13", role: "provider", counterpart: "lagrix", closed: "2026-10-16T14:20:00Z", about: 0, amount: 40, review: "like", page: "https://example.org/reviews/landing-section" },
  { order: "kx7pq-0199f1d8-2b9a-7e51-8c34-9a1d0e6f2c77", role: "customer", counterpart: "kx7pq", closed: "2026-10-15T09:05:00Z", about: 1, amount: 12, review: "dislike" },
  { order: "roman-0199f4b6-81d3-7a02-b5e9-37c2d8f04a91", role: "provider", counterpart: "mzjce", closed: "2026-10-17T08:40:00Z", about: 2, amount: 25, review: null },
  { order: "trv2n-0199f2e0-4f7c-7c18-a6b1-5d93e2c18f04", role: "customer", counterpart: "trv2n", closed: "2026-10-14T18:30:00Z", about: 3, amount: 8, review: null },
  { order: "roman-0199f5c1-9e42-7d6b-8f10-c4a7b2e95d38", role: "provider", counterpart: "lagrix", closed: null, minutesLeft: 14, about: 4, amount: 60, review: null },
  { order: "qw4ze-0199f5d7-3a68-7f29-9b5c-e1f0a6d47c22", role: "customer", counterpart: "qw4ze", closed: null, minutesLeft: 185, about: 5, amount: 15, review: null },
]
