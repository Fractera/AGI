"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { addressHue } from "@/lib/a2a/address-hue"

// ЛЕНТА «Dashboard → Общение агентов» (шаг 408). Только чтение: поля ввода нет. Каждый вызов A2A — два сообщения: вопрос
// вызывающего и ответ принимающего; у сообщения имя агента и полоса 6 px цветом из его адреса (`addressHue`). Вверху —
// переключатель на каждого агента, «все», «никого»: выбор меняет только показ.
// 🔒 Опрос раз в 3 с, только пока вкладка видна — слово владельца 2026-10-05 («Опрос раз в 3 с»). Страница предрендерена:
// записи спрашиваются у `/api/node/a2a-log` в браузере, новые — по `after=<последний id>`.
// 🔒 Прокручивается окно ленты, а не страница (`scrollTop` контейнера): `scrollIntoView` в окне двигал и страницу ядра (318).

type Row = {
  id: number; at: string; from_element: string; to_element: string; method: string | null; skill: string | null
  task_id: string | null; state: string | null; http_status: number | null; reason: string | null; duration_ms: number | null
  request: string | null; response: string | null; truncated: number
}
type Agent = { key: string; address: string; name: string }

export type A2aFeedWords = {
  loading: string
  unavailable: string
  empty: string
  all: string
  none: string
  earlier: string
  asks: string
  answers: string
  refused: string
  truncated: string
  states: Record<string, string>
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const POLL_MS = 3000
const FIRST = 100
const MAX_TEXT = 1500

type J = Record<string, unknown>
const obj = (v: unknown): J => (v && typeof v === "object" ? (v as J) : {})
const partsOf = (v: unknown): J[] => (Array.isArray(v) ? (v as J[]) : [])

function parse(text: string | null): unknown {
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

function show(v: unknown): string {
  const t = typeof v === "string" ? v : JSON.stringify(v, null, 2) ?? ""
  return t.length > MAX_TEXT ? `${t.slice(0, MAX_TEXT)}…` : t
}

/** Что спросили: вход навыка, текст сообщения или то, что пришло вместо JSON. */
function question(row: Row): string {
  const raw = parse(row.request)
  if (typeof raw === "string") return show(raw)
  const message = obj(obj(obj(raw).params).message)
  const parts = partsOf(message.parts)
  const call = parts.map((p) => obj(p.data)).find((d) => typeof d.skill === "string")
  if (call) return show(call.input ?? {})
  const text = parts.map((p) => p.text).filter((t): t is string => typeof t === "string").join("\n")
  if (text) return show(text)
  const params = obj(raw).params
  return params ? show(params) : ""
}

/** Что ответили: результат задачи, текст отказа задачи или ошибка протокола. */
function answer(row: Row): string {
  const body = obj(parse(row.response))
  const err = obj(body.error)
  if (typeof err.message === "string") return err.message
  const result = obj(body.result)
  const task = obj(result.task ?? result)
  const failText = partsOf(obj(obj(task.status).message).parts)
    .map((p) => p.text)
    .filter((t): t is string => typeof t === "string")
    .join("\n")
  if (failText) return show(failText)
  const parts = partsOf(task.artifacts).flatMap((a) => partsOf(a.parts))
  if (parts.length) return parts.map((p) => (p.text !== undefined ? show(String(p.text)) : show(p.data))).join("\n")
  return Object.keys(body).length ? show(body) : ""
}

const stripeVars = (address: string) => {
  const h = addressHue(address)
  return { ["--stripe-l" as string]: `hsl(${h} 70% 42%)`, ["--stripe-d" as string]: `hsl(${h} 65% 62%)` } as React.CSSProperties
}

function Bubble({ address, children }: { address: string; children: React.ReactNode }) {
  return (
    <div
      data-agent={address}
      style={stripeVars(address)}
      className="rounded-md border border-border border-l-[6px] [border-left-color:var(--stripe-l)] [&:is(.dark_*)]:[border-left-color:var(--stripe-d)] bg-card px-4 py-3"
    >
      {children}
    </div>
  )
}

export function A2aFeed({ words, lang }: { words: A2aFeedWords; lang: string }) {
  const [rows, setRows] = useState<Row[] | "loading" | "failed">("loading")
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [more, setMore] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const last = useRef(0)

  const learn = useCallback((list: Agent[]) => {
    setAgents((prev) => {
      const next = new Map(prev)
      for (const a of list) next.set(a.key, a)
      return next
    })
  }, [])

  const toBottom = () => {
    const el = box.current
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }

  // Первый запрос — последние 100; затем новые раз в 3 с, пока вкладка видна (и сразу при возврате на неё).
  useEffect(() => {
    let stop = false
    const ask = (q: string) =>
      fetch(`${BASE}/api/node/a2a-log?${q}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    ask(`limit=${FIRST}`)
      .then((d: { rows: Row[]; agents: Agent[]; total: number }) => {
        if (stop) return
        const asc = [...d.rows].reverse()
        last.current = asc.length ? asc[asc.length - 1].id : 0
        learn(d.agents)
        setMore(d.total > asc.length)
        setRows(asc)
        toBottom()
      })
      .catch(() => { if (!stop) setRows("failed") })
    const tick = () => {
      if (stop || document.visibilityState !== "visible") return
      ask(`after=${last.current}&limit=200`)
        .then((d: { rows: Row[]; agents: Agent[] }) => {
          if (stop || !d.rows.length) return
          const asc = [...d.rows].reverse()
          last.current = asc[asc.length - 1].id
          learn(d.agents)
          const el = box.current
          const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 80
          setRows((prev) => (Array.isArray(prev) ? [...prev, ...asc] : asc))
          if (atBottom) toBottom()
        })
        .catch(() => { /* следующий тик спросит снова */ })
    }
    const timer = setInterval(tick, POLL_MS)
    const onShow = () => { if (document.visibilityState === "visible") tick() }
    document.addEventListener("visibilitychange", onShow)
    return () => { stop = true; clearInterval(timer); document.removeEventListener("visibilitychange", onShow) }
  }, [learn])

  const earlier = () => {
    if (!Array.isArray(rows) || !rows.length) return
    fetch(`${BASE}/api/node/a2a-log?before=${rows[0].id}&limit=${FIRST}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { rows: Row[]; agents: Agent[] }) => {
        learn(d.agents)
        setMore(d.rows.length === FIRST)
        setRows((prev) => (Array.isArray(prev) ? [...[...d.rows].reverse(), ...prev] : prev))
      })
      .catch(() => {})
  }

  if (rows === "loading") {
    return (
      <p className="my-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> {words.loading}
      </p>
    )
  }
  if (rows === "failed") return <p className="my-6 text-sm text-destructive" role="alert">{words.unavailable}</p>

  const list = [...agents.values()].sort((a, b) => a.name.localeCompare(b.name))
  const who = (key: string): Agent => agents.get(key) ?? { key, address: key, name: key }
  const time = (at: string) => new Date(at).toLocaleString(lang)
  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="my-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3" role="group">
        <Button size="sm" variant="outline" onClick={() => setHidden(new Set())}>{words.all}</Button>
        <Button size="sm" variant="outline" onClick={() => setHidden(new Set(list.map((a) => a.key)))}>{words.none}</Button>
        {list.map((a) => (
          <label key={a.key} className="inline-flex items-center gap-2 text-sm" data-toggle={a.key}>
            <Checkbox checked={!hidden.has(a.key)} onCheckedChange={() => toggle(a.key)} />
            <span
              aria-hidden
              style={stripeVars(a.address)}
              className="inline-block h-4 w-1.5 rounded-sm [background-color:var(--stripe-l)] [&:is(.dark_*)]:[background-color:var(--stripe-d)]"
            />
            {a.name}
          </label>
        ))}
      </div>

      <div ref={box} className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto rounded-lg border border-border p-3" data-feed="a2a">
        {more && <Button size="sm" variant="ghost" className="self-center" onClick={earlier}>{words.earlier}</Button>}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">{words.empty}</p>}
        {rows.map((r) => {
          const from = who(r.from_element)
          const to = who(r.to_element)
          const refused = r.http_status !== null && r.http_status >= 400
          const bad = refused || r.state === "ERROR" || r.state === "TASK_STATE_FAILED"
          const q = question(r)
          const a = answer(r)
          return (
            <div key={r.id} className="flex flex-col gap-2" data-call={r.id}>
              {!hidden.has(from.key) && (
                <Bubble address={from.address}>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{from.name}</span> · {time(r.at)} · {words.asks} {to.name}
                    {r.skill ? <> · <code>{r.skill}</code></> : r.method ? <> · <code>{r.method}</code></> : null}
                  </p>
                  {q && <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{q}</pre>}
                </Bubble>
              )}
              {!hidden.has(to.key) && (
                <Bubble address={to.address}>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{to.name}</span> · {words.answers} ·{" "}
                    <span className={bad ? "text-destructive" : undefined}>
                      {refused ? `${words.refused} ${r.http_status}${r.reason ? ` · ${r.reason}` : ""}` : words.states[r.state ?? ""] ?? r.state ?? "—"}
                    </span>
                    {r.duration_ms !== null ? ` · ${r.duration_ms} ms` : ""}
                    {r.truncated ? ` · ${words.truncated}` : ""}
                  </p>
                  {a && <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">{a}</pre>}
                </Bubble>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
