"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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

  let body: React.ReactNode
  if (state.phase === "asking") body = <p className="text-sm text-muted-foreground">{words.asking}</p>
  else if (state.phase === "denied") body = <p className="text-sm text-muted-foreground">{words.notAllowed}</p>
  else if (state.phase === "failed") body = <p className="text-sm text-muted-foreground">{words.cannotCheck.replace("{reason}", "—")}</p>
  else {
    const r = state.reach
    if (r.mode !== "cloudflare") {
      const url = r.port ? `http://localhost:${r.port}` : "—"
      body = <p className="text-sm text-foreground">{words.local.replace("{url}", url)}</p>
    } else {
      const missing = [r.dns === false ? words.noDns : null, r.routed === false ? words.noRoute : null].filter(Boolean)
      const live = typeof r.answers === "number" && r.answers < 500 && r.answers !== 0 && missing.length === 0 && r.answers !== 404
      body = (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground">{words.cloudflare}</p>
          {r.url && (
            <p className="text-sm text-foreground">
              {words.address}{" "}
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4" data-service-reach-url>
                {r.url}
              </a>
            </p>
          )}
          {r.reason ? (
            <p className="text-sm text-muted-foreground">{words.cannotCheck.replace("{reason}", r.reason)}</p>
          ) : missing.length > 0 ? (
            <p className="text-sm text-destructive">{words.notConnected} {missing.join(", ")}.</p>
          ) : live ? (
            <p className="text-sm text-foreground" data-service-reach-live>{words.live}</p>
          ) : (
            <p className="text-sm text-destructive">{words.notAnswering.replace("{code}", String(r.answers ?? "—"))}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={load}>{words.check}</Button>
            {missing.length > 0 && !r.reason && (
              <Button size="sm" onClick={connect} disabled={connecting}>{connecting ? words.connecting : words.connect}</Button>
            )}
          </div>
          {connectError && <Small className="text-destructive">{connectError}</Small>}
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4" data-service-reach={serviceId} data-phase={state.phase}>
      <p className="text-sm font-semibold text-foreground">{words.title}</p>
      {body}
    </div>
  )
}
