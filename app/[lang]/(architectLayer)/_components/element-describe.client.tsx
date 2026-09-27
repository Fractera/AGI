"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Download, Terminal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { ElementSettingsUi } from "../_i18n/element-settings.i18n"

// «ОПИСАНИЕ ВОЗМОЖНОСТЕЙ» (325-2). Две кнопки и то, что уже лежит в ядре.
// «Сгенерировать» — переход на страницу терминала элемента с готовым заданием в окне вставки (механизм «В терминал», 316):
// отправляет задание агенту человек, сама ссылка ничего не запускает. «Забрать в ядро» — дверь `describe`: паспорт → реестр;
// отказ называется словами, какое поле не так.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Current = { summary: string; provides: string[]; at: string; commit: string | null } | null

export function ElementDescribe({ id, lang, ui, current, terminalHref }: {
  id: string
  lang: string
  ui: ElementSettingsUi
  current: Current
  terminalHref: string
}) {
  const router = useRouter()
  const w = ui.describeCard
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function take() {
    setBusy(true)
    setError(null)
    setDone(false)
    try {
      const r = await fetch(`${BASE}/api/architect/items/${id}/describe`, { method: "POST", cache: "no-store" })
      const d = (await r.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (d?.ok) { setDone(true); router.refresh() }
      else setError(w.errors[d?.error ?? ""] ?? `${w.errors.unknown} ${d?.error ?? r.status}`)
    } catch {
      setError(w.errors.unknown)
    }
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-3" data-element-describe={current ? "taken" : "empty"}>
      {current ? (
        <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
          <p className="text-sm text-foreground" data-described-summary>{current.summary}</p>
          <p className="text-[length:var(--fs-small)] text-muted-foreground" data-described-provides>{current.provides.join(" · ")}</p>
          <p className="text-[length:var(--fs-small)] text-muted-foreground">
            {w.takenAt} {new Date(current.at).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { dateStyle: "short", timeStyle: "short" })}
            {current.commit ? ` · ${current.commit}` : ""}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{w.empty}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Link href={terminalHref} className={`${buttonVariants({ size: "sm", variant: "outline" })} gap-1.5`} data-describe-generate>
          <Terminal className="size-4" aria-hidden />
          {ui.describe.action}
        </Link>
        <Button type="button" size="sm" className="gap-1.5" onClick={take} disabled={busy} data-describe-take>
          <Download className="size-4" aria-hidden />
          {busy ? w.taking : w.take}
        </Button>
      </div>
      <p className="text-[length:var(--fs-small)] text-muted-foreground">{w.how}</p>
      {error && <p className="text-sm text-destructive" role="alert" data-describe-error>{error}</p>}
      {done && !error && <p className="text-sm text-foreground" role="status">{w.taken}</p>}
    </div>
  )
}
