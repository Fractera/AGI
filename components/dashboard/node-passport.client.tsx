"use client"

import { useEffect, useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { LagrixRating, type LagrixRatingWords } from "@/components/element-docs/lagrix-rating"

// «ПАСПОРТ» УЗЛА (478-1, переделан по слову владельца 2026-10-14): «посмотри вкладку роман, дизайн в блоке а2а … именно такая
// карточка у нас должна была лежать в паспорте и описывать аккумулирующий рейтинг по всем элементам а под ним должны были быть все
// элементы … то же самый дизайн который будет иметь полное заголовок, первую строчку описание и возможность раскрыть полное описание
// а также интерфейс … если нет описания чтобы его заказать».
//
// Сверху — карточка рейтинга Lagrix (`LagrixRating`, та же, что на главной A2A элемента) для всего узла; под ней та же карточка на
// каждый элемент (root и кастомные). Описание раскрывается аккордеоном — открыто одно на всю страницу. Нет описания — красная точка
// у заголовка и красная кнопка, открывающая терминал элемента с задачей «опиши себя». Карточки спрашиваются у `/api/node/passport`
// один раз при открытии (опроса нет).

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
  rating: LagrixRatingWords
  nodeTitle: string
  nodeLead: string
  nodeNote: string
  elementNote: string
  root: string
  custom: string
  loading: string
  unavailable: string
  empty: string
  noDescription: string
  generate: string
  notBorn: string
  fullDescription: string
  provides: string
  openElement: string
  wallet: {
    title: string
    lead: string
    connected: string
    placeholder: string
    connect: string
    disconnect: string
    badAddress: string
    failed: string
    beforeTitle: string
    before: string[]
    afterTitle: string
    after: string[]
  }
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function NodePassport({ words, lang }: { words: NodePassportWords; lang: string }) {
  const [cards, setCards] = useState<Card[] | "loading" | "failed">("loading")
  const [wallet, setWallet] = useState<{ address: string } | null>(null)
  const [address, setAddress] = useState("")
  const [walletError, setWalletError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/api/node/passport?lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { cards: Card[]; wallet: { address: string } | null }) => { setCards(d.cards); setWallet(d.wallet) })
      .catch(() => setCards("failed"))
  }, [lang])

  const node = (
    <LagrixRating id="node" words={{ ...words.rating, note: words.nodeNote }} title={words.nodeTitle} lead={words.nodeLead} />
  )

  // 478-3: подключить и отключить кошелёк — ответ двери сразу меняет вид, без перезагрузки страницы.
  const send = async (method: "POST" | "DELETE") => {
    setBusy(true)
    setWalletError(null)
    try {
      const r = await fetch(`${BASE}/api/node/wallet`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ address }) : undefined,
      })
      if (r.status === 422) { setWalletError(words.wallet.badAddress); return }
      if (!r.ok) { setWalletError(words.wallet.failed); return }
      const d = (await r.json()) as { wallet: { address: string } | null }
      setWallet(d.wallet ? { address: d.wallet.address } : null)
      setAddress("")
    } catch {
      setWalletError(words.wallet.failed)
    } finally {
      setBusy(false)
    }
  }

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`
  const walletCard = (
    <UiCard className="my-6" data-node-wallet={wallet ? "connected" : "none"}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{words.wallet.title}</CardTitle>
        <CardDescription>{words.wallet.lead}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {wallet ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">{words.wallet.connected}</span>
            <code className="font-mono text-base text-foreground" title={wallet.address}>{short(wallet.address)}</code>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => send("DELETE")}>{words.wallet.disconnect}</Button>
          </div>
        ) : (
          <>
            <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); send("POST") }}>
              <Input className="max-w-md font-mono" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={words.wallet.placeholder} aria-label={words.wallet.placeholder} spellCheck={false} />
              <Button type="submit" disabled={busy || !address.trim()}>{words.wallet.connect}</Button>
            </form>
            <AccordionItem value="wallet-before" className="rounded-lg border border-destructive/40 bg-destructive/5 px-4" data-wallet-before>
              <AccordionTrigger className="text-destructive">{words.wallet.beforeTitle}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-5 text-foreground">{words.wallet.before.map((x) => <li key={x}>{x}</li>)}</ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="wallet-after" className="rounded-lg border border-primary/30 bg-primary/5 px-4" data-wallet-after>
              <AccordionTrigger className="text-primary">{words.wallet.afterTitle}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc space-y-1 pl-5 text-foreground">{words.wallet.after.map((x) => <li key={x}>{x}</li>)}</ul>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
        {walletError && <p className="text-sm text-destructive" role="alert">{walletError}</p>}
      </CardContent>
    </UiCard>
  )

  if (cards === "loading") {
    return (
      <>
        {node}
        <p className="my-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> {words.loading}</p>
      </>
    )
  }
  if (cards === "failed") return <>{node}<p className="my-6 text-sm text-destructive" role="alert">{words.unavailable}</p></>
  if (cards.length === 0) return <>{node}<p className="my-6 text-sm text-muted-foreground">{words.empty}</p></>

  return (
    <>
      {node}
      <Accordion type="single" collapsible>
        {walletCard}
        {cards.map((c) => {
          const dot = c.described ? null : (
            <span className="size-2.5 shrink-0 rounded-full bg-destructive" role="img" aria-label={words.noDescription} data-no-description />
          )
          const kind = { ...words.rating, eyebrow: c.id === "root" ? words.root : words.custom, note: words.elementNote }
          return (
            <div key={c.id} data-passport={c.id} data-described={c.described ? "yes" : "no"}>
              <LagrixRating
                id={c.id}
                words={kind}
                marker={dot}
                title={<a href={`${BASE}/${lang}${c.open}`} className="underline-offset-4 hover:underline" title={words.openElement}>{c.name}</a>}
                lead={<span className="line-clamp-1">{c.lead ?? words.noDescription}</span>}
              >
                {c.described && c.summary ? (
                  <AccordionItem value={c.id} className="border-b-0">
                    <AccordionTrigger className="py-1 text-primary">{words.fullDescription}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-3 pb-1">
                      <p className="leading-relaxed text-foreground">{c.summary}</p>
                      {c.provides.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{words.provides}</p>
                          <ul className="list-disc space-y-0.5 pl-5 text-foreground">
                            {c.provides.map((p) => <li key={p}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ) : c.generate ? (
                  <div>
                    <a href={`${BASE}${c.generate}`} className={buttonVariants({ variant: "destructive", size: "sm" })}>{words.generate}</a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{words.notBorn}</p>
                )}
              </LagrixRating>
            </div>
          )
        })}
      </Accordion>
    </>
  )
}
