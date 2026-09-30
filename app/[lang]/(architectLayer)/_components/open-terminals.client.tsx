"use client"

import { useCallback, useEffect, useState } from "react"
import { SquareTerminal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OpenTerminalsUi } from "../_i18n/open-terminals.i18n"

// ПОЛОСА «ТЕРМИНАЛЫ, КОТОРЫЕ НАГРУЖАЮТ ВАШ КОМПЬЮТЕР» (узел, шаг 345; черновик 267-5). Слово владельца 2026-09-30: «создать
// индикатор активных открытых Cloud Code терминалов … только тогда я смогу их закрыть … отслеживают только те терминалы которые
// создаются через наш новый стартовый шаблон». Источник — дверь `/api/agents/sessions` (только рождённые элементы).
//
// 🔒 СВЕЖЕСТЬ — ПРИ ОТКРЫТИИ СТРАНИЦЫ И ПРИ ВОЗВРАТЕ НА ВКЛАДКУ, БЕЗ ТАЙМЕРОВ (выбор владельца 2026-09-30: «Открытие и возврат
// на вкладку»). Терминал, запущенный в соседней вкладке, появится здесь после перехода или возврата на эту.
// 🔒 НЕТ ТЕРМИНАЛОВ — НЕТ ПОЛОСЫ; дверь отказала (не архитектор, временный адрес) — тоже нет: полоса объясняет, а не охраняет.
// Липнет под шапкой (`top-14`) и стоит в потоке страницы — ничего не перекрывает. Закрыть — только после подтверждения прямо
// в карточке (не окно браузера: оно блокирует страницу).

type Session = { id: string; name: string; since: string | null; channel: boolean }

export function OpenTerminals({ lang, ui }: { lang: string; ui: OpenTerminalsUi }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [asking, setAsking] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    fetch("/api/agents/sessions", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok?: boolean; sessions?: Session[] } | null) => setSessions(d?.ok && Array.isArray(d.sessions) ? d.sessions : []))
      .catch(() => setSessions([]))
  }, [])

  useEffect(() => {
    load()
    const onVisible = () => { if (document.visibilityState === "visible") load() }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [load])

  async function close(id: string) {
    setBusy(id)
    setError(false)
    try {
      const r = await fetch("/api/agents/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, action: "stop" }),
      })
      if (!r.ok) throw new Error(String(r.status))
      setAsking(null)
      load()
    } catch {
      setError(true)
    } finally {
      setBusy(null)
    }
  }

  if (sessions.length === 0) return null
  const time = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" }) : "")

  return (
    <div data-open-terminals className="sticky top-14 z-30 border-b border-warning/50 bg-warning/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-2 md:px-8">
        <p className="flex shrink-0 items-center gap-2 text-sm font-medium text-foreground">
          <SquareTerminal className="size-4 text-warning" aria-hidden />
          <span className="hidden sm:inline">{ui.title}</span>
          <span className="rounded-full border border-warning px-2 text-xs font-semibold text-foreground">{sessions.length}</span>
        </p>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5">
          {sessions.map((s) => (
            <li key={s.id} data-terminal={s.id} className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1 text-sm">
              <a href={`/${lang}/${s.name}/build/terminal`} className="font-medium hover:underline" title={ui.open}>
                {s.name}
              </a>
              <span className="text-xs text-muted-foreground">
                {ui.since} {time(s.since)}{s.channel ? ` · ${ui.channel}` : ""}
              </span>
              {asking === s.id ? (
                <span className="flex items-center gap-1.5" data-terminal-confirm>
                  <span className="text-xs text-destructive">{ui.confirm}</span>
                  <Button type="button" size="sm" variant="destructive" disabled={busy === s.id} onClick={() => close(s.id)} data-terminal-close-yes>
                    {ui.confirmYes}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" disabled={busy === s.id} onClick={() => setAsking(null)}>
                    {ui.cancel}
                  </Button>
                </span>
              ) : (
                <Button type="button" size="sm" variant="ghost" onClick={() => setAsking(s.id)} data-terminal-close aria-label={`${ui.close} ${s.name}`}>
                  <X className="size-3.5" aria-hidden />
                  {ui.close}
                </Button>
              )}
            </li>
          ))}
        </ul>
        {error && <span className="shrink-0 text-xs text-destructive">{ui.failed}</span>}
      </div>
    </div>
  )
}
