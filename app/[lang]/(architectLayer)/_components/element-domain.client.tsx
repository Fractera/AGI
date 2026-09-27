"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «ГЛАВНОЕ ЗЕРКАЛО» — ВЫБОР ИЗ ДОМЕНОВ УЗЛА (324-3). Слово владельца 2026-09-27: «вместо того чтобы вводить свой домен я тебя
// просил сделать выпадающий список и указать какие домены уже прикреплены а какие ещё свободны и какие я могу привязать к
// проекту». Список — та же дверь, что рисует карточки «Активации домена» (`/api/domain/list`): второго списка нет. Выбрать
// можно только свободный домен с активной зоной; ждущий серверов имён и подключённый к другому элементу видны, но закрыты.
// Нужного нет — «Добавить домен» ведёт на «Активацию домена». Подключение по кнопке замеряет зону заново (дверь элемента).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Listed = { name: string; state: string; holder: string | null }
type Kind = "ready" | "waiting" | "taken" | "current"

export function ElementDomain({ id, lang, ui, current }: { id: string; lang: string; ui: ElementSettingsUi; current: string | null }) {
  const w = ui.mirrorCard
  const router = useRouter()
  const [list, setList] = useState<Listed[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [picked, setPicked] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/domain/list`, { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { ok?: boolean; extra?: Listed[] }) => { if (j.ok && Array.isArray(j.extra)) setList(j.extra); else setLoadFailed(true) })
      .catch(() => setLoadFailed(true))
  }, [])

  function kind(d: Listed): Kind {
    if (d.name === current || d.holder === id) return "current"
    if (d.holder) return "taken"
    return d.state === "active" ? "ready" : "waiting"
  }

  async function attach() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/domain`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: picked }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (j?.ok) { setPicked(""); router.refresh(); setBusy(false); return }
      setError(w.errors[j?.error ?? ""] ?? `${w.errors.failed} ${j?.error ?? r.status}`)
    } catch { setError(w.errors.failed) }
    setBusy(false)
  }

  async function detach() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/domain`, { method: "DELETE" })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (j?.ok) { router.refresh(); setBusy(false); return }
      setError(w.errors[j?.error ?? ""] ?? `${w.errors.failed} ${j?.error ?? r.status}`)
    } catch { setError(w.errors.failed) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-2" data-element-domain={current ?? ""}>
      {current && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-foreground">{w.current} <a className="font-mono underline" href={`https://${current}`} target="_blank" rel="noopener noreferrer">{current}</a></p>
          <Button type="button" variant="outline" size="sm" onClick={detach} disabled={busy} data-domain-detach>
            {busy ? w.detaching : w.detach}
          </Button>
        </div>
      )}
      {loadFailed && <p className="text-sm text-destructive">{w.loadFailed}</p>}
      {list && list.length === 0 && <p className="text-sm text-muted-foreground" data-domain-empty>{w.empty}</p>}
      {list && list.length > 0 && (
        <>
          <Label htmlFor={`element-domain-${id}`}>{w.label}</Label>
          <Select value={picked} onValueChange={setPicked}>
            <SelectTrigger id={`element-domain-${id}`} className="w-full max-w-md" data-domain-select>
              <SelectValue placeholder={w.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {list.map((d) => {
                const k = kind(d)
                return (
                  <SelectItem key={d.name} value={d.name} disabled={k !== "ready"} data-domain-option={k}>
                    <span className="font-mono">{d.name}</span>
                    <span className="text-muted-foreground">— {w.kinds[k].replace("{by}", d.holder ?? "")}</span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Button type="button" className="w-fit" onClick={attach} disabled={!picked || busy} data-domain-attach>
            {busy ? w.attaching : w.attach}
          </Button>
        </>
      )}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <a className="w-fit text-sm underline" href={`/${lang}/architect/hosting/domain`} data-domain-add>{w.add}</a>
      <p className="text-[length:var(--fs-small)] text-muted-foreground">{w.note}</p>
    </div>
  )
}
