"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Eye, Rocket, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import type { ElementDeployUi } from "../_i18n/element-deploy.i18n"

// «РАЗВЕРНУТЬ» И «ПРЕДПРОСМОТР» НА СТРАНИЦЕ «РАЗВЁРТЫВАНИЯ» ЭЛЕМЕНТА (узел, шаг 337-3/4). Слово владельца 2026-09-29:
// «кнопка развёртывания уже существует у нас в проекте и выглядит более целостно, потому что показывает и коммит и
// состояние — как будто бы не хватает только кнопки развернуть … и вторая кнопка привью».
//
// 🔒 СОСТОЯНИЕ — ФАКТЫ ДВЕРЕЙ, А НЕ ПАМЯТЬ СТРАНИЦЫ: код элемента и ход развёртывания — `/api/node/deploy` (та же дверь, что у
// «Развёртываний» ядра), предпросмотр — `/api/architect/items/<id>/preview`. Спрашиваются при открытии и раз в 3 с, пока
// идёт работа, которую человек сам запустил; в покое — ни одного запроса.

type Code = { head: string | null; running: string | null; changed: number; changes: string[]; pending: boolean }
type Element = { id: string; pending: boolean; code: Code | null }
type Deployment = { running: boolean; current: string | null; queue: string[]; results: { id: string; ok: boolean; note: string }[] } | null
type Preview = { state?: string; port?: number; commit?: string | null; note?: string } | null

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DEPLOY = `${BASE}/api/node/deploy`

export function ElementDeploy({ id, lang, ui }: { id: string; lang: string; ui: ElementDeployUi }) {
  const [el, setEl] = useState<Element | null | "failed">(null)
  const [dep, setDep] = useState<Deployment>(null)
  const [preview, setPreview] = useState<Preview>(null)
  const [refused, setRefused] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const PREVIEW = `${BASE}/api/architect/items/${encodeURIComponent(id)}/preview`

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        fetch(DEPLOY, { cache: "no-store" }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
        fetch(PREVIEW, { cache: "no-store" }).then((r) => (r.ok ? r.json() : { preview: null })),
      ])
      setEl((d.elements as Element[]).find((e) => e.id === id) ?? "failed")
      setDep(d.deployment as Deployment)
      setPreview((p as { preview: Preview }).preview)
      setAccepting((was) => (was && (p as { preview: Preview }).preview?.state === "ready"))
    } catch {
      setEl("failed")
    }
  }, [id, PREVIEW])

  useEffect(() => { void load() }, [load])

  const deploying = !!dep?.running && (dep.current === id || dep.queue.includes(id))
  const building = preview?.state === "building"
  const ready = preview?.state === "ready"
  const busy = !!dep?.running || building || accepting

  useEffect(() => {
    if (!busy) return
    const t = setInterval(() => void load(), 3000)
    return () => clearInterval(t)
  }, [busy, load])

  async function deploy() {
    setRefused(false)
    const r = await fetch(DEPLOY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) })
    if (r.status === 409) setRefused(true)
    setTimeout(() => void load(), 800)
  }

  async function act(action: "stage" | "promote" | "discard") {
    setRefused(false)
    if (action === "promote") setAccepting(true)
    const r = await fetch(PREVIEW, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
    if (r.status === 409) setRefused(true)
    setTimeout(() => void load(), 800)
  }

  if (el === null) return <p className="my-4 text-sm text-muted-foreground">{ui.loading}</p>
  if (el === "failed") return <p className="my-4 text-sm text-muted-foreground">{ui.unavailable}</p>

  const code = el.code
  const last = !dep?.running ? dep?.results.find((r) => r.id === id) : undefined
  const previewUrl = ready && preview?.port ? `http://127.0.0.1:${preview.port}/${lang}` : null

  return (
    <div className="my-4 flex flex-col gap-3 rounded-lg border border-border p-4" data-element-deploy={id}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">{ui.running}: <code className="font-mono text-foreground">{code?.running ?? ui.none}</code></span>
        <span className="text-muted-foreground">{ui.head}: <code className="font-mono text-foreground">{code?.head ?? ui.none}</code></span>
        {el.pending
          ? <Badge variant="secondary" className="border-warning/50 bg-warning/10 text-foreground" data-pending>{ui.pending}</Badge>
          : <Badge variant="outline">{ui.upToDate}</Badge>}
      </div>
      {code && code.changed > 0 && (
        <details className="text-sm" data-code-changes={code.changed}>
          <summary className="cursor-pointer text-muted-foreground">{ui.changes.replace("{n}", String(code.changed))}</summary>
          <ul className="mt-1 list-disc pl-5 font-mono text-xs text-muted-foreground">
            {code.changes.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </details>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={deploy} disabled={busy || ready} data-element-deploy-go>
          {deploying ? <Spinner className="mr-1" /> : <Rocket className="size-4" aria-hidden />}
          {ui.deploy}
        </Button>
        <Button type="button" variant="outline" onClick={() => act("stage")} disabled={busy || ready} data-element-preview-stage>
          {building ? <Spinner className="mr-1" /> : <Eye className="size-4" aria-hidden />}
          {ui.preview}
        </Button>
      </div>

      {deploying && <p className="text-sm text-foreground" role="status">{ui.deploying}</p>}
      {building && <p className="text-sm text-foreground" role="status">{ui.previewBuilding}</p>}
      {accepting && <p className="text-sm text-foreground" role="status">{ui.accepting}</p>}
      {refused && <p className="text-sm text-muted-foreground" role="status">{ui.busy}</p>}
      {preview?.state === "failed" && <p className="text-sm text-destructive" role="alert">{ui.previewFailed} {preview.note}</p>}
      {last && <p className={last.ok ? "text-sm text-foreground" : "text-sm text-destructive"}>{last.ok ? ui.lastOk : ui.lastFailed}{last.note ? ` · ${last.note}` : ""}</p>}

      {ready && previewUrl && !accepting && (
        <div className="flex flex-col gap-2" data-element-preview-ready={preview?.port}>
          <p className="text-sm text-foreground">{ui.previewReady}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={() => act("promote")} data-element-preview-accept>
              <Check className="size-4" aria-hidden />
              {ui.accept}
            </Button>
            <Button type="button" variant="outline" onClick={() => act("discard")} data-element-preview-reject>
              <X className="size-4" aria-hidden />
              {ui.reject}
            </Button>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              {ui.previewOpen}
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{ui.previewOnMachine}</p>
          {/* 347 (слово владельца 2026-09-30: «вместо предпросмотра я вижу белый экран … когда я нажимаю открыть предпросмотр в
              новой вкладке то все получается очень хорошо. Давай уберём отсюда этот белый экран и даже не будем решать эту
              проблему»): окно предпросмотра внутри страницы снято, остаётся «Открыть в новой вкладке». */}
        </div>
      )}
    </div>
  )
}
