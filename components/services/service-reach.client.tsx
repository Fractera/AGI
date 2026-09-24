"use client"

import { useCallback, useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Small } from "@/components/ui/typography"
import type { ServicePortWords } from "@/components/services/service-port.i18n"

// АДРЕС СЛУЖБЫ В ИНТЕРНЕТЕ — секция главной вкладки службы (шаг 289-3, готовое решение «Адрес службы»).
//
// Слово владельца 2026-09-24: «что стал бы делать пользователь если бы он с этим столкнулся? Где интуитивно он стал
// искать бы решение проблемы? … здесь нужна кнопка проверить подключение». Здесь: режим узла (Cloudflare или только
// эта машина), адрес ссылкой, его состояние и две кнопки — «Проверить подключение» и, если имени нет, «Подключить».
// Всё спрашивается у двери ядра `/api/node/reach` при заходе: адрес — факт машины, а страница предрендерена (264).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Reach = {
  ok?: boolean
  mode?: "local" | "cloudflare"
  port?: number | null
  hostname?: string
  url?: string
  dns?: boolean | null
  routed?: boolean | null
  answers?: number | null
  reason?: string
}

type State = { phase: "asking" } | { phase: "denied" } | { phase: "failed" } | { phase: "known"; reach: Reach }

export function ServiceReach({ serviceId, words }: { serviceId: string; words: ServicePortWords["reach"] }) {
  const [state, setState] = useState<State>({ phase: "asking" })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const load = useCallback(() => {
    setState({ phase: "asking" })
    fetch(`${BASE}/api/node/reach?service=${encodeURIComponent(serviceId)}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) return setState({ phase: "denied" })
        if (!r.ok) return setState({ phase: "failed" })
        setState({ phase: "known", reach: (await r.json()) as Reach })
      })
      .catch(() => setState({ phase: "failed" }))
  }, [serviceId])

  useEffect(() => { load() }, [load])

  const connect = async () => {
    setConnecting(true)
    setConnectError(null)
    try {
      const r = await fetch(`${BASE}/api/node/reach`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ service: serviceId }),
      })
      const body = (await r.json().catch(() => ({}))) as Reach
      if (!r.ok || !body.ok) setConnectError(words.connectFailed.replace("{reason}", body.reason ?? String(r.status)))
      else setState({ phase: "known", reach: body })
    } catch {
      setConnectError(words.connectFailed.replace("{reason}", "network"))
    } finally {
      setConnecting(false)
    }
  }

  // 289-6: карточка в стиле индикатора узла. Адрес отвечает — подсветка и закрашенная звезда; иначе — предупреждение
  // (незакрашенная звезда) и причина словами. Домен — крупно: это главное, что человек ищет на этой вкладке.
  const r = state.phase === "known" ? state.reach : null
  const cloud = r?.mode === "cloudflare"
  const missing = r && cloud ? [r.dns === false ? words.noDns : null, r.routed === false ? words.noRoute : null].filter(Boolean) : []
  const live = !!r && cloud && !r.reason && missing.length === 0 && typeof r.answers === "number" && r.answers > 0 && r.answers < 400
  const big = cloud ? r?.hostname : r?.port ? `localhost:${r.port}` : null

  let line: React.ReactNode
  if (state.phase === "asking") line = words.asking
  else if (state.phase === "denied") line = words.notAllowed
  else if (state.phase === "failed") line = words.cannotCheck.replace("{reason}", "—")
  else if (!cloud) line = words.local.replace("{url}", r?.port ? `http://localhost:${r.port}` : "—")
  else if (r?.reason) line = words.cannotCheck.replace("{reason}", r.reason)
  else if (missing.length > 0) line = `${words.notConnected} ${missing.join(", ")}.`
  else if (live) line = words.live
  else line = words.notAnswering.replace("{code}", String(r?.answers ?? "—"))

  return (
    <Card
      size="sm"
      data-service-reach={serviceId}
      data-phase={state.phase}
      data-active={String(live)}
      className={cn(live ? "bg-primary/10 ring-primary/40" : "bg-destructive/10 ring-destructive/40")}
    >
      <CardHeader>
        <CardTitle className="font-semibold">{words.title}</CardTitle>
        <CardAction>
          <StarIcon role="img" aria-hidden className={cn("size-5", live ? "fill-primary text-primary" : "text-destructive")} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {big ? (
          cloud && r?.url ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-mono text-2xl font-black tracking-tight break-all text-foreground underline-offset-4 hover:underline md:text-3xl" data-service-reach-url>
              {big}
            </a>
          ) : (
            <p className="font-mono text-2xl font-black tracking-tight break-all text-foreground md:text-3xl">{big}</p>
          )
        ) : null}
        {cloud ? <p className="text-muted-foreground text-sm">{words.cloudflare}</p> : null}
        <p className={cn("text-sm", live ? "text-foreground" : "text-destructive")} data-service-reach-line>{line}</p>
        {state.phase === "known" && cloud ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={load}>{words.check}</Button>
            {missing.length > 0 && !r?.reason ? (
              <Button size="sm" onClick={connect} disabled={connecting}>{connecting ? words.connecting : words.connect}</Button>
            ) : null}
          </div>
        ) : null}
        {connectError ? <Small className="text-destructive">{connectError}</Small> : null}
      </CardContent>
    </Card>
  )
}
