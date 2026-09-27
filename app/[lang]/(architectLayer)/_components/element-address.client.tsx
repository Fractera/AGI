"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «АДРЕС ЭЛЕМЕНТА» (325-3). Поле нового имени, проверка свободы на лету (дверь `address`, GET) с вариантами, если занято;
// «Переименовать» — POST, затем полный переход на ту же страницу по новому адресу. id не меняется; адрес в интернете
// (поддомен) прежний — сказано под полем (решение владельца «Только ядро»).

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Check = { ok: boolean; reason?: "bad-shape" | "taken"; suggestions?: string[] }

export function ElementAddress({ id, lang, ui, current, internet }: {
  id: string
  lang: string
  ui: ElementSettingsUi
  current: string
  internet: string
}) {
  const w = ui.addressCard
  const [name, setName] = useState("")
  const [check, setCheck] = useState<Check | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const value = name.trim().toLowerCase()
  const same = value === current

  useEffect(() => {
    setCheck(null)
    if (!value || same) return
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`${BASE}/api/architect/items/${id}/address?name=${encodeURIComponent(value)}`, { cache: "no-store" })
        if (r.ok) setCheck((await r.json()) as Check)
      } catch { /* без проверки кнопка всё равно сверит на двери */ }
    }, 350)
    return () => clearTimeout(t)
  }, [value, same, id])

  async function rename() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/address`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address: value }),
      })
      const d = (await r.json().catch(() => null)) as (Check & { address?: string }) | null
      if (d?.ok && d.address) {
        window.location.assign(`${BASE}/${lang}/architect/${d.address}/settings`)
        return
      }
      setCheck(d)
      setError(d?.reason ? w[d.reason] : `${w.failed} ${r.status}`)
    } catch {
      setError(w.failed)
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-2" data-element-address={current}>
      <p className="text-sm text-foreground">
        {w.current} <span className="font-mono">/{lang}/{current}</span>
      </p>
      <Label htmlFor={`element-address-${id}`}>{w.label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={`element-address-${id}`}
          className="max-w-60 font-mono"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={current}
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="button" size="sm" onClick={rename} disabled={!value || same || busy || check?.ok === false} data-address-rename>
          {busy ? w.renaming : ui.address.action}
        </Button>
      </div>
      {check?.ok === true && <p className="text-sm text-foreground" data-address-free>{w.free}</p>}
      {check?.ok === false && check.reason && (
        <div className="flex flex-col gap-1.5" data-address-taken={check.reason}>
          <p className="text-sm text-destructive">{w[check.reason]}</p>
          {check.suggestions && check.suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[length:var(--fs-small)] text-muted-foreground">{w.suggest}</span>
              {check.suggestions.map((s) => (
                <Button key={s} type="button" variant="outline" size="sm" className="font-mono" onClick={() => setName(s)}>{s}</Button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && !check?.reason && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <p className="text-[length:var(--fs-small)] text-muted-foreground">{w.note.replace("{id}", id).replace("{internet}", internet)}</p>
    </div>
  )
}
