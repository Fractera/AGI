"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { CircleHelp, GitBranch, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ElementGithubUi } from "../_i18n/element-github.i18n"

// GITHUB РОЖДЁННОГО ЭЛЕМЕНТА (319-5): связь (репозиторий + ключ → проверка у GitHub), «Отправить в GitHub» КНОПКОЙ и
// последняя выгрузка. Незакоммиченные правки — отказ с их числом и вторая кнопка «Закоммитить и отправить»; у каждого пути
// пояснение за «?» (слово владельца «а and b need both with description in (?)»). Ключ уходит в дверь один раз и в
// островке не хранится; поле очищается после сохранения.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type State = {
  repo: string | null
  login: string | null
  expires: string | null
  tokenTail: string | null
  lastPushedAt: string | null
  lastCommit: string | null
  dirty: number
  commit: string | null
}

function Help({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={text}>
          <CircleHelp className="size-4" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  )
}

export function ElementGithub({ id, lang, ui }: { id: string; lang: string; ui: ElementGithubUi }) {
  const [s, setS] = useState<State | null>(null)
  const [repo, setRepo] = useState("")
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState<"connect" | "push" | null>(null)
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null)
  const [dirtyBlock, setDirtyBlock] = useState<number | null>(null)
  const url = `${BASE}/api/architect/items/${id}/github`

  const load = useCallback(async () => {
    const r = await fetch(url, { cache: "no-store" })
    if (r.ok) {
      const next = (await r.json()) as State
      setS(next)
      if (next.repo) setRepo((v) => v || next.repo || "")
    }
  }, [url])

  useEffect(() => { load() }, [load])

  const err = (code: unknown) => ui.errors[String(code)] ?? ui.errors["push-failed"]
  // Слово владельца 2026-09-27: «попытайся какие-то читаемые ошибки показать». Ответ не JSON или запрос оборвался — тоже
  // слова и код, а не тишина: раньше такой сбой не показывался вовсе.
  async function call(input: string, init: RequestInit): Promise<{ status: number; body: Record<string, unknown> | null }> {
    try {
      const r = await fetch(input, init)
      const body = (await r.json().catch(() => null)) as Record<string, unknown> | null
      return { status: r.status, body }
    } catch {
      return { status: 0, body: null }
    }
  }
  const network = (status: number) => ui.network.replace("{code}", status ? String(status) : "—")

  async function connect() {
    setBusy("connect")
    setMessage(null)
    try {
      const { status, body: d } = await call(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ repo, token }) })
      if (!d) setMessage({ tone: "error", text: network(status) })
      else if (d.ok) { setS(d as unknown as State); setToken(""); setMessage({ tone: "ok", text: ui.nextStep }) }
      else setMessage({ tone: "error", text: err(d.error) })
    } finally { setBusy(null) }
  }

  async function forget() {
    const { status, body } = await call(url, { method: "DELETE" })
    if (body?.ok) setS(body as unknown as State)
    else setMessage({ tone: "error", text: body ? err(body.error) : network(status) })
  }

  async function push(commit: boolean) {
    setBusy("push")
    setMessage(null)
    setDirtyBlock(null)
    try {
      const { status, body: d } = await call(`${url}/push`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ commit }) })
      if (!d) { setMessage({ tone: "error", text: network(status) }); return }
      if ("repo" in d) setS(d as unknown as State)
      if (d.ok) setMessage({ tone: "ok", text: ui.pushed.replace("{commit}", String(d.commit ?? "")) })
      else if (d.error === "dirty") setDirtyBlock(Number(d.dirty ?? 0))
      else setMessage({ tone: "error", text: err(d.error) })
    } finally { setBusy(null) }
  }

  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(lang) : null)
  const row = (label: string, value: ReactNode) => (
    <div className="flex flex-wrap gap-x-2 text-sm"><span className="text-muted-foreground">{label}:</span><span className="font-mono">{value}</span></div>
  )

  return (
    <TooltipProvider>
      <div className="my-4 flex flex-col gap-6" data-element-github={id}>
        {/* Слово владельца 2026-09-27: «две три строчки описание и ссылка … стандартом наших моделей управления всегда было
            наличие ссылки по которым может пользователь перейти чтобы сделать это действие». Адрес ключа — из документации
            GitHub («Managing your personal access tokens»): github.com/settings/personal-access-tokens/new. */}
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-foreground" data-element-github-steps>
          <li>
            {ui.step1}{" "}
            <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">{ui.step1Link}</a>
          </li>
          <li>
            {ui.step2}{" "}
            <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">{ui.step2Link}</a>
            <ol className="mt-1 flex list-[lower-alpha] flex-col gap-1 pl-5 text-muted-foreground" data-element-github-step2>
              {ui.step2Sub.map((line, i) => <li key={i}>{line}</li>)}
            </ol>
          </li>
          <li>{ui.step3}</li>
          <li>{ui.step4}</li>
        </ol>
        <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); connect() }} data-element-github-connect>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`gh-repo-${id}`}>{ui.repoLabel}</Label>
            <Input id={`gh-repo-${id}`} value={repo} onChange={(e) => setRepo(e.target.value)} placeholder={ui.repoPlaceholder} autoComplete="off" spellCheck={false} className="font-mono" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor={`gh-token-${id}`}>{ui.tokenLabel}</Label>
              <Help text={ui.tokenHelp} />
            </div>
            <Input id={`gh-token-${id}`} type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder={ui.tokenPlaceholder} autoComplete="off" spellCheck={false} className="font-mono" />
          </div>
          <Button type="submit" className="w-fit gap-1.5" disabled={!repo.trim() || !token.trim() || busy !== null}>
            <GitBranch className="size-4" aria-hidden />
            {busy === "connect" ? ui.connecting : ui.connect}
          </Button>
        </form>

        {s?.repo && s.tokenTail && (
          <div className="flex flex-col gap-1 rounded-lg border border-border p-3" data-element-github-state>
            {row(ui.repoLabel, s.repo)}
            {s.login && row(ui.account, s.login)}
            {row(ui.keyTail, `…${s.tokenTail}`)}
            {row(ui.expires, s.expires ?? ui.noExpiry)}
            {row(ui.lastPush, s.lastPushedAt ? `${when(s.lastPushedAt)} · ${s.lastCommit}` : ui.neverPushed)}
            <Button type="button" variant="ghost" size="sm" className="mt-1 w-fit" onClick={forget}>{ui.forget}</Button>
          </div>
        )}
        {s?.repo && s.tokenTail && !s.lastPushedAt && (
          <p className="text-sm font-medium text-foreground" data-element-github-next>{ui.nextStep}</p>
        )}

        {s?.repo && s.tokenTail && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <Button type="button" className="w-fit gap-1.5" onClick={() => push(false)} disabled={busy !== null} data-element-github-push>
                <Upload className="size-4" aria-hidden />
                {busy === "push" ? ui.pushing : ui.push}
              </Button>
              <Help text={ui.pushHelp} />
            </div>
            {dirtyBlock !== null && (
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3" role="status" data-element-github-dirty={dirtyBlock}>
                <div className="flex items-start gap-1">
                  <p className="text-sm text-foreground">{ui.dirty.replace("{n}", String(dirtyBlock))}</p>
                  <Help text={ui.dirtyHelp} />
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => push(true)} disabled={busy !== null} data-element-github-commit-push>
                    {ui.commitPush}
                  </Button>
                  <Help text={ui.commitPushHelp} />
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <p className={`text-sm ${message.tone === "error" ? "text-destructive" : "text-foreground"}`} role="status" data-element-github-message={message.tone}>
            {message.text}
          </p>
        )}
      </div>
    </TooltipProvider>
  )
}
