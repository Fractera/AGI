"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import type { DomainLadderWords } from "./domain-ladder.i18n"
import { TokenHowTo } from "./token-how-to.client"

// КОНВЕЙЕР ДОПОЛНИТЕЛЬНОГО ДОМЕНА (324-1). Слово владельца 2026-09-27: «если … у нас есть доступ к API … просто иди и подключай
// этот домен через API если это невозможно то значит создавай нормальный конвейер с пошаговым подключением».
// Устройство лестницы 259: ступень открывается после предыдущей, на месте закрытой — серая строка «откроется после…»,
// у каждого действия виден ответ. 1 — узел создаёт зону сам (нет права у ключа — замена ключа в строке «Ключ узла» над
// списком, 324-1: ключ — свойство узла, а не домена); 2 — серверы имён: назначенные и замеренные у регистратора рядом; 3 — активна (совпали — узел сам просит
// Cloudflare перепроверить). Всё по кнопке.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export type PipelineDomain = {
  name: string; state: string; status?: string; nameServers?: string[]; registrarNs?: string[]; nsMatch?: boolean
  activationAsked?: boolean; checkedAt?: string
}

function Step({ title, done, children }: { title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border p-3" data-pipe-step={done ? "done" : "open"}>
      <p className="flex items-center gap-1.5 font-medium text-foreground">
        {done && <Check className="size-4" aria-hidden />}
        {title}
      </p>
      {children}
    </div>
  )
}

export function DomainPipeline({ lang, domain: d, words: w, ladderWords, onChanged }: {
  lang: string
  domain: PipelineDomain
  words: DomainListWords
  ladderWords: DomainLadderWords
  onChanged: () => Promise<void>
}) {
  const p = w.pipe
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [noPermission, setNoPermission] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [key, setKey] = useState("")
  // Ключ дверь принимает только с машины узла (259-2). Открыта страница по публичному адресу — поле не показывается, вместо
  // него ссылка на эту же страницу на localhost (порт спрашивается у узла, не помнится). ✗ оплачено 2026-09-27: владелец
  // вставил ключ на throughsongs.com и получил голое «not-owner».
  const [remote, setRemote] = useState<{ nodeUrl: string | null } | null>(null)
  useEffect(() => {
    if (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) return
    fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { nodeUrl?: string | null }) => setRemote({ nodeUrl: j.nodeUrl ?? null }))
      .catch(() => setRemote({ nodeUrl: null }))
  }, [])

  const time = (iso?: string) => iso ? new Date(iso).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB") : ""

  async function call(method: "POST" | "PUT", body: Record<string, string>, slot: string): Promise<PipelineDomain | null> {
    setBusy(slot)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; domain?: PipelineDomain } | null
      if (j?.ok && j.domain) { await onChanged(); setBusy(null); return j.domain }
      const code = j?.error ?? String(r.status)
      if (code === "no-zone-permission") { setNoPermission(true); await onChanged() }
      setError(w.errors[code] ?? `${w.errors.unknown} ${code}`)
    } catch { setError(w.errors.unknown) }
    setBusy(null)
    return null
  }

  function describe(x: PipelineDomain): string {
    if (x.state === "active") return p.step3Done
    if (x.state === "not-visible") return w.state["not-visible"]
    if (x.nsMatch) return x.activationAsked ? p.step3Asked : p.match
    return p.noMatch
  }

  async function check() {
    const x = await call("PUT", { name: d.name }, "check")
    if (x) setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", describe(x)))
  }

  async function createZone() {
    const x = await call("POST", { name: d.name, action: "create-zone" }, "zone")
    if (x) { setNoPermission(false); setNote(p.lastCheck.replace("{time}", time(x.checkedAt)).replace("{what}", p.step1Done)) }
  }

  // Отказ ключа выясняется в момент действия и чинится здесь же: ключ → дверь лестницы → узел повторяет «Создать зону».
  async function saveKeyAndCreate() {
    setBusy("key")
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/domain/key`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: key.trim() }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; reason?: string } | null
      if (j?.reason === "not-owner" || j?.reason === "temporary-address") { setRemote({ nodeUrl: null }); setBusy(null); return }
      if (!j?.ok) {
        const why = j?.reason === "not-owner" ? ladderWords.reasonNotOwner
          : j?.reason === "no-tunnel-permission" ? ladderWords.reasonNoTunnel
          : j?.reason === "temporary-address" ? ladderWords.reasonTemporary
          : `${w.key.failed} ${j?.reason ?? r.status}`
        setError(why); setBusy(null); return
      }
      setKey("")
    } catch { setError(w.key.failed); setBusy(null); return }
    setBusy(null)
    await createZone()
  }

  const zoneReady = d.state === "pending" || d.state === "active"
  const nsReady = zoneReady && (d.state === "active" || !!d.nsMatch)

  return (
    <div className="flex flex-col gap-2" data-domain-pipeline={d.name}>
      <Step title={p.step1} done={zoneReady}>
        {zoneReady ? <p className="text-sm text-muted-foreground">{p.step1Done}</p> : (
          <>
            <p className="text-sm text-foreground">{p.step1Todo}</p>
            <Button type="button" size="sm" className="w-fit" onClick={createZone} disabled={busy !== null} data-pipe-create-zone>
              {busy === "zone" ? p.creating : p.createZone}
            </Button>
            {noPermission && (
              <div className="flex flex-col gap-2 rounded-md border border-destructive bg-destructive/5 p-3" data-pipe-no-permission>
                <p className="text-sm text-foreground">{p.noPermission}</p>
                <TokenHowTo words={ladderWords} />
                {remote ? (
                  <div className="flex flex-col gap-1" data-pipe-key-remote>
                    <p className="text-sm text-foreground">{p.keyRemote}</p>
                    {remote.nodeUrl && (
                      <a className="w-fit font-mono text-sm underline" href={`${remote.nodeUrl}${window.location.pathname}`}>
                        {`${remote.nodeUrl}${window.location.pathname}`}
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <Label htmlFor={`pipe-key-${d.name}`}>{w.key.label}</Label>
                    <div className="flex flex-wrap gap-2">
                      <Input id={`pipe-key-${d.name}`} type="password" className="max-w-80 font-mono" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" spellCheck={false} />
                      <Button type="button" size="sm" onClick={saveKeyAndCreate} disabled={!key.trim() || busy !== null} data-pipe-key-save>
                        {busy === "key" ? w.key.saving : p.keySaveAndCreate}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </Step>

      <Step title={p.step2} done={nsReady}>
        {!zoneReady ? <p className="text-sm text-muted-foreground">{p.step2Wait}</p> : (
          <>
            {d.state !== "active" && <p className="text-sm text-foreground">{p.step2Text}</p>}
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.assigned}</p>
                <ul className="font-mono text-sm text-foreground select-all">{(d.nameServers ?? []).map((n) => <li key={n}>{n}</li>)}</ul>
              </div>
              <div>
                <p className="text-[length:var(--fs-small)] text-muted-foreground">{p.atRegistrar}</p>
                {d.registrarNs && d.registrarNs.length > 0
                  ? <ul className="font-mono text-sm text-foreground">{d.registrarNs.map((n) => <li key={n}>{n}</li>)}</ul>
                  : <p className="text-sm text-muted-foreground">{p.nothingYet}</p>}
              </div>
            </div>
            <p className="text-sm text-foreground" data-pipe-ns-match={d.nsMatch ? "yes" : "no"}>{d.state === "active" || d.nsMatch ? p.match : p.noMatch}</p>
          </>
        )}
      </Step>

      <Step title={p.step3} done={d.state === "active"}>
        {!nsReady ? <p className="text-sm text-muted-foreground">{p.step3Wait}</p>
          : <p className="text-sm text-foreground">{d.state === "active" ? p.step3Done : p.step3Asked}</p>}
      </Step>

      {/* Кнопка на всю ширину (слово владельца: «сделай её больше шире … всю ширину»); до ступени 1 проверять нечего —
          зоны нет, и ключ, который её создаст, ещё не сохранён. */}
      <Button type="button" size="lg" className="w-full" onClick={check} disabled={!zoneReady || busy !== null} data-pipe-check>
        {busy === "check" ? p.checking : p.check}
      </Button>
      {!zoneReady && <p className="text-sm text-muted-foreground" data-pipe-check-locked>{p.checkLocked}</p>}
      {note && <p className="text-sm text-foreground" role="status" data-pipe-note>{note}</p>}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
