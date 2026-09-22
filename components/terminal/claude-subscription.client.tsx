"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, CircleAlert, Copy, ExternalLink, KeyRound, RotateCw, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ClaudeSubscriptionWords } from "@/components/terminal/claude-subscription.i18n"
import { createMouseFilter, MOUSE_OFF } from "@/components/terminal/mouse-filter.mjs"
import { extractAuthUrl } from "@/components/terminal/terminal-auth.mjs"
import { type XtermHandle, XtermTerminal } from "@/components/terminal/xterm-terminal.client"

// ПОДПИСКА CLAUDE CODE: СОСТОЯНИЕ ВХОДА И САМ ВХОД (267-2).
//
// Перенос `fractera-memory-starter/app/[lang]/terminal/_components/terminal-panel.client.tsx` и
// `auth-flow-modal.client.tsx`, с одним отличием по устройству: в памяти страница СРАЗУ открывала терминал
// в режиме проверки. Здесь состояние сперва спрашивается дверью `/api/terminal/claude-auth` — без оболочки,
// без процесса, — а терминал входа рождается только кнопкой. Слово владельца о мастерской памяти: «до того
// как она будет запущена она не должна расходовать ресурсы компьютера».
//
// 🔒 ССЫЛКУ ИЩЕМ В СЫРОМ ПОТОКЕ (`terminal-auth.mjs`): Claude Code печатает её гиперссылкой OSC-8 или
// текстом, разорванным переносами, — поэтому разбор ждёт паузу в потоке, а не первый кусок.
// 🔒 ПОСЛЕ КОДА СОСТОЯНИЕ СПРАШИВАЕТСЯ ЗАНОВО, А НЕ ОБЪЯВЛЯЕТСЯ: «код отправлен» не значит «вошли».

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const STATE = `${BASE}/api/terminal/claude-auth`
const TICKET = `${BASE}/api/terminal/ticket`

const BUFFER_LIMIT = 8000
const DETECT_DELAY_MS = 300

type Auth = { loggedIn: boolean | null; email: string | null; plan: string | null }

export function ClaudeSubscription({ words }: { words: ClaudeSubscriptionWords }) {
  const [auth, setAuth] = useState<Auth | "checking" | "forbidden">("checking")
  const [open, setOpen] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const termRef = useRef<XtermHandle>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const bufRef = useRef("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalRef = useRef(false)
  const sizeRef = useRef({ cols: 100, rows: 24 })
  const mouseRef = useRef(createMouseFilter())

  const check = useCallback(async () => {
    setAuth("checking")
    try {
      const res = await fetch(STATE, { cache: "no-store" })
      if (res.status === 401 || res.status === 403) return setAuth("forbidden")
      const d = (await res.json()) as Auth
      setAuth({ loggedIn: d.loggedIn ?? null, email: d.email ?? null, plan: d.plan ?? null })
    } catch {
      setAuth({ loggedIn: null, email: null, plan: null })
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  const send = useCallback((payload: unknown) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload))
  }, [])

  const scan = useCallback(() => {
    if (modalRef.current) return
    const found = extractAuthUrl(bufRef.current)
    if (found) {
      modalRef.current = true
      setAuthUrl(found.url)
    }
  }, [])

  const closeTerminal = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setOpen(false)
    setAuthUrl(null)
    modalRef.current = false
    bufRef.current = ""
    check()
  }, [check])

  const startLogin = useCallback(async () => {
    let ticket = ""
    try {
      const res = await fetch(TICKET, { method: "POST" })
      if (res.status === 401 || res.status === 403) return setAuth("forbidden")
      ticket = ((await res.json()) as { ticket?: string }).ticket ?? ""
    } catch {
      return
    }
    setOpen(true)
    bufRef.current = ""
    modalRef.current = false
    const scheme = window.location.protocol === "https:" ? "wss" : "ws"
    const ws = new WebSocket(`${scheme}://${window.location.host}${BASE}/pty`)
    wsRef.current = ws
    ws.onopen = () => {
      // 🛑 `init` ПЕРВЫМ ДЕЙСТВИЕМ — см. островок терминала.
      ws.send(JSON.stringify({ mode: "login", ticket, type: "init" }))
      ws.send(JSON.stringify({ type: "resize", ...sizeRef.current }))
      mouseRef.current = createMouseFilter()
      termRef.current?.reset()
      termRef.current?.write(MOUSE_OFF)
      termRef.current?.focus()
    }
    ws.onmessage = (event) => {
      const chunk = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data)
      termRef.current?.write(mouseRef.current(chunk))
      bufRef.current = (bufRef.current + chunk).slice(-BUFFER_LIMIT)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(scan, DETECT_DELAY_MS)
    }
  }, [scan])

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    },
    [],
  )

  const handleData = useCallback((data: string) => send({ data, type: "stdin" }), [send])
  const handleResize = useCallback(
    (size: { cols: number; rows: number }) => {
      sizeRef.current = size
      send({ type: "resize", ...size })
    },
    [send],
  )

  if (auth === "forbidden") return <p className="my-6 text-muted-foreground text-sm">{words.forbidden}</p>

  const state = auth === "checking" ? null : auth
  const on = state?.loggedIn === true
  const unknown = state !== null && state.loggedIn === null

  return (
    <div className="my-6 flex flex-col gap-3" data-claude-subscription data-state={auth === "checking" ? "checking" : on ? "on" : unknown ? "unknown" : "off"}>
      <div className="rounded-lg border border-border bg-card p-4">
        {auth === "checking" ? (
          <p className="text-muted-foreground text-sm">{words.checking}</p>
        ) : (
          <>
            <p className="flex items-center gap-2 font-medium text-sm">
              {on ? <Check className="size-4 shrink-0" aria-hidden /> : <CircleAlert className="size-4 shrink-0" aria-hidden />}
              {on ? words.onTitle : unknown ? words.unknownTitle : words.offTitle}
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {on
                ? words.onText.replace("{email}", state?.email ?? "—").replace("{plan}", state?.plan ?? "—")
                : unknown
                  ? words.unknownText
                  : words.offText}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!open && (
                <Button type="button" onClick={startLogin} variant={on ? "outline" : "default"} data-claude-login>
                  <KeyRound className="size-4" aria-hidden />
                  {on ? words.relogin : words.login}
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={check}>
                <RotateCw className="size-4" aria-hidden />
                {words.recheck}
              </Button>
            </div>
          </>
        )}
      </div>

      <p className="text-muted-foreground text-xs">{words.quota}</p>

      {open && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <p className="flex-1 text-muted-foreground text-xs">{words.terminalNote}</p>
            <Button type="button" size="sm" variant="outline" onClick={closeTerminal}>
              <X className="size-4" aria-hidden />
              {words.close}
            </Button>
          </div>
          <div className="h-[45dvh] min-h-[320px] overflow-hidden rounded-lg bg-[#0b0b0c] p-2">
            <XtermTerminal onData={handleData} onResize={handleResize} ref={termRef} />
          </div>
        </div>
      )}

      {authUrl && (
        <AuthModal
          url={authUrl}
          words={words}
          onClose={() => {
            modalRef.current = false
            setAuthUrl(null)
            bufRef.current = ""
          }}
          onSend={(code) => {
            send({ data: `${code}\r`, type: "stdin" })
            // Вход проверяется у самого `claude`, когда он успел записать учётку.
            setTimeout(check, 4000)
          }}
        />
      )}
    </div>
  )
}

function AuthModal({
  url,
  words,
  onClose,
  onSend,
}: {
  url: string
  words: ClaudeSubscriptionWords
  onClose: () => void
  onSend: (code: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState("")
  const [sent, setSent] = useState(false)

  const submit = () => {
    const v = code.trim()
    if (!v) return
    onSend(v)
    setSent(true)
    setTimeout(onClose, 1200)
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <KeyRound className="size-4 shrink-0" aria-hidden />
            {words.modalTitle}
          </DialogTitle>
          <DialogDescription className="text-left">{words.modalText}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[110px] select-text overflow-y-auto break-all rounded-lg border border-border bg-muted/50 px-3 py-2 font-mono text-xs">
          {url}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {
                /* буфер закрыт политикой браузера — ссылка видна и выделяется */
              }
            }}
          >
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? words.copied : words.copyLink}
          </Button>
          {/* Ссылка, а не кнопка-обёртка: `Button` узла не умеет `asChild`. */}
          <a href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "sm", variant: "outline" })}>
            <ExternalLink className="size-4" aria-hidden />
            {words.openLink}
          </a>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Input
            autoComplete="off"
            disabled={sent}
            value={code}
            placeholder={words.codePlaceholder}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button type="button" className="w-full" disabled={sent || !code.trim()} onClick={submit}>
            {sent ? words.codeSent : words.sendCode}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
