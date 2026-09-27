"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DomainListWords } from "./domain-list.i18n"
import { DomainPipeline, type PipelineDomain } from "./domain-pipeline.client"

// ДОМЕНЫ УЗЛА АККОРДЕОНОМ (324-1). Слово владельца 2026-09-27: «превратить в карточке аккордеона … показывают только одну
// активную карточку … первую карточку … первого домена … подключать больше доменов сколько угодно».
//
// 🔒 ОТКРЫТА ОДНА КАРТОЧКА (`type="single"`), первая — основной домен: внутри неё лестница 259 БЕЗ ИЗМЕНЕНИЙ (`ladder`).
// 🔒 СПИСОК СПРАШИВАЕТСЯ У УЗЛА (`/api/domain/list`), а не помнится: страница предрендерена.
// 🔒 ВСЁ ПО КНОПКЕ: добавить, убрать; карточка дополнительного домена — конвейер (`domain-pipeline.client.tsx`). Опросов нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Extra = PipelineDomain & { holder: string | null }
type List = { primary: { name: string; status: string | null } | null; extra: Extra[] }

const BADGE: Record<string, string> = {
  active: "border-border text-foreground",
  pending: "border-border text-muted-foreground",
}

export function DomainList({ lang, words: w, ladder }: { lang: string; words: DomainListWords; ladder: ReactNode }) {
  const [list, setList] = useState<List | null>(null)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState("primary")
  const [name, setName] = useState("")
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/domain/list`, { cache: "no-store" })
      if (!r.ok) throw new Error(String(r.status))
      setList((await r.json()) as List)
      setFailed(false)
    } catch { setFailed(true) }
  }, [])

  useEffect(() => { void load() }, [load])

  async function act(method: "POST" | "DELETE", domain: string, slot: string) {
    setBusy(slot)
    setError((e) => ({ ...e, [slot]: "" }))
    try {
      const r = await fetch(`${BASE}/api/domain/list`, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: domain }),
      })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string; holder?: string; domain?: { name: string } } | null
      if (d?.ok) {
        await load()
        if (method === "POST" && d.domain) { setName(""); setOpen(d.domain.name) }
      } else {
        const code = d?.error ?? String(r.status)
        setError((e) => ({ ...e, [slot]: w.errors[code] ?? `${w.errors.unknown} ${code}` }))
      }
    } catch {
      setError((e) => ({ ...e, [slot]: w.errors.unknown }))
    }
    setBusy(null)
  }

  return (
    <div className="flex flex-col gap-2" data-domain-list={list ? list.extra.length + 1 : 0}>
      {failed && <p className="text-sm text-destructive" role="alert">{w.loadFailed}</p>}
      <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="rounded-lg border border-border px-3">
        <AccordionItem value="primary" data-domain-card="primary">
          <AccordionTrigger>
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{w.primaryTitle}</span>
              <span className="font-mono text-sm text-muted-foreground">{list?.primary?.name ?? w.primaryNone}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>{ladder}</AccordionContent>
        </AccordionItem>

        {list?.extra.map((d) => (
          <AccordionItem key={d.name} value={d.name} data-domain-card={d.name} data-domain-state={d.state}>
            <AccordionTrigger>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono">{d.name}</span>
                <span className={`rounded-md border px-1.5 text-[length:var(--fs-small)] ${BADGE[d.state] ?? "border-destructive/40 text-destructive"}`}>
                  {d.state === "pending" && d.status ? d.status : d.state}
                </span>
                {d.holder && <span className="text-[length:var(--fs-small)] text-muted-foreground">→ {d.holder}</span>}
              </span>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <DomainPipeline lang={lang} domain={d} words={w} onChanged={load} />
              {d.holder && <p className="text-sm text-foreground">{w.attachedTo} <span className="font-mono">{d.holder}</span></p>}
              <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => act("DELETE", d.name, d.name)} disabled={busy !== null || !!d.holder} data-domain-remove>
                {w.remove}
              </Button>
              {error[d.name] && <p className="text-sm text-destructive" role="alert">{error[d.name]}</p>}
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="add" data-domain-card="add">
          <AccordionTrigger><span className="font-medium">+ {w.addTitle}</span></AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            <Label htmlFor="domain-add">{w.addLabel}</Label>
            <div className="flex flex-wrap gap-2">
              <Input id="domain-add" className="max-w-72 font-mono" value={name} onChange={(e) => setName(e.target.value)} placeholder="mybrand.com" autoComplete="off" spellCheck={false} />
              <Button type="button" size="sm" onClick={() => act("POST", name, "add")} disabled={!name.trim() || busy !== null} data-domain-add>
                {busy === "add" ? w.adding : w.add}
              </Button>
            </div>
            {error.add && <p className="text-sm text-destructive" role="alert">{error.add}</p>}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
