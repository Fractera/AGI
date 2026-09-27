"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { TokenHowTo } from "./token-how-to.client"

// СТРОКА «КЛЮЧ УЗЛА» (324-1). Ключ Cloudflare — свойство узла, а не домена: один на весь аккаунт, меняется в одном месте.
// Состояние — замер узла (`/api/domain/list` → `key`): хвост, сколько зон видит, может ли создавать зоны (по последней попытке
// узла создать зону). Принимает ключ та же дверь, что у лестницы (`/api/domain/key`: проверить → записать; хозяин за машиной).
// Ключ не тот — строка становится тревожной карточкой, и в ней ТА ЖЕ инструкция, что в шаге 4 лестницы (`TokenHowTo`), открытая:
// слово владельца 2026-09-27 — документация и названия прав человеку не помогают, помогает пройденная по шагам инструкция.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DASH = "https://dash.cloudflare.com/"

export type NodeKey = { present: false } | { present: true; tail: string; zones: number | null; zoneCreate: "allowed" | "denied" | "unknown"; checkedAt: string | null }

export function DomainKey({ lang, state, words: w, ladderWords, onChanged }: {
  lang: string
  state: NodeKey | null
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}) {
  const k = w.key
  const [editing, setEditing] = useState(false)
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const time = (iso: string | null) => iso ? new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" }) : ""
  // Тревога: ключа нет или он не может создавать зоны — карточка открыта сразу, с инструкцией и полем.
  const alarm = !!state && (!state.present || state.zoneCreate === "denied")
  const showForm = editing || alarm

  async function save() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: token.trim() }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (j?.ok) { setToken(""); setEditing(false); await onChanged() }
      else setError(`${k.failed} ${j?.reason ?? r.status}`)
    } catch { setError(k.failed) }
    setBusy(false)
  }

  return (
    <div className={`flex flex-col gap-2 rounded-lg border p-3 ${alarm ? "border-destructive bg-destructive/5" : "border-border"}`} data-node-key={state?.present ? state.zoneCreate : "none"}>
      <p className="font-medium text-foreground">{k.title}</p>
      {state && !state.present && <p className="text-sm text-foreground">{k.none}</p>}
      {state?.present && (
        <>
          <p className="text-sm text-foreground">{k.has.replace("{tail}", state.tail).replace("{zones}", state.zones === null ? "?" : String(state.zones))}</p>
          <p className={state.zoneCreate === "denied" ? "text-sm text-destructive" : "text-sm text-foreground"}>
            {k[state.zoneCreate].replace("{time}", time(state.checkedAt))}
          </p>
        </>
      )}
      {showForm ? (
        <div className="flex flex-col gap-2">
          <TokenHowTo words={ladderWords} defaultOpen />
          <a className="w-fit text-sm underline" href={DASH} target="_blank" rel="noopener noreferrer">{k.dash}</a>
          <Label htmlFor="node-key-token">{k.label}</Label>
          <div className="flex flex-wrap gap-2">
            <Input id="node-key-token" type="password" className="max-w-80 font-mono" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} />
            <Button type="button" size="sm" onClick={save} disabled={!token.trim() || busy} data-node-key-save>{busy ? k.saving : k.save}</Button>
            {!alarm && <Button type="button" variant="ghost" size="sm" onClick={() => { setEditing(false); setError(null) }} disabled={busy}>{k.cancel}</Button>}
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setEditing(true)} data-node-key-replace>
          {state?.present ? k.replace : k.give}
        </Button>
      )}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
