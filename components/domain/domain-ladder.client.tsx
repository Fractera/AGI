"use client"

import { Check, ExternalLink, TriangleAlert } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { H3, Small } from "@/components/ui/typography"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"

// ЛЕСТНИЦА ПОДКЛЮЧЕНИЯ СВОЕГО ДОМЕНА (259-1).
//
// 🎯 УСТРОЙСТВО ВЗЯТО У ОБРАЗЦА, НАЗВАННОГО ВЛАДЕЛЬЦЕМ: канал управления в службе
// памяти (`build-channel.client.tsx`). Оттуда три закона, и каждый оплачен его же
// словами 2026-09-17 «вообще непонятно что делать… никаких признаков того, что
// токен был успешно подключён, я не увидел»:
//
//   1. ЛЕСТНИЦА, А НЕ ПОЛОТНО. Ступень открывается, когда сделана предыдущая. На
//      месте закрытой стоит серая строка, называющая, ЧТО здесь появится и ПОСЛЕ
//      ЧЕГО. Скрытая без такой строки — то же «непонятно что делать», только тише.
//   2. ОТВЕТ ВСЕГДА ВИДЕН, И У УСПЕХА ОН НАЗЫВАЕТ СЛЕДУЮЩИЙ ШАГ. Молчаливый успех
//      неотличим от молчаливого отказа.
//   3. СЕКРЕТ УХОДИТ И НЕ ВОЗВРАЩАЕТСЯ. Сюда приходит только «настроен» и хвост.
//
// 🔒 СОСТОЯНИЕ СПРАШИВАЕТСЯ У УЗЛА, А НЕ ПОМНИТСЯ ЗДЕСЬ. Островок, который сам
// решает, «докуда дошёл человек», врёт при открытии с другого устройства. Отсюда
// разделение: что СДЕЛАНО — говорит дверь; что человек ПРОСМОТРЕЛ — местное дело
// экрана, и оно не выдаётся за сделанное.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type State = {
  keyConfigured: boolean
  keyTail: string | null
  zone: string | null
  hostname: string | null
  nodeUrl: string | null
  quickTunnel: string | null
}

function Step({ children, done, n, title }: { children: ReactNode; done?: boolean; n: number; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-step={n}>
      <H3 className="mb-2 flex items-center gap-2" variant="ui">
        <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check className="size-3.5" aria-hidden /> : n}
        </span>
        {title}
      </H3>
      {children}
    </section>
  )
}

/** Серая строка на месте закрытой ступени: что здесь появится и после чего. */
function Locked({ n, text }: { n: number; text: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-border border-dashed px-4 py-3 text-muted-foreground text-sm" data-step-locked={n}>
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      {text}
    </p>
  )
}

export function DomainLadder({ words }: { words: DomainLadderWords }) {
  const [state, setState] = useState<State | null>(null)
  // Сколько ступеней человек объявил пройденными. Это НЕ состояние узла: узел
  // не может проверить, сменил ли человек серверы имён, пока у него нет ключа.
  const [claimed, setClaimed] = useState(0)

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setState(d as State) })
      .catch(() => { if (alive) setState(null) })
    return () => { alive = false }
  }, [])

  if (!state) return <p className="text-muted-foreground text-sm">{words.loading}</p>

  // Ключ работает — значит первые три ступени пройдены по факту, а не по слову.
  const outside = state.keyConfigured ? 3 : claimed
  const mark = (n: number) => setClaimed((c) => Math.max(c, n))

  const manual: Array<{ n: number; title: string; text: string }> = [
    { n: 1, title: words.step1Title, text: words.step1Text },
    { n: 2, title: words.step2Title, text: words.step2Text },
    { n: 3, title: words.step3Title, text: words.step3Text },
  ]

  return (
    <div className="my-6 flex flex-col gap-3" data-domain-ladder>
      <p className="text-muted-foreground text-sm">{words.lead}</p>

      {manual.map((s) => (
        <Step key={s.n} n={s.n} title={s.title} done={outside >= s.n}>
          <p className="text-muted-foreground text-sm">{s.text}</p>
          {outside < s.n && outside === s.n - 1 ? (
            <Button className="mt-3" size="sm" variant="outline" onClick={() => mark(s.n)}>
              {words.next}
            </Button>
          ) : null}
        </Step>
      ))}

      {outside >= 3 ? (
        <Step n={4} title={words.step4Title} done={state.keyConfigured}>
          <p className="text-muted-foreground text-sm">{state.keyConfigured ? `${words.keyConfigured} · ····${state.keyTail}` : words.step4Text}</p>
          {!state.keyConfigured ? <p className="mt-2 text-muted-foreground text-xs italic">{words.soon}</p> : null}
        </Step>
      ) : (
        <Locked n={4} text={words.locked4} />
      )}

      {state.keyConfigured ? (
        <Step n={5} title={words.step5Title} done={!!state.hostname}>
          <p className="text-muted-foreground text-sm">{state.hostname ?? words.step5Text}</p>
          {!state.hostname ? <p className="mt-2 text-muted-foreground text-xs italic">{words.soon}</p> : null}
        </Step>
      ) : (
        <Locked n={5} text={words.locked5} />
      )}

      <dl className="mt-1 grid gap-1 text-muted-foreground text-xs">
        {state.nodeUrl ? (
          <div className="flex gap-2"><dt>{words.nodeAddress}:</dt><dd className="font-mono">{state.nodeUrl}</dd></div>
        ) : null}
        {state.quickTunnel ? (
          <div className="flex gap-2">
            <dt>{words.quickAddress}:</dt>
            <dd><a className="inline-flex items-center gap-1 underline" href={state.quickTunnel} rel="noreferrer noopener" target="_blank">{state.quickTunnel}<ExternalLink className="size-3" aria-hidden /></a></dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}
