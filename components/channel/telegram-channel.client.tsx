"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, ExternalLink, Lock, Play, Send, Square, TerminalSquare, TriangleAlert } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Small } from "@/components/ui/typography"
import { Spinner } from "@/components/ui/spinner"
import type { TelegramChannelWords } from "@/components/channel/telegram-channel.i18n"
import { CopyRow, Step, StepPoints } from "@/components/auth/setup-ladder.client"

// КАНАЛ TELEGRAM → CLAUDE CODE: ЧЕТЫРЕ СТУПЕНИ, КАК В ПАМЯТИ (267-3).
//
// 🔒 ПОРЯДОК И ПОВЕДЕНИЕ — ОДИН В ОДИН С `fractera-memory-starter/app/[lang]/build/_components/build-channel.client.tsx`
// (слово владельца 2026-09-22: «сделай ровно точно также»): BotFather → токен → активация одним нажатием →
// работа. ✗ Первая редакция разошлась с ним на ступени 3: ссылку надо было «получить» отдельной кнопкой,
// ожидание начиналось сразу, а запуск канала был ещё одной ступенью. Владелец: «здесь был процесс который
// вызывал Telegram прямо в браузере и перебрасывал меня туда… почему ты проигнорировал».
// 🔒 КАК В ПАМЯТИ: ссылка с меткой берётся у узла, как только ступень открылась; большая кнопка — это ссылка,
// она перебрасывает в Telegram; после нажатия START узел впускает человека, здоровается и запускает канал сам.
// 🔒 Ступени — общий модуль узла (`setup-ladder.client.tsx`), как у экранов Google и Resend.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/channel/telegram`
const BOTFATHER = "https://t.me/BotFather"
const POLL_MS = 3000

type State = {
  configured: boolean
  tail: string | null
  botUsername: string | null
  allowed: number
  trusted: boolean
  running: boolean
  suggestion: { name: string; username: string }
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
  const [activationUrl, setActivationUrl] = useState("")
  const [clicked, setClicked] = useState(false)
  const [justActivated, setJustActivated] = useState(false)
  const stopPoll = useRef(false)

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
        return { ok: false } as { ok: boolean } & Record<string, unknown>
      } finally {
        setBusy(null)
      }
    },
    [words.errors],
  )

  const configured = state !== null && state !== "forbidden" && state.configured && !!state.botUsername
  const activated = state !== null && state !== "forbidden" && state.allowed > 0

  // ── АКТИВАЦИЯ: ссылка берётся сама, как только ступень открылась (как в памяти) ──
  useEffect(() => {
    if (!configured || activated || activationUrl) return
    void (async () => {
      const r = await fetch(DOOR, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "activation-link" }),
      }).catch(() => null)
      const j = (await r?.json().catch(() => null)) as { ok?: boolean; url?: string } | null
      if (j?.ok && j.url) setActivationUrl(j.url)
    })()
  }, [configured, activated, activationUrl])

  // Пока человек не нажал START — каждые 3 с спрашиваем «нажал ли». Нажал — впускаем и запускаем канал.
  useEffect(() => {
    if (!activationUrl || activated) return
    stopPoll.current = false
    const t = setInterval(async () => {
      if (stopPoll.current) return
      try {
        const res = await fetch(DOOR, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "check-activation", greeting: words.greeting }),
        })
        const d = (await res.json()) as { ok?: boolean; activated?: boolean; error?: string }
        if (d.ok && d.activated) {
          stopPoll.current = true
          setJustActivated(true)
          // Канал запускается сам — как в памяти. Не доверяет папке — запуск откажет словами, и
          // ступень 4 покажет, что сделать.
          await fetch(DOOR, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "start" }),
          }).catch(() => null)
          load()
        } else if (!d.ok && d.error === "token-rejected") {
          // Токен отозвали после сохранения — ждать нечего, молчать нельзя (урок памяти).
          stopPoll.current = true
          setError(words.errors["token-rejected"])
        }
      } catch {
        /* следующая попытка через 3 с */
      }
    }, POLL_MS)
    return () => {
      stopPoll.current = true
      clearInterval(t)
    }
  }, [activationUrl, activated, words.greeting, words.errors, load])

  // Открывшаяся ступень прокручивается в поле зрения — иначе «ничего не происходит» (урок памяти).
  const stage = activated ? 4 : configured ? 3 : 0
  useEffect(() => {
    if (!stage) return
    document.querySelector(`[data-telegram-channel] [data-step="${stage}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [stage])

  const saveToken = async () => {
    const r = await post("token", { token: token.trim() })
    // 🛑 Секрет живёт в поле ровно до отправки — в любом исходе.
    setToken("")
    if (r.ok) load()
  }

  const act = async (action: "start" | "stop") => {
    const r = await post(action)
    if ("running" in r) setState((prev) => (prev && prev !== "forbidden" ? { ...prev, ...(r as Partial<State>) } : prev))
    else load()
  }

  if (state === "forbidden") return <p className="my-6 text-muted-foreground text-sm">{words.forbidden}</p>
  if (state === null) return <p className="my-6 text-muted-foreground text-sm">{words.loading}</p>

  const terminalHref = `/${lang}/architect/auth/terminal`

  return (
    <div className="my-6 flex flex-col gap-3" data-telegram-channel data-running={state.running ? "1" : "0"}>
      <p className="text-muted-foreground text-sm">{words.intro}</p>

      <Step n={1} title={words.step1Title}>
        <p className="text-muted-foreground text-sm">
          {/* Команду человек набирает в Telegram дословно — поэтому она выделена фоном (слово владельца: «/newbot need select with bg»). */}
          {words.step1Text.split("{cmd}")[0]}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground text-xs">/newbot</code>
          {words.step1Text.split("{cmd}")[1]}
        </p>
        <StepPoints items={words.step1Points} />
        <CopyRow id="tg-name" label={words.nameLabel} value={state.suggestion.name} copy={words.copy} copied={words.copied} />
        <CopyRow id="tg-username" label={words.usernameLabel} value={state.suggestion.username} copy={words.copy} copied={words.copied} />
        <div className="mt-3">
          <a href={BOTFATHER} target="_blank" rel="noreferrer noopener" className={buttonVariants({ variant: "outline" })}>
            {words.openBotFather}
            <ExternalLink className="ml-2 size-4" aria-hidden />
          </a>
        </div>
      </Step>

      <Step n={2} title={words.step2Title}>
        <p className="text-muted-foreground text-sm">{words.step2Text}</p>
        {configured && (
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
        {!configured ? (
          <Locked text={words.locked} />
        ) : activated ? (
          <p className="mt-2 flex items-center gap-2 text-foreground text-sm" role="status">
            <Check className="size-4 shrink-0" aria-hidden />
            {justActivated ? words.activated : words.allowedCount.replace("{n}", String(state.allowed))}
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {activationUrl ? (
              // 🔒 БОЛЬШАЯ КНОПКА — ЭТО ССЫЛКА: она перебрасывает прямо в Telegram, как в памяти.
              <a
                href={activationUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setClicked(true)}
                className={`${buttonVariants({ size: "lg" })} w-full`}
                data-activate
              >
                <Send className="size-5" aria-hidden />
                {words.activateBtn}
              </a>
            ) : (
              <p className="flex items-center gap-2 text-muted-foreground text-sm">
                <Spinner className="size-4" />
                {words.loading}
              </p>
            )}
            <p className="flex items-center gap-2 text-muted-foreground text-sm" data-activate-wait>
              {clicked && <Spinner className="size-4" />}
              {clicked ? words.activateWaiting : words.activateHint}
            </p>
          </div>
        )}
      </Step>

      <Step n={4} title={words.step4Title}>
        {!activated ? (
          <Locked text={words.locked} />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">{words.step4Text}</p>

            {/* 🔒 БОТ — ИНСТРУМЕНТ CLAUDE CODE, А НЕ ОТДЕЛЬНАЯ СУЩНОСТЬ (слово владельца 2026-09-22), и путь к
                агенту — одной кнопкой. */}
            <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm" data-tg-tool-note>
              <p>{words.toolNote}</p>
              <div>
                <a href={terminalHref} className={buttonVariants({ size: "sm", variant: "outline" })}>
                  <TerminalSquare className="size-4" aria-hidden />
                  {words.openTerminal}
                </a>
              </div>
            </div>

            {!state.trusted && (
              <div className="flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm" data-tg-untrusted>
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <span>{words.notTrusted}</span>
              </div>
            )}

            <p className="flex items-center gap-2 text-sm" data-tg-state={state.running ? "running" : "stopped"}>
              {state.running ? <Check className="size-4 text-primary" aria-hidden /> : <TriangleAlert className="size-4 text-muted-foreground" aria-hidden />}
              {state.running ? words.running : words.sleeping}
            </p>

            <div className="flex flex-wrap gap-2">
              {state.botUsername && (
                <a href={`https://t.me/${state.botUsername}`} target="_blank" rel="noreferrer" className={buttonVariants({})} data-open-bot>
                  <Send className="size-4" aria-hidden />
                  {words.openChat} @{state.botUsername}
                </a>
              )}
              {state.running ? (
                <Button type="button" variant="outline" onClick={() => act("stop")} disabled={busy !== null}>
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

            <Small className="text-muted-foreground" data-allowed>
              {words.allowedCount.replace("{n}", String(state.allowed))}
            </Small>
            <StepPoints items={words.notes} />
          </div>
        )}
      </Step>

      {error && (
        <p className="rounded-lg border border-destructive/40 px-4 py-3 text-destructive text-sm" role="status" data-tg-error>
          {error}
        </p>
      )}
    </div>
  )
}
