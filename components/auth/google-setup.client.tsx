"use client"

import { useEffect, useState } from "react"
import { Check, Copy, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { H3, Small } from "@/components/ui/typography"
import type { GoogleSetupWords } from "@/components/auth/google-setup.i18n"

// ЭКРАН ВКЛЮЧЕНИЯ ВХОДА ЧЕРЕЗ GOOGLE (265-2).
//
// Решение владельца 2026-09-21: «Вход через Google первый, экран пишет ключи сам».
//
// 🎯 УСТРОЙСТВО ВЗЯТО У ЛЕСТНИЦЫ ДОМЕНА, И ЭТО НЕ КОПИРОВАНИЕ РАДИ СХОДСТВА.
// Обе задачи одной природы: первые шаги человек делает В ЧУЖОЙ ПАНЕЛИ, и вернуться
// ему надо с добытым значением. Отсюда три закона лестницы, каждый оплачен:
//   1. ступени видны все, закрытая названа строкой, а не спрятана;
//   2. ответ виден всегда, и у успеха он называет следующий шаг;
//   3. отказ переводится в человеческие слова — голый код беды тот же тупик.
//
// 🛑 СЕКРЕТ ЖИВЁТ В ПОЛЕ РОВНО ДО ОТПРАВКИ. Поля очищаются в ЛЮБОМ исходе:
// значение, оставшееся на экране, видно каждому, кто подойдёт к компьютеру, и
// попадает в снимок экрана. Обратно с сервера секрет не приходит никогда — дверь
// отдаёт только «установлен / не установлен».

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DOOR = `${BASE}/api/auth/providers/google`

type State = {
  installed: boolean
  clientId: boolean
  clientSecret: boolean
  redirectUri: string | null
}

export function GoogleSetup({ words }: { words: GoogleSetupWords }) {
  const [state, setState] = useState<State | null>(null)
  const [id, setId] = useState("")
  const [secret, setSecret] = useState("")
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [answer, setAnswer] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    let alive = true
    fetch(DOOR, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: State) => alive && setState(d))
      // Дверь закрыта или не ответила — это «не знаю», а не «службы нет».
      .catch(() => alive && setState(null))
    return () => {
      alive = false
    }
  }, [])

  /** Перевод причины отказа в человеческие слова. Голый код беды — тот же тупик. */
  const reasonText = (reason: string, status: number): string => {
    if (reason === "both-required") return words.errBoth
    if (reason === "client-id-shape") return words.errShape
    if (reason === "whitespace-in-key") return words.errWhitespace
    if (reason === "temporary-address") return words.errTemporary
    if (reason === "auth-not-installed") return words.notInstalled
    if (status === 401 || status === 403) return words.errForbidden
    return words.errUnknown
  }

  async function send(method: "POST" | "DELETE") {
    if (busy) return
    setBusy(true)
    setAnswer(null)
    try {
      const res = await fetch(DOOR, {
        method,
        headers: method === "POST" ? { "content-type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify({ clientId: id.trim(), clientSecret: secret.trim() }) : undefined,
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        reason?: string
      } & Partial<State>
      // 🛑 ПОЛЯ ЧИСТЯТСЯ В ЛЮБОМ ИСХОДЕ — см. закон в шапке.
      setId("")
      setSecret("")
      if (data.ok) {
        setState({
          installed: data.installed ?? true,
          clientId: data.clientId ?? false,
          clientSecret: data.clientSecret ?? false,
          redirectUri: data.redirectUri ?? state?.redirectUri ?? null,
        })
        setAnswer({ ok: true, text: method === "POST" ? words.savedOn : words.savedOff })
      } else {
        setAnswer({ ok: false, text: reasonText(data.reason ?? "", res.status) })
      }
    } catch {
      setAnswer({ ok: false, text: words.errNetwork })
    } finally {
      setBusy(false)
    }
  }

  async function copyRedirect() {
    if (!state?.redirectUri) return
    try {
      await navigator.clipboard.writeText(state.redirectUri)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Копирование запрещено политикой страницы — строка всё равно видна и
      // выделяется руками. Молча ничего не происходит, и это законно.
    }
  }

  if (state === null) return <p className="text-muted-foreground text-sm">{words.loading}</p>

  if (!state.installed) {
    return (
      <p className="my-6 flex items-center gap-2 rounded-lg border border-border border-dashed px-4 py-3 text-muted-foreground text-sm">
        <TriangleAlert className="size-4 shrink-0" aria-hidden />
        {words.notInstalled}
      </p>
    )
  }

  const on = state.clientId && state.clientSecret

  return (
    <div className="my-6 flex flex-col gap-3" data-google-setup data-on={on ? "1" : "0"}>
      {/* ── Ступень 1: адрес возврата ─────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card p-4" data-step={1}>
        <H3 className="mb-2" variant="ui">{words.step1Title}</H3>
        <p className="text-muted-foreground text-sm">{words.step1Text}</p>
        {state.redirectUri ? (
          <div className="mt-3 flex flex-col gap-2">
            <Label htmlFor="google-redirect">{words.redirectLabel}</Label>
            <div className="flex gap-2">
              <Input id="google-redirect" readOnly value={state.redirectUri} className="font-mono text-xs" />
              <Button type="button" variant="outline" onClick={copyRedirect} aria-label={words.copy}>
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                <span className="ml-2">{copied ? words.copied : words.copy}</span>
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-muted-foreground text-sm">
            <TriangleAlert className="size-4 shrink-0" aria-hidden />
            {words.noRedirect}
          </p>
        )}
      </section>

      {/* ── Ступень 2: пара ключей ────────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card p-4" data-step={2}>
        <H3 className="mb-2" variant="ui">{words.step2Title}</H3>
        <p className="text-muted-foreground text-sm">{words.step2Text}</p>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="google-id">{words.idLabel}</Label>
            <Input
              id="google-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-xs"
            />
            <Small className="text-muted-foreground">{words.idHint}</Small>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="google-secret">{words.secretLabel}</Label>
            {/* 🔒 `type="password"`: секрет не читается через плечо и не попадает
                в снимок экрана, который человек пришлёт в поддержку. */}
            <Input
              id="google-secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-xs"
            />
            <Small className="text-muted-foreground">{words.secretHint}</Small>
          </div>
          <div>
            <Button type="button" onClick={() => send("POST")} disabled={busy || !id.trim() || !secret.trim()}>
              {busy ? words.sending : words.turnOn}
            </Button>
          </div>
          <Small className="text-muted-foreground">{words.caveat}</Small>
        </div>
      </section>

      {/* ── Ступень 3: состояние ──────────────────────────────────────────── */}
      <section className="rounded-lg border border-border bg-card p-4" data-step={3}>
        <H3 className="mb-2" variant="ui">{words.step3Title}</H3>
        <p className="text-foreground text-sm" data-google-state={on ? "on" : "off"}>
          {on ? words.onText : words.offText}
        </p>
        {on && (
          <div className="mt-3">
            <Button type="button" variant="outline" onClick={() => send("DELETE")} disabled={busy}>
              {busy ? words.sending : words.turnOff}
            </Button>
          </div>
        )}
      </section>

      {answer && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${answer.ok ? "border-border text-foreground" : "border-destructive/40 text-destructive"}`}
          data-answer={answer.ok ? "ok" : "fail"}
          role="status"
        >
          {answer.text}
        </p>
      )}
    </div>
  )
}
