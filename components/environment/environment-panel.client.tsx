"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppDialog } from "@/components/dialog/app-dialog.client"
import type { AppDialogUi } from "@/components/dialog/app-dialog.i18n"
import type { EnvironmentUi } from "./environment.i18n"

// ВКЛАДКА «ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ» (336-1) — одна на ядро и на каждый элемент. Список и пояснения приходят с сервера (из
// файла-примера), а задана ли переменная — спрашивается в браузере дверью `/api/architect/environment`: это знание о
// машине, и страница, запомнившая его при сборке, врала бы после первого сохранения.
//
// 🔒 У КАЖДОЙ СТРОКИ АДРЕС `#<ИМЯ>`. Пришли по ссылке `…/environment#OPENAI_API_KEY` (подсказка голосового ввода открывает её
// в новой вкладке) — строка встаёт в середину окна и обводится на 3 с. 🛑 Прокрутка `instant`: плавная у владельца не
// доходит до места (замерено 318-2).
// 🔒 КЛЮЧ ОПЕНАИ — СЛОВО ВЛАДЕЛЬЦА 2026-09-29: ключ ядра, если он есть; нет — ключ элемента, и сразу вопрос «продублировать в
// ядро?». Значение не показывается никогда — только «задана / не задана».

export type EnvRow = { name: string; group: string; help: string }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const FLASH_MS = 3000

type State = { set: string[]; editable: string[]; coreHasKey: boolean } | null

export function EnvironmentPanel({ target, rows, ui, dialogUi }: { target: string; rows: EnvRow[]; ui: EnvironmentUi; dialogUi: AppDialogUi }) {
  const [state, setState] = useState<State>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<{ text: string; bad: boolean } | null>(null)
  const [dupOpen, setDupOpen] = useState(false)
  const [dupBusy, setDupBusy] = useState(false)
  const [pendingKey, setPendingKey] = useState("")

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/api/architect/environment?target=${encodeURIComponent(target)}`, { cache: "no-store", credentials: "include" })
      const j = (await r.json().catch(() => null)) as ({ ok?: boolean } & NonNullable<State>) | null
      if (j?.ok) setState({ set: j.set, editable: j.editable, coreHasKey: j.coreHasKey })
    } catch { /* состояние остаётся «проверяю» — честнее, чем выдуманное */ }
  }, [target])

  useEffect(() => { void load() }, [load])

  // Адрес строки: по приходу и при смене `#` — в середину окна и рамка на 3 с.
  useEffect(() => {
    let timer = 0
    const go = () => {
      const name = decodeURIComponent(window.location.hash.slice(1))
      const el = name ? document.getElementById(`env-${name}`) : null
      if (!el) return
      const r = el.getBoundingClientRect()
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2), behavior: "instant" })
      setFlash(name)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setFlash(null), FLASH_MS)
      el.querySelector("input")?.focus({ preventScroll: true })
    }
    go()
    window.addEventListener("hashchange", go)
    return () => { window.removeEventListener("hashchange", go); window.clearTimeout(timer) }
  }, [])

  async function post(to: string, v: string): Promise<{ ok?: boolean; error?: string; coreHasKey?: boolean } | null> {
    const r = await fetch(`${BASE}/api/architect/environment`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ target: to, name: "OPENAI_API_KEY", value: v }),
    })
    return (await r.json().catch(() => null)) as { ok?: boolean; error?: string; coreHasKey?: boolean } | null
  }

  async function save() {
    setBusy(true)
    setNote({ text: ui.saving, bad: false })
    try {
      const j = await post(target, value)
      if (j?.ok) {
        setNote({ text: target === "core" ? ui.saved : `${ui.saved} ${ui.elementRestart}`, bad: false })
        if (target !== "core" && !j.coreHasKey) { setPendingKey(value); setDupOpen(true) }
        setValue("")
        await load()
      } else {
        const code = j?.error ?? "failed"
        setNote({ text: ui.errors[code] ?? `${ui.failed} ${code}`, bad: true })
      }
    } catch {
      setNote({ text: `${ui.failed} network`, bad: true })
    }
    setBusy(false)
  }

  async function copyToCore() {
    setDupBusy(true)
    try {
      const j = await post("core", pendingKey)
      setNote(j?.ok ? { text: ui.dupDone, bad: false } : { text: ui.errors[j?.error ?? ""] ?? `${ui.failed} ${j?.error ?? "failed"}`, bad: true })
      await load()
    } catch {
      setNote({ text: `${ui.failed} network`, bad: true })
    }
    setPendingKey("")
    setDupBusy(false)
    setDupOpen(false)
  }

  if (rows.length === 0) return <p className="my-4 text-sm text-muted-foreground">{ui.empty}</p>

  let lastGroup = ""
  return (
    <div className="my-4 flex flex-col gap-2" data-environment={target}>
      {rows.map((row) => {
        const head = row.group && row.group !== lastGroup ? row.group : ""
        lastGroup = row.group || lastGroup
        const isSet = state ? state.set.includes(row.name) : null
        const editable = state?.editable.includes(row.name) ?? false
        return (
          <div key={row.name} className="flex flex-col gap-2">
            {head && <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{head}</p>}
            <div
              id={`env-${row.name}`}
              data-env-var={row.name}
              data-env-set={isSet === null ? "unknown" : isSet ? "yes" : "no"}
              className={`flex scroll-mt-24 flex-col gap-1.5 rounded-lg border p-3 transition-shadow ${flash === row.name ? "border-primary ring-2 ring-primary" : "border-border"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <a href={`#${row.name}`} className="font-mono text-sm font-medium text-foreground hover:underline">{row.name}</a>
                <span className={`rounded-md border px-1.5 py-0.5 text-xs ${isSet ? "border-primary/40 text-foreground" : "border-border text-muted-foreground"}`}>
                  {isSet === null ? ui.unknown : isSet ? ui.set : ui.notSet}
                </span>
              </div>
              {row.help && <p className="text-sm text-muted-foreground">{row.help}</p>}
              {editable && (
                <div className="flex flex-col gap-2">
                  {row.name === "OPENAI_API_KEY" && target !== "core" && state?.coreHasKey && <p className="text-sm text-foreground">{ui.coreKeyUsed}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Input
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={ui.newValue}
                      aria-label={`${row.name}: ${ui.newValue}`}
                      className="max-w-md font-mono"
                      data-env-input={row.name}
                    />
                    <Button type="button" size="sm" onClick={save} disabled={busy || !value.trim()} data-env-save={row.name}>
                      {busy ? ui.saving : ui.save}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{ui.editableHint}</p>
                  {note && <p className={note.bad ? "text-sm text-destructive" : "text-sm text-foreground"} role={note.bad ? "alert" : "status"}>{note.text}</p>}
                </div>
              )}
            </div>
          </div>
        )
      })}
      <AppDialog
        open={dupOpen}
        onOpenChange={(o) => { if (!dupBusy) { setDupOpen(o); if (!o) setPendingKey("") } }}
        title={ui.dupTitle}
        description={ui.dupText}
        ui={dialogUi}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => { setDupOpen(false); setPendingKey("") }} disabled={dupBusy}>{ui.dupNo}</Button>
            <Button type="button" onClick={copyToCore} disabled={dupBusy} data-env-dup-core>{ui.dupYes}</Button>
          </>
        }
      />
    </div>
  )
}
