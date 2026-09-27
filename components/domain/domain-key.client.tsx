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

export type NodeKey = { present: false } | { present: true; tail: string; status: string | null }

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

  if (!state || (state.present && state.status === "active")) return null
  const reason = !state.present ? k.none : state.status === "disabled" ? k.disabled : state.status === "expired" ? k.expired : k.unverified

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
    <div className="flex flex-col gap-2 rounded-lg border border-destructive bg-destructive/5 p-3" data-node-key-alarm={state.present ? state.status ?? "unverified" : "none"}>
      <p className="font-medium text-destructive">{k.title}</p>
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
