"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «ГЛАВНОЕ ЗЕРКАЛО» — СВОЙ ДОМЕН В КОРНЕ ЭЛЕМЕНТА (324-1). Поле домена и «Проверить» (по кнопке: проверка ходит в Cloudflare,
// на каждую букву её не зовём). Ответ — словами и следующим шагом: зона готова / ждёт серверов имён у регистратора (список
// серверов) / ключ узла её не видит (две причины и ссылки на документацию Cloudflare). Подключение — 324-2.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const DOCS_ADD_SITE = "https://developers.cloudflare.com/fundamentals/manage-domains/add-site/"
const DOCS_TOKEN = "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/"

type Result = { state: string; name?: string; zone?: string; status?: string; nameServers?: string[]; by?: string; reason?: string }

export function ElementDomain({ id, ui, current }: { id: string; ui: ElementSettingsUi; current: string | null }) {
  const w = ui.mirrorCard
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  async function check() {
    setBusy(true)
    setResult(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/domain?name=${encodeURIComponent(name)}`, { cache: "no-store" })
      setResult(((await r.json().catch(() => null)) as Result | null) ?? { state: "failed" })
    } catch {
      setResult({ state: "failed" })
    }
    setBusy(false)
  }

  const line = result ? (w.states[result.state] ?? w.states.failed).replace("{zone}", result.zone ?? result.name ?? "").replace("{status}", result.status ?? "").replace("{by}", result.by ?? "").replace("{reason}", result.reason ?? "") : null
  const bad = result && result.state !== "ready"

  return (
    <div className="flex flex-col gap-2" data-element-domain={current ?? ""}>
      {current && <p className="text-sm text-foreground">{w.current} <span className="font-mono">{current}</span></p>}
      <Label htmlFor={`element-domain-${id}`}>{w.label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={`element-domain-${id}`}
          className="max-w-72 font-mono"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mybrand.com"
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="button" variant="outline" size="sm" onClick={check} disabled={!name.trim() || busy} data-domain-check>
          {busy ? w.checking : w.check}
        </Button>
      </div>
      {line && (
        <div className="flex flex-col gap-1.5" data-domain-state={result?.state}>
          <p className={bad ? "text-sm text-destructive" : "text-sm text-foreground"}>{line}</p>
          {result?.state === "pending" && result.nameServers && result.nameServers.length > 0 && (
            <ul className="font-mono text-sm text-foreground">
              {result.nameServers.map((ns) => <li key={ns}>{ns}</li>)}
            </ul>
          )}
          {result?.state === "not-visible" && (
            <p className="text-[length:var(--fs-small)] text-muted-foreground">
              <a className="underline" href={DOCS_ADD_SITE} target="_blank" rel="noopener noreferrer">{w.docsAddSite}</a>
              {" · "}
              <a className="underline" href={DOCS_TOKEN} target="_blank" rel="noopener noreferrer">{w.docsToken}</a>
            </p>
          )}
        </div>
      )}
      <p className="text-[length:var(--fs-small)] text-muted-foreground">{w.note}</p>
    </div>
  )
}
