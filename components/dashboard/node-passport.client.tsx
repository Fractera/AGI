"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

// КАРТОЧКИ ЭЛЕМЕНТОВ «ПАСПОРТА» УЗЛА (478-1). Страница предрендерена — карточки спрашиваются у `/api/node/passport` один раз
// при открытии (опроса нет: его не заказывали). Аккордеон один на страницу: открыта не больше одной карточки (слово владельца).
// Нет описания — красная точка слева и красная кнопка «Сгенерировать описание» внутри; кнопка ведёт в терминал элемента.

type Card = {
  id: string
  custom: boolean
  name: string
  lead: string | null
  summary: string | null
  provides: string[]
  described: boolean
  open: string
  generate: string | null
  reputation: null
}

export type NodePassportWords = {
  loading: string
  unavailable: string
  empty: string
  noDescription: string
  generate: string
  notBorn: string
  provides: string
  reputation: string
  provider: string
  customer: string
  likes: string
  dislikes: string
  reputationNote: string
  openElement: string
  missing: string
  native: string
  custom: string
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DASH = "—"

export function NodePassport({ words, lang }: { words: NodePassportWords; lang: string }) {
  const [cards, setCards] = useState<Card[] | "loading" | "failed">("loading")

  useEffect(() => {
    fetch(`${BASE}/api/node/passport?lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { cards: Card[] }) => setCards(d.cards))
      .catch(() => setCards("failed"))
  }, [lang])

  if (cards === "loading") {
    return (
      <p className="my-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> {words.loading}
      </p>
    )
  }
  if (cards === "failed") return <p className="my-6 text-sm text-destructive" role="alert">{words.unavailable}</p>
  if (cards.length === 0) return <p className="my-6 text-sm text-muted-foreground">{words.empty}</p>

  const missing = cards.filter((c) => !c.described).length

  return (
    <div className="my-6">
      {missing > 0 && (
        <p className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
          {words.missing.replace("{n}", String(missing))}
        </p>
      )}
      <Accordion type="single" collapsible className="rounded-lg border border-border">
        {cards.map((c) => (
          <AccordionItem key={c.id} value={c.id} className="px-4" data-passport={c.id} data-described={c.described ? "yes" : "no"}>
            <AccordionTrigger className="items-center hover:no-underline">
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`mt-1.5 size-2.5 shrink-0 rounded-full ${c.described ? "bg-transparent" : "bg-destructive"}`}
                  aria-label={c.described ? undefined : words.noDescription}
                  role={c.described ? undefined : "img"}
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-foreground">{c.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{c.custom ? words.custom : words.native}</span>
                  </span>
                  <span className="line-clamp-2 font-normal text-muted-foreground">{c.lead ?? words.noDescription}</span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex flex-col gap-4 pl-5.5">
                {c.summary ? (
                  <p className="leading-relaxed text-foreground">{c.summary}</p>
                ) : (
                  <div className="flex flex-col items-start gap-2">
                    <p className="text-muted-foreground">{words.noDescription}</p>
                    {c.generate ? (
                      <a href={`${BASE}${c.generate}`} className={buttonVariants({ variant: "destructive", size: "sm" })}>{words.generate}</a>
                    ) : (
                      <p className="text-xs text-muted-foreground">{words.notBorn}</p>
                    )}
                  </div>
                )}
                {c.provides.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{words.provides}</p>
                    <ul className="list-disc space-y-0.5 pl-5 text-foreground">
                      {c.provides.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{words.reputation}</p>
                  <table className="text-sm">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th scope="col" className="pr-6 text-left font-normal"><span className="sr-only">{words.reputation}</span></th>
                        <th scope="col" className="pr-6 text-left font-normal">{words.likes}</th>
                        <th scope="col" className="text-left font-normal">{words.dislikes}</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {[words.provider, words.customer].map((role) => (
                        <tr key={role}>
                          <th scope="row" className="pr-6 text-left font-normal">{role}</th>
                          <td className="pr-6">{DASH}</td>
                          <td>{DASH}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-1 text-xs text-muted-foreground">{words.reputationNote}</p>
                </div>
                <a href={`${BASE}/${lang}${c.open}`} className="text-sm text-primary underline-offset-4 hover:underline">{words.openElement}</a>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
