"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, ExternalLink, Eye, Rocket, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { ElementDeployUi } from "../_i18n/element-deploy.i18n"
import { LiveLog } from "./live-log.client"

// «РАЗВЕРНУТЬ» И «ПРЕДПРОСМОТР» НА СТРАНИЦЕ «РАЗВЁРТЫВАНИЯ» ЭЛЕМЕНТА (узел, шаг 337-3/4). Слово владельца 2026-09-29:
// «кнопка развёртывания уже существует у нас в проекте и выглядит более целостно, потому что показывает и коммит и
// состояние — как будто бы не хватает только кнопки развернуть … и вторая кнопка привью».
//
// 🔒 СОСТОЯНИЕ — ФАКТЫ ДВЕРЕЙ, А НЕ ПАМЯТЬ СТРАНИЦЫ: код элемента и ход развёртывания — `/api/node/deploy` (та же дверь, что у
// «Развёртываний» ядра), предпросмотр — `/api/architect/items/<id>/preview`. Спрашиваются при открытии,
// при возврате на вкладку и раз в 1 с, пока идёт работа, которую человек сам запустил (353-3: лёгкий режим двери — только ход и журнал); в покое — ни одного запроса.

type Code = { head: string | null; running: string | null; changed: number; changes: string[]; pending: boolean }
type Element = { id: string; pending: boolean; code: Code | null }
type Deployment = { running: boolean; current: string | null; queue: string[]; finishedAt?: string | null; results: { id: string; ok: boolean; note: string }[] } | null
type Preview = { state?: string; port?: number; commit?: string | null; note?: string } | null

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DEPLOY = `${BASE}/api/node/deploy`

export function ElementDeploy({ id, lang, ui }: { id: string; lang: string; ui: ElementDeployUi }) {
  const [el, setEl] = useState<Element | null | "failed">(null)
  const [dep, setDep] = useState<Deployment>(null)
  const [preview, setPreview] = useState<Preview>(null)
  // 353-2: отказ двери называется причиной, а не одним «занято».
  const [refused, setRefused] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  // 353-3: нажатие видно сразу — до ответа двери; `log` — хвост журнала хода.
  const [starting, setStarting] = useState<{ kind: "deploy" | "preview"; at: number } | null>(null)
  const [log, setLog] = useState<string[]>([])
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
      setAccepting((was) => was && ["ready", "promoting"].includes((p as { preview: Preview }).preview?.state ?? ""))
    } catch {
      setEl("failed")
    }
  }, [id, PREVIEW])

  useEffect(() => { void load() }, [load])
  // 353-2 (решение агента в плане, подтверждено владельцем 2026-10-01): состояние перечитывается и при возврате на вкладку —
  // предпросмотр, собранный из другого места, иначе не виден странице, открытой раньше. Таймера нет.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") void load() }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [load])

  const deploying = !!dep?.running && (dep.current === id || dep.queue.includes(id))
  const building = preview?.state === "building"
  const ready = preview?.state === "ready"
  // «Принять» идёт (в том числе запущено с другой вкладки): это переключение, а не поломка — «Переключаю…», опрос продолжается.
  const switching = accepting || preview?.state === "promoting"
  // Развёртывать нечего: настройки не новее сборки, работает последний коммит, незакоммиченных правок нет.
  const elCode = el && el !== "failed" ? el.code : null
  const upToDate = !!el && el !== "failed" && !el.pending && (!elCode || (elCode.running === elCode.head && elCode.changed === 0))
  const busy = !!dep?.running || building || switching
  const previewPending = building || ready || switching || starting?.kind === "preview"
  // Пока идёт работа, которую человек сам запустил (или она только что запрошена), — ход раз в секунду; в покое ни одного запроса.
  const active = starting !== null || busy

  // 353-3 (владелец: «нажал кнопку процесс нужно показывать сразу»). ✗ До 353: после нажатия — одно чтение через 0,8 с; процесс ещё
  // не записал `running`, страница решала, что ничего не идёт, и больше не спрашивала. Теперь «запускаю» стоит с первого кадра и
  // снимается, только когда дверь показала сам процесс (или через 30 с — тогда страница спросит всё заново).
  const progress = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        fetch(`${DEPLOY}?progress=1&log=${encodeURIComponent(id)}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        fetch(PREVIEW, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      ])
      const dd = (d?.deployment ?? null) as Deployment
      const pp = (p?.preview ?? null) as Preview
      const mine = !!dd?.running && (dd.current === id || dd.queue.includes(id))
      if (d) setDep(dd)
      if (p) {
        setPreview(pp)
        setAccepting((was) => was && ["ready", "promoting"].includes(pp?.state ?? ""))
      }
      setLog(mine ? ((d?.log as string[]) ?? []) : pp?.state === "building" ? ((p?.log as string[]) ?? []) : [])
      setStarting((s) => {
        if (!s) return s
        if (Date.now() - s.at > 30_000) return null
        if (s.kind === "deploy" && (mine || (dd?.finishedAt && Date.parse(dd.finishedAt) >= s.at))) return null
        if (s.kind === "preview" && (pp?.state === "building" || pp?.state === "ready")) return null
        return s
      })
    } catch { /* следующий тик спросит снова */ }
  }, [id, PREVIEW])

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => void progress(), 1000)
    return () => clearInterval(t)
  }, [active, progress])
  // Работа кончилась — один полный перечёт: код элемента, итог, кнопки.
  const wasActive = useRef(false)
  useEffect(() => {
    if (wasActive.current && !active) void load()
    wasActive.current = active
  }, [active, load])

  // 409 двери → слова: предпросмотр ждёт решения (353-1) или идёт другое развёртывание.
  async function refusal(r: Response): Promise<string> {
    const j = (await r.json().catch(() => ({}))) as { reason?: string }
    return j.reason === "preview-pending" ? ui.previewWaiting : ui.busy
  }

  async function deploy() {
    setRefused(null)
    setLog([])
    setStarting({ kind: "deploy", at: Date.now() })
    const r = await fetch(DEPLOY, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) })
    if (!r.ok) {
      setStarting(null)
      setRefused(r.status === 409 ? await refusal(r) : ui.unavailable)
    }
  }

  async function act(action: "stage" | "promote" | "discard") {
    setRefused(null)
    if (action === "promote") setAccepting(true)
    if (action === "stage") {
      setLog([])
      setStarting({ kind: "preview", at: Date.now() })
    }
    const r = await fetch(PREVIEW, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
    if (!r.ok) {
      setAccepting(false)
      setStarting(null)
      setRefused(r.status === 409 ? await refusal(r) : ui.unavailable)
    }
    if (action !== "stage") setTimeout(() => void load(), 800)
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

      {/* 353-2 (слово владельца 2026-10-01: «до тех пор пока я не принял или отложил … мне запрещено видеть … интерфейс для запуска
          нового развёртывания»): пока предпросмотр собирается, ждёт решения или принимается, кнопок «Развернуть» и «Предпросмотр» НЕТ
          в разметке — не выключены, а отсутствуют. Дверь отказывает и сама (353-1). */}
      {/* Владелец 2026-10-01: «зачем там кнопка горит развернуть … хорошего точно ничего не произойдёт … показать зелёную не
          кликабельную плашку все уже развёрнуто». Работает последний коммит, правок и изменённых настроек нет — кнопок нет. */}
      {!previewPending && !deploying && starting === null && upToDate && (
        <p className="inline-flex w-fit items-center gap-2 rounded-lg border border-success bg-success/10 px-4 py-2 text-sm font-semibold text-foreground" role="status" data-element-deployed>
          <Check className="size-4 text-success" aria-hidden />
          {ui.allDeployed}
        </p>
      )}
      {!previewPending && !(upToDate && !deploying && starting === null) && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={deploy} disabled={busy || starting !== null} data-element-deploy-go>
            {deploying || starting?.kind === "deploy" ? <Spinner className="mr-1" /> : <Rocket className="size-4" aria-hidden />}
            {ui.deploy}
          </Button>
          <Button type="button" variant="outline" onClick={() => act("stage")} disabled={busy || starting !== null} data-element-preview-stage>
            <Eye className="size-4" aria-hidden />
            {ui.preview}
          </Button>
        </div>
      )}

      {(deploying || starting?.kind === "deploy") && (
        <LiveLog title={ui.deploying} lines={log.length > 0 && deploying ? log : [ui.starting]} />
      )}
      {(building || starting?.kind === "preview") && !deploying && (
        <LiveLog title={ui.previewBuilding} lines={log.length > 0 && building ? log : [ui.starting]} />
      )}
      {switching && <p className="text-sm text-foreground" role="status">{ui.accepting}</p>}
      {refused && <p className="text-sm text-muted-foreground" role="status">{refused}</p>}
      {preview?.state === "failed" && <p className="text-sm text-destructive" role="alert">{ui.previewFailed} {preview.note}</p>}
      {last && !previewPending && <p className={last.ok ? "text-sm text-foreground" : "text-sm text-destructive"}>{last.ok ? ui.lastOk : ui.lastFailed}{last.note ? ` · ${last.note}` : ""}</p>}

      {ready && previewUrl && !switching && (
        <div className="flex flex-col gap-3" data-element-preview-ready={preview?.port}>
          <p className="text-sm text-foreground">{ui.previewReady}</p>
          {/* 353-2 (владелец: «кнопка посмотреть привил должны быть оформлены как настоящая кнопка чётко и выразительно»): была
              ссылка ghost sm — читалась как текст. Теперь главная кнопка экрана, крупная, с иконками. */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            // cn, а не className внутри buttonVariants: cva склеивает без слияния, и `text-sm` варианта перебивал `text-base`
            // (замерено в браузере 353-4: 14 px вместо крупной надписи).
            className={cn(buttonVariants({ size: "lg" }), "h-12 w-full gap-2 text-base font-semibold sm:w-auto sm:self-start sm:px-8")}
            data-element-preview-open
          >
            <Eye className="size-5" aria-hidden />
            {ui.previewOpen}
            <ExternalLink className="size-4" aria-hidden />
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => act("promote")} data-element-preview-accept>
              <Check className="size-4" aria-hidden />
              {ui.accept}
            </Button>
            <Button type="button" variant="outline" onClick={() => act("discard")} data-element-preview-reject>
              <X className="size-4" aria-hidden />
              {ui.reject}
            </Button>
          </div>
          {/* Владелец 2026-10-01: «самая важная строка на этом экране … сделай его жирным … пульсирующим нижний бордюр».
              Подчёркивание пульсирует основным цветом; при «уменьшить движение» стоит ровно. */}
          <p className="relative w-fit pb-1 text-sm font-bold text-foreground" data-element-after-decision>
            {ui.afterDecision}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
          </p>
          <p className="text-xs text-muted-foreground">{ui.previewOnMachine}</p>
          {/* 347 (слово владельца 2026-09-30: «вместо предпросмотра я вижу белый экран … когда я нажимаю открыть предпросмотр в
              новой вкладке то все получается очень хорошо. Давай уберём отсюда этот белый экран и даже не будем решать эту
              проблему»): окно предпросмотра внутри страницы снято, остаётся «Открыть в новой вкладке». */}
        </div>
      )}
    </div>
  )
}
