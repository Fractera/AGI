"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { TokenHowTo } from "./token-how-to.client"

// ТРЕВОГА «КЛЮЧ УЗЛА» (324-1). Решение владельца 2026-09-27 «go» после разбора: карточка показывается ТОЛЬКО когда проблема
// замерена сейчас — ключа нет, Cloudflare говорит, что он отключён или истёк, или статус не удалось узнать. Исправный ключ —
// ничего не рисуется: пользователю, прошедшему лестницу, эта строка не нужна.
// Внутри — кнопка «Создать ключ в Cloudflare» (ссылка-шаблон, `TokenHowTo`) и поле; принимает ключ дверь лестницы
// `/api/domain/key` (проверить → записать; хозяин за машиной).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type NodeKey =
  | { present: false }
  | { present: true; tail: string; status: string | null; workers?: { scripts: boolean; routes: boolean } | null }

// 344 (слово владельца 2026-09-30: путь к любой настройке Cloudflare — только через экран узла с настоящими ссылками, никаких
// шагов «из чата», иначе настоящий пользователь их никогда не узнает). Ключ исправен, но замер прав на Workers отказал —
// та же карточка, спокойнее (не красная): объясняет, зачем права, и ведёт той же кнопкой-шаблоном к новому ключу.

export function DomainKey({ state, words: w, ladderWords, onChanged }: {
  state: NodeKey | null
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}) {
  const k = w.key
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!state) return null
  const missing = state.present && state.status === "active" && state.workers
    ? [!state.workers.scripts && "Workers Scripts · Edit", !state.workers.routes && "Workers Routes · Edit"].filter(Boolean).join(", ")
    : ""
  if (state.present && state.status === "active" && !missing) return null
  const workersOnly = Boolean(missing)
  const reason = workersOnly
    ? k.noWorkers.replace("{missing}", missing)
    : !state.present ? k.none : state.status === "disabled" ? k.disabled : state.status === "expired" ? k.expired : k.unverified

  async function save() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: token.trim() }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (j?.ok) { setToken(""); await onChanged() }
      else setError(`${k.failed} ${j?.reason ?? r.status}`)
    } catch { setError(k.failed) }
    setBusy(false)
  }

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 ${workersOnly ? "border-warning bg-warning/10" : "border-destructive bg-destructive/5"}`}
      data-node-key-alarm={workersOnly ? "no-workers" : state.present ? state.status ?? "unverified" : "none"}
    >
      <p className={`font-medium ${workersOnly ? "text-foreground" : "text-destructive"}`}>{workersOnly ? k.workersTitle : k.title}</p>
      <p className="text-sm text-foreground">{reason.replace("{tail}", state.present ? state.tail : "")}</p>
      <TokenHowTo words={ladderWords} />
      <Label htmlFor="node-key-token">{k.label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input id="node-key-token" type="password" className="max-w-80 font-mono" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} />
        <Button type="button" size="sm" onClick={save} disabled={!token.trim() || busy} data-node-key-save>{busy ? k.saving : k.save}</Button>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
