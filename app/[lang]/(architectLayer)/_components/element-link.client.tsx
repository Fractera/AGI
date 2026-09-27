"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// ОДНА СВЯЗЬ ЭЛЕМЕНТА С УЗЛОМ (324-7): CONFIG, Дизайн или Блоки. Состояние словами и одна кнопка; нажатие — дверь ядра
// `/api/architect/items/<id>/links`, которая пишет состояние, выполняет своё (перенос настроек, реестр блоков) и
// перерисовывает страницы элемента.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementLink({ id, kind, on, ui }: { id: string; kind: "config" | "design" | "blocks"; on: boolean; ui: ElementSettingsUi }) {
  const w = ui.linkCard
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/links`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, on: !on }) })
      const j = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (j?.ok) { router.refresh(); setBusy(false); return }
      setError(`${w.failed} ${j?.error ?? r.status}`)
    } catch { setError(w.failed) }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-1.5" data-element-link={kind} data-link-on={on ? "yes" : "no"}>
      <p className={on ? "text-sm text-foreground" : "text-sm font-medium text-foreground"}>{on ? w.on : w.off}</p>
      <Button type="button" size="sm" variant="outline" className="w-fit" onClick={toggle} disabled={busy} data-link-toggle>
        {busy ? w.busy : on ? w.turnOff : w.turnOn}
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
