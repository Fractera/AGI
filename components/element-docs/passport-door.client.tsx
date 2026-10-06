"use client"

import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { H3, P } from "@/components/ui/typography"

// THE PASSPORT AS THE CORE RECEIVES IT (step 417): the element's door asked with the node key — the file plus the fields the door
// computes. «Generate description» opens the element's terminal with the task for the skill `passport-description`; the agent
// shows the texts and writes them after the person's «yes». Four states of the answer: loading · passport · not deployed · refused.

export type PassportDoorWords = {
  generate: string
  generateLead: string
  answerTitle: string
  answerLead: string
  loading: string
  failed: string
}

export function PassportDoor({ item, terminalHref, words }: { item: string; terminalHref: string; words: PassportDoorWords }) {
  const [passport, setPassport] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    fetch(`/api/node/own-service-props?item=${encodeURIComponent(item)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((b: { ok?: boolean; passport?: unknown; error?: string }) => {
        if (!live) return
        if (b.ok) setPassport(b.passport)
        else setError(b.error ?? "unknown")
      })
      .catch((e) => live && setError(String(e)))
    return () => {
      live = false
    }
  }, [item])

  return (
    <div className="my-6 flex flex-col gap-6" data-passport-door>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
        <div>
          <a href={terminalHref} className={buttonVariants()} data-passport-generate>{words.generate}</a>
        </div>
        <P className="text-muted-foreground">{words.generateLead}</P>
      </div>
      <div className="flex flex-col gap-2">
        <H3>{words.answerTitle}</H3>
        <P className="text-muted-foreground">{words.answerLead}</P>
        {error ? (
          <P className="text-muted-foreground" data-passport-door-state="failed">{words.failed} ({error})</P>
        ) : passport === null ? (
          <P className="text-muted-foreground" data-passport-door-state="loading">{words.loading}</P>
        ) : (
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 text-[length:var(--fs-small)]" data-passport-door-state="ok">
            {JSON.stringify(passport, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
