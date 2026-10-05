"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { addressHue } from "@/lib/a2a/address-hue"
import { answerOf, humanAnswerOf, humanQuestionOf, questionOf, titleOf } from "@/lib/a2a/call-text"

// ЛЕНТА «Dashboard → Общение агентов» (шаг 408). Только чтение: поля ввода нет. Каждый вызов A2A — два сообщения: вопрос
// вызывающего (слева) и ответ принимающего (справа); у сообщения адрес агента и полоса 6 px цветом из его адреса (`addressHue`). Вверху —
// переключатель на каждого агента, «все», «никого»: выбор меняет только показ.
// 🔒 Опрос раз в 3 с, только пока вкладка видна — слово владельца 2026-10-05 («Опрос раз в 3 с»). Страница предрендерена:
// записи спрашиваются у `/api/node/a2a-log` в браузере, новые — по `after=<последний id>`.
// 🔒 Прокручивается окно ленты, а не страница (`scrollTop` контейнера): `scrollIntoView` в окне двигал и страницу ядра (318).

type Row = {
  id: number; at: string; from_element: string; to_element: string; method: string | null; skill: string | null
  task_id: string | null; state: string | null; http_status: number | null; reason: string | null; duration_ms: number | null
  request: string | null; response: string | null; truncated: number; context_id: string | null
}

/**
 * БЕСЕДЫ (408-7; владелец: «беседа: … между gyr1i и roman, 05.10.26 18:07:05»): записи с одним `contextId` (A2A — номер
 * разговора) идут под одним заголовком; беседы — по последней записи, свежая внизу, как в чате. Без `contextId` — каждая запись
 * своей беседой.
 */
function conversations(rows: Row[]): { key: string; rows: Row[] }[] {
  const byKey = new Map<string, Row[]>()
  for (const r of rows) {
    const key = r.context_id ? `ctx:${r.context_id}` : `row:${r.id}`
    const list = byKey.get(key) ?? []
    list.push(r)
    byKey.set(key, list)
  }
  return [...byKey.entries()]
    .map(([key, list]) => ({ key, rows: list.sort((a, b) => a.id - b.id) }))
    .sort((a, b) => a.rows[a.rows.length - 1].id - b.rows[b.rows.length - 1].id)
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
  data: string
  conversation: string
  between: string
  and: string
  states: Record<string, string>
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const POLL_MS = 3000
const FIRST = 100

const stripeVars = (address: string) => {
  const h = addressHue(address)
  return { ["--stripe-l" as string]: `hsl(${h} 70% 42%)`, ["--stripe-d" as string]: `hsl(${h} 65% 62%)` } as React.CSSProperties
}

// Как в обычном чате: вопрос прижат влево, ответ — вправо; полоса всегда со стороны пустого места (владелец 2026-10-05:
// «если карточка прижимается вправо то бордюр слева»).
const SIDE = {
  ask: "self-start border-r-[6px] [border-right-color:var(--stripe-l)] [&:is(.dark_*)]:[border-right-color:var(--stripe-d)]",
  answer: "self-end border-l-[6px] [border-left-color:var(--stripe-l)] [&:is(.dark_*)]:[border-left-color:var(--stripe-d)]",
}

function Bubble({ address, side, children }: { address: string; side: keyof typeof SIDE; children: React.ReactNode }) {
  return (
    <div
      data-agent={address}
      data-side={side}
      style={stripeVars(address)}
      className={`w-fit min-w-[50%] max-w-[85%] rounded-md border border-border bg-card px-4 py-3 ${SIDE[side]}`}
    >
      {children}
    </div>
  )
}

/** Склеить записи без повторов, по возрастанию номера: номер записи журнала — её единственный ключ. */
function merge(a: Row[], b: Row[]): Row[] {
  const byId = new Map<number, Row>()
  for (const r of [...a, ...b]) byId.set(r.id, r)
  return [...byId.values()].sort((x, y) => x.id - y.id)
}

/** Фраза для человека крупно, данные — свёрнутыми под ней (408-6). */
function Said({ text, data, label }: { text: string; data: string; label: string }) {
  return (
    <>
      {text && <p className="mt-2 whitespace-pre-wrap break-words text-base text-foreground">{text}</p>}
      {data && data !== "{}" && (
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer select-none">{label}</summary>
          <pre className="mt-1 whitespace-pre-wrap break-words">{data}</pre>
        </details>
      )}
    </>
  )
}

export function A2aFeed({ words, lang }: { words: A2aFeedWords; lang: string }) {
  const [rows, setRows] = useState<Row[] | "loading" | "failed">("loading")
  const [agents, setAgents] = useState<Map<string, Agent>>(new Map())
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [more, setMore] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const last = useRef(0)
  // Опрос начинается только после первого ответа и не шлёт второй запрос, пока не вернулся первый. ✗ 2026-10-05: первый
  // запрос через туннель шёл дольше 3 с, тик спросил `after=0` — каждый вызов лёг в ленту дважды.
  const loaded = useRef(false)
  const busy = useRef(false)

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
        setRows((prev) => (Array.isArray(prev) ? merge(prev, asc) : asc))
        loaded.current = true
        toBottom()
      })
      .catch(() => { if (!stop) setRows("failed") })
    const tick = () => {
      if (stop || !loaded.current || busy.current || document.visibilityState !== "visible") return
      busy.current = true
      ask(`after=${last.current}&limit=200`)
        .then((d: { rows: Row[]; agents: Agent[] }) => {
          if (stop || !d.rows.length) return
          const asc = [...d.rows].reverse()
          last.current = asc[asc.length - 1].id
          learn(d.agents)
          const el = box.current
          const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 80
          setRows((prev) => (Array.isArray(prev) ? merge(prev, asc) : asc))
          if (atBottom) toBottom()
        })
        .catch(() => { /* следующий тик спросит снова */ })
        .finally(() => { busy.current = false })
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
        setRows((prev) => (Array.isArray(prev) ? merge(prev, [...d.rows].reverse()) : prev))
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
        {conversations(rows).map((c) => {
          const people = [...new Set(c.rows.flatMap((r) => [r.from_element, r.to_element]))].map((k) => who(k).name)
          const lng = lang === "ru" ? "ru" : "en"
          const title = c.rows.map((r) => titleOf(r.request)).find(Boolean) || humanQuestionOf(c.rows[0].request, lng).slice(0, 80)
          const shown = c.rows.some((r) => !hidden.has(r.from_element) || !hidden.has(r.to_element))
          if (!shown) return null
          return (
            <section key={c.key} className="flex flex-col gap-2" data-conversation={c.key}>
              <p className="border-b border-border pb-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{words.conversation}: {title}</span>
                {" · "}{words.between} {people.join(` ${words.and} `)} · {time(c.rows[0].at)}
              </p>
        {c.rows.map((r) => {
          const from = who(r.from_element)
          const to = who(r.to_element)
          const refused = r.http_status !== null && r.http_status >= 400
          const bad = refused || r.state === "ERROR" || r.state === "TASK_STATE_FAILED"
          const hq = humanQuestionOf(r.request, lng)
          const ha = humanAnswerOf(r.response, lng, r.reason)
          const q = questionOf(r.request)
          const a = answerOf(r.response)
          return (
            <div key={r.id} className="flex flex-col gap-2" data-call={r.id}>
              {/* 409-2: `TaskResult` — ответ агента по задаче; вопрос уже показан при её постановке */}
              {r.method !== "TaskResult" && !hidden.has(from.key) && (
                <Bubble address={from.address} side="ask">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{from.name}</span> · {time(r.at)} · {words.asks} {to.name}
                    {r.skill ? <> · <code>{r.skill}</code></> : r.method ? <> · <code>{r.method}</code></> : null}
                  </p>
                  <Said text={hq} data={q} label={words.data} />
                </Bubble>
              )}
              {!hidden.has(to.key) && (
                <Bubble address={to.address} side="answer">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{to.name}</span> · {words.answers} ·{" "}
                    <span className={bad ? "text-destructive" : undefined}>
                      {refused ? `${words.refused} ${r.http_status}${r.reason ? ` · ${r.reason}` : ""}` : words.states[r.state ?? ""] ?? r.state ?? "—"}
                    </span>
                    {r.duration_ms !== null ? ` · ${r.duration_ms} ms` : ""}
                    {r.truncated ? ` · ${words.truncated}` : ""}
                  </p>
                  <Said text={ha} data={a} label={words.data} />
                </Bubble>
              )}
            </div>
          )
        })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
