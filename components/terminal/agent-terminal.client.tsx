"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, ChevronDown, Eraser, Moon, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AgentTerminalWords } from "@/components/terminal/agent-terminal.i18n"
import { createMouseFilter, MOUSE_OFF } from "@/components/terminal/mouse-filter.mjs"
import { type XtermHandle, XtermTerminal } from "@/components/terminal/xterm-terminal.client"

// ТЕРМИНАЛ АГЕНТА УЗЛА: СПИТ ДО ЗАПУСКА, ЖИВЁТ ПРИ УХОДЕ, ОСТАНАВЛИВАЕТСЯ КНОПКОЙ (267-1).
//
// Перенос `fractera-memory-starter/app/[lang]/build/_components/build-terminal.client.tsx`.
// 🔒 СОН ПРОВЕРЯЕТСЯ ДВЕРЬЮ СОСТОЯНИЯ ДО ЛЮБОГО СОКЕТА: спит — серая карточка и ничего не открыто.
// 🔒 ЖИВУЧЕСТЬ — СВОЙСТВО СЕРВЕРА, А НЕ ОСТРОВКА: уход закрывает сокет, сессия остаётся и при возврате
// отдаёт накопленный экран.
// 🔒 ПАПКА АГЕНТА ПРИХОДИТ ИЗ ДВЕРИ, А НЕ ИЗ РАЗМЕТКИ: страница предрендерена, путь — факт о машине.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const TICKET = `${BASE}/api/terminal/ticket`
const SESSION = `${BASE}/api/terminal/session`

type State = "checking" | "sleeping" | "connecting" | "running" | "stopped" | "offline" | "forbidden"

export function AgentTerminal({ service, words }: { service: string; words: AgentTerminalWords }) {
  const sessionUrl = `${SESSION}?service=${encodeURIComponent(service)}`
  const [state, setState] = useState<State>("checking")
  const [note, setNote] = useState("")
  const [folder, setFolder] = useState<string | null | undefined>(undefined)
  const termRef = useRef<XtermHandle>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const sizeRef = useRef({ cols: 120, rows: 32 })
  const mouseRef = useRef(createMouseFilter())
  // Закрытие, которое сделали мы сами, не должно читаться как обрыв связи.
  const quietCloseRef = useRef(false)

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }, [])

  const connect = useCallback(
    async (wantStart: boolean) => {
      setState("connecting")
      setNote("")
      let ticket = ""
      try {
        const res = await fetch(TICKET, { method: "POST" })
        if (res.status === 401 || res.status === 403) {
          setState("forbidden")
          return
        }
        ticket = ((await res.json()) as { ticket?: string }).ticket ?? ""
      } catch {
        setState("offline")
        return
      }
      const scheme = window.location.protocol === "https:" ? "wss" : "ws"
      const ws = new WebSocket(`${scheme}://${window.location.host}${BASE}/pty`)
      wsRef.current = ws
      quietCloseRef.current = false

      ws.onopen = () => {
        // 🛑 `init` ПЕРВЫМ ДЕЙСТВИЕМ: любое исключение до него съело бы его целиком, и мост закрыл бы
        // молчащее соединение — человек увидел бы чёрный экран (оплачено у чата, 157-3).
        ws.send(JSON.stringify({ mode: "agent", service, start: wantStart, ticket, type: "init" }))
        ws.send(JSON.stringify({ type: "resize", ...sizeRef.current }))
        mouseRef.current = createMouseFilter()
        setState("running")
        termRef.current?.reset()
        termRef.current?.write(MOUSE_OFF)
        termRef.current?.focus()
      }
      ws.onmessage = (event) => {
        const chunk = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data)
        termRef.current?.write(mouseRef.current(chunk))
      }
      ws.onclose = (event) => {
        if (wsRef.current === ws) wsRef.current = null
        if (quietCloseRef.current) return
        if (event.reason === "not-running") {
          setState("sleeping")
        } else if (event.reason === "stopped") {
          setState("stopped")
          setNote(words.stopped)
        } else if (event.reason === "exited") {
          setState("stopped")
          setNote(words.exited)
        } else {
          setState("offline")
          setNote(event.reason === "no-agent-dir" ? words.noFolder : words.offline)
        }
      }
    },
    [service, words.exited, words.noFolder, words.offline, words.stopped],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(sessionUrl, { cache: "no-store" })
        if (cancelled) return
        if (res.status === 401 || res.status === 403) {
          setState("forbidden")
          return
        }
        const body = (await res.json()) as { running?: boolean; agentDir?: string | null }
        if (cancelled) return
        setFolder(body.agentDir ?? null)
        if (body.running) await connect(false)
        else setState("sleeping")
      } catch {
        if (!cancelled) setState("offline")
      }
    })()
    return () => {
      cancelled = true
      // Уход со страницы: закрываем только сокет — сессия на сервере продолжает работать.
      quietCloseRef.current = true
      wsRef.current?.close()
    }
  }, [connect, sessionUrl])

  const handleStop = useCallback(async () => {
    quietCloseRef.current = true
    try {
      await fetch(sessionUrl, {
        body: JSON.stringify({ action: "stop" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      })
    } catch {
      /* следующий заход на страницу скажет правду */
    }
    wsRef.current?.close()
    setState("stopped")
    setNote(words.stopped)
  }, [words.stopped])

  const handleClear = useCallback(() => {
    termRef.current?.reset()
    termRef.current?.focus()
  }, [])

  const handleData = useCallback((data: string) => send({ data, type: "stdin" }), [send])
  const handleResize = useCallback(
    (size: { cols: number; rows: number }) => {
      sizeRef.current = size
      send({ type: "resize", ...size })
    },
    [send],
  )

  if (state === "forbidden") {
    return <p className="my-6 text-muted-foreground text-sm">{words.forbidden}</p>
  }

  const live = state === "running" || state === "connecting"

  return (
    <div className="my-6 flex flex-col gap-3" data-agent-terminal data-state={state}>
      <p className="text-sm">
        {words.folderLabel}{" "}
        {folder ? (
          <code className="break-all rounded bg-muted px-2 py-0.5 font-mono text-xs" data-agent-folder={folder}>
            {folder}
          </code>
        ) : folder === null ? (
          <span className="text-muted-foreground">{words.noFolder}</span>
        ) : (
          <span className="text-muted-foreground">…</span>
        )}
      </p>

      <p className="text-muted-foreground text-xs" data-agent-first-run>{words.firstRun}</p>

      {/* 🛑 ПРЕДУПРЕЖДЕНИЕ — ДО ТЕРМИНАЛА И СВЁРНУТЫМ, как в мастерской памяти: заголовок виден всегда,
          текст по раскрытию. `<details>` браузера — без лишнего островка. */}
      <details className="group rounded-lg border border-destructive/50 bg-destructive/5" data-agent-warning>
        <summary className="flex cursor-pointer list-none items-center gap-2 p-3 font-medium text-sm [&::-webkit-details-marker]:hidden">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">{words.warnTitle}</span>
          <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="px-4 pb-4 text-sm">
          <p>{words.warnBody}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {words.warnPoints.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </details>

      {!live && (
        <div className="flex flex-col gap-3 rounded-lg border border-border border-dashed bg-muted/40 p-5 text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Moon className="size-4" aria-hidden />
            {state === "checking" ? "…" : words.sleepingTitle}
          </div>
          <p className="text-sm">{words.sleepingBody}</p>
          {note && <p className="text-sm">{note}</p>}
          <div>
            <Button disabled={state === "checking" || folder === null} onClick={() => connect(true)} type="button" data-agent-start>
              <Play className="size-4" aria-hidden />
              {words.start}
            </Button>
          </div>
        </div>
      )}

      {live && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              {state === "connecting" ? words.starting : words.running}
            </span>
            <span className="text-muted-foreground text-xs">{words.keepsRunning}</span>
            <div className="ml-auto flex gap-2">
              <Button onClick={handleClear} size="sm" type="button" variant="outline">
                <Eraser className="size-4" aria-hidden />
                {words.clear}
              </Button>
              <Button onClick={handleStop} size="sm" type="button" variant="destructive" data-agent-stop>
                <Square className="size-4" aria-hidden />
                {words.stop}
              </Button>
            </div>
          </div>
          <div className="h-[70dvh] min-h-[420px] overflow-hidden rounded-lg bg-[#0b0b0c] p-2">
            <XtermTerminal onData={handleData} onResize={handleResize} ref={termRef} />
          </div>
        </>
      )}
    </div>
  )
}
