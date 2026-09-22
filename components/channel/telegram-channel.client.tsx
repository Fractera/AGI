"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ExternalLink, Lock, Play, Square, TriangleAlert } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Small } from "@/components/ui/typography"
import { Spinner } from "@/components/ui/spinner"
import type { TelegramChannelWords } from "@/components/channel/telegram-channel.i18n"
import { CopyRow, Step, StepPoints } from "@/components/auth/setup-ladder.client"

// КАНАЛ TELEGRAM → CLAUDE CODE: ПЯТЬ СТУПЕНЕЙ (267-3).
//
// Перенос смысла `fractera-memory-starter/app/[lang]/build/_components/build-channel.client.tsx` на общие
// ступени узла (`setup-ladder.client.tsx`) — те же, что у экранов Google и Resend: собранные врозь,
// лестницы разошлись бы молча.
//
// 🔒 СОСТОЯНИЕ СПРАШИВАЕТСЯ У УЗЛА, А НЕ ПОМНИТСЯ: жив ли канал, знает pm2; доверяет ли `claude` папке,
// знает `~/.claude.json`. Страница — только окно в это.
// 🛑 ОДНО НАЖАТИЕ — ОДНО ДЕЙСТВИЕ (урок 267-2: «открывается много вкладок»): каждая кнопка блокируется
// на время своего запроса.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/channel/telegram`
const BOTFATHER = "https://t.me/BotFather"
const POLL_MS = 3000
const POLL_LIMIT = 100 // пять минут ожидания нажатия Start

type State = {
  configured: boolean
  tail: string | null
  botUsername: string | null
  allowed: number
  trusted: boolean
  running: boolean
  suggestion: { name: string; username: string }
}

function OutLink({ href, children, primary }: { href: string; children: string; primary?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: primary ? "default" : "outline" })}>
      {children}
      <ExternalLink className="ml-2 size-4" aria-hidden />
    </a>
  )
}

function Locked({ text }: { text: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-muted-foreground text-sm">
      <Lock className="size-4 shrink-0" aria-hidden />
      {text}
    </p>
  )
}

export function TelegramChannel({ lang, words }: { lang: string; words: TelegramChannelWords }) {
  const [state, setState] = useState<State | null | "forbidden">(null)
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [activated, setActivated] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(DOOR, { cache: "no-store" })
      if (res.status === 401 || res.status === 403) return setState("forbidden")
      setState((await res.json()) as State)
    } catch {
      setError(words.errors.network)
    }
  }, [words.errors.network])

  useEffect(() => {
    load()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [load])

  const post = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      setBusy(action)
      setError(null)
      try {
        const res = await fetch(DOOR, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action, ...extra }),
        })
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string } & Record<string, unknown>
        if (!data.ok) setError(words.errors[data.error ?? ""] ?? words.errors.network)
        return data
      } catch {
        setError(words.errors.network)
        return { ok: false }
      } finally {
        setBusy(null)
      }
    },
    [words.errors],
  )

  const saveToken = async () => {
    const r = await post("token", { token: token.trim() })
    // 🛑 Секрет живёт в поле ровно до отправки — в любом исходе.
    setToken("")
    if (r.ok) load()
  }

  const getLink = async () => {
    const r = await post("activation-link")
    if (!r.ok || typeof r.url !== "string") return
    setLink(r.url)
    setWaiting(true)
    let tries = 0
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      tries += 1
      try {
        const res = await fetch(DOOR, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "check-activation", greeting: words.greeting }),
        })
        const d = (await res.json()) as { ok?: boolean; activated?: boolean; error?: string }
        if (d.activated || !d.ok || tries >= POLL_LIMIT) {
          if (pollRef.current) clearInterval(pollRef.current)
          setWaiting(false)
          if (d.activated) {
            setActivated(true)
            setLink(null)
            load()
          } else if (!d.ok) setError(words.errors[d.error ?? ""] ?? words.errors.network)
        }
      } catch {
        /* следующий опрос */
      }
    }, POLL_MS)
  }

  const act = async (action: "start" | "stop") => {
    const r = await post(action)
    if ("running" in r) setState((prev) => (prev && prev !== "forbidden" ? { ...prev, ...(r as Partial<State>) } : prev))
    else load()
  }

  if (state === "forbidden") return <p className="my-6 text-muted-foreground text-sm">{words.forbidden}</p>
  if (state === null) return <p className="my-6 text-muted-foreground text-sm">{words.loading}</p>

  const hasBot = state.configured && !!state.botUsername
  const hasPeople = state.allowed > 0

  return (
    <div className="my-6 flex flex-col gap-3" data-telegram-channel data-running={state.running ? "1" : "0"}>
      <p className="text-muted-foreground text-sm">{words.intro}</p>

      <Step n={1} title={words.step1Title}>
        <p className="text-muted-foreground text-sm">{words.step1Text}</p>
        <StepPoints items={words.step1Points} />
        <CopyRow id="tg-name" label={words.nameLabel} value={state.suggestion.name} copy={words.copy} copied={words.copied} />
        <CopyRow id="tg-username" label={words.usernameLabel} value={state.suggestion.username} copy={words.copy} copied={words.copied} />
        <div className="mt-3">
          <OutLink href={BOTFATHER}>{words.openBotFather}</OutLink>
        </div>
      </Step>

      <Step n={2} title={words.step2Title}>
        <p className="text-muted-foreground text-sm">{words.step2Text}</p>
        {hasBot && (
          <p className="mt-2 text-foreground text-sm" data-tg-bot>
            {words.tokenSaved.replace("{username}", state.botUsername ?? "").replace("{tail}", state.tail ?? "")}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-1">
          <Label htmlFor="tg-token">{words.tokenLabel}</Label>
          <Input
            id="tg-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono text-xs"
          />
          <Small className="text-muted-foreground">{words.tokenHint}</Small>
        </div>
        <div className="mt-3">
          <Button type="button" onClick={saveToken} disabled={busy !== null || !token.trim()}>
            {busy === "token" && <Spinner className="size-4" />}
            {busy === "token" ? words.saving : words.saveToken}
          </Button>
        </div>
      </Step>

      <Step n={3} title={words.step3Title}>
        <p className="text-muted-foreground text-sm">{words.step3Text}</p>
        {!hasBot ? (
          <Locked text={words.locked} />
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {hasPeople && <p className="text-foreground text-sm">{words.allowedCount.replace("{n}", String(state.allowed))}</p>}
            {activated && <p className="text-foreground text-sm" role="status">{words.activated}</p>}
            {link ? (
              <div className="flex flex-wrap items-center gap-2">
                <OutLink href={link} primary>{words.openLink}</OutLink>
                {waiting && (
                  <span className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Spinner className="size-4" />
                    {words.waiting}
                  </span>
                )}
              </div>
            ) : (
              <div>
                <Button type="button" variant={hasPeople ? "outline" : "default"} onClick={getLink} disabled={busy !== null || state.running}>
                  {busy === "activation-link" && <Spinner className="size-4" />}
                  {words.getLink}
                </Button>
              </div>
            )}
          </div>
        )}
      </Step>

      <Step n={4} title={words.step4Title}>
        <p className="text-muted-foreground text-sm">{words.step4Text}</p>
        {!hasBot || !hasPeople ? (
          <Locked text={words.locked} />
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {!state.trusted && (
              <div className="flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm" data-tg-untrusted>
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <span>
                  {words.notTrusted}{" "}
                  <a className="underline underline-offset-2" href={`/${lang}/architect/auth/terminal`}>
                    {words.openTerminal}
                  </a>
                </span>
              </div>
            )}
            <p className="text-foreground text-sm" data-tg-state={state.running ? "running" : "stopped"}>
              {state.running ? words.running : words.sleeping}
            </p>
            <div>
              {state.running ? (
                <Button type="button" variant="destructive" onClick={() => act("stop")} disabled={busy !== null}>
                  {busy === "stop" ? <Spinner className="size-4" /> : <Square className="size-4" aria-hidden />}
                  {words.stop}
                </Button>
              ) : (
                <Button type="button" onClick={() => act("start")} disabled={busy !== null || !state.trusted}>
                  {busy === "start" ? <Spinner className="size-4" /> : <Play className="size-4" aria-hidden />}
                  {busy === "start" ? words.starting : words.start}
                </Button>
              )}
            </div>
          </div>
        )}
      </Step>

      <Step n={5} title={words.step5Title}>
        <p className="text-muted-foreground text-sm">{words.step5Text}</p>
        {state.running && state.botUsername ? (
          <div className="mt-3">
            <OutLink href={`https://t.me/${state.botUsername}`} primary>{words.openChat}</OutLink>
          </div>
        ) : (
          <Locked text={words.locked} />
        )}
        <StepPoints items={words.notes} />
      </Step>

      {error && (
        <p className="rounded-lg border border-destructive/40 px-4 py-3 text-destructive text-sm" role="status" data-tg-error>
          {error}
        </p>
      )}
    </div>
  )
}
