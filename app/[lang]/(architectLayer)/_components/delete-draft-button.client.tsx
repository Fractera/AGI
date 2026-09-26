"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { AgiDraftsUi } from "../_i18n/agi-drafts.i18n"

// «УДАЛИТЬ» ЧЕРНОВИК (314-1). Слово владельца: «кнопку удалить которая должно вызывать модельное окно с подтверждением где
// пользователь должен ввести созданный для него домен». Кнопка подтверждения неактивна, пока адрес не совпал буква в букву;
// дверь сверяет адрес ещё раз сама — интерфейс не единственная защита.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function DeleteDraftButton({ lang, id, address, ui, dialogUi }: {
  lang: string
  id: string
  address: string
  ui: AgiDraftsUi
  dialogUi: AppDialogUi
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const match = typed.trim() === address

  async function remove() {
    setBusy(true)
    setError(null)
    try {
      const r = await fetch(`${BASE}/api/architect/drafts/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: typed.trim() }),
      })
      if (r.status === 409) throw new Error("mismatch")
      if (!r.ok) throw new Error(String(r.status))
      setOpen(false)
      router.push(`/${lang}/architect`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error && e.message === "mismatch" ? ui.deleteMismatch : ui.deleteFailed)
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setTyped(""); setError(null); setOpen(true) }} data-delete-draft>
        <Trash2 />
        {ui.delete}
      </Button>
      <AppDialog
        open={open}
        onOpenChange={(v) => !busy && setOpen(v)}
        title={ui.deleteTitle}
        titleClassName="text-destructive"
        description={ui.deleteText}
        ui={dialogUi}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>{ui.cancel}</Button>
            <Button variant="destructive" onClick={remove} disabled={!match || busy}>
              {busy ? ui.deleting : ui.deleteConfirm}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm text-foreground select-all">{address}</p>
          <Label htmlFor={`confirm-${id}`}>{ui.deleteLabel}</Label>
          <Input id={`confirm-${id}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} placeholder={address} />
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
        </div>
      </AppDialog>
    </>
  )
}
