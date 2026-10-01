"use client"

import { useEffect, useState } from "react"
import { ExternalLink, TriangleAlert } from "lucide-react"
import type { OriginNoticeWords } from "./origin-notice.i18n"

// ПЛАШКА «ВЕРСИЯ УСТАРЕЛА» НАД СЛОЕМ АРХИТЕКТОРА (шаг 368). Слово владельца 2026-10-01: «никакой запрет представить не будем, но …
// будем выводить уведомления что … ваша версия уже устарела … или продолжите». Ничего не блокирует: один запрос к двери при открытии
// страницы (таймеров нет); отставания нет или дверь отказала — плашки нет.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function OriginNotice({ words }: { words: OriginNoticeWords }) {
  const [state, setState] = useState<{ behindBy: number; repo: string | null } | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/node/origin`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { behindBy?: number; repo?: string | null } | null) => d && setState({ behindBy: Number(d.behindBy) || 0, repo: d.repo ?? null }))
      .catch(() => setState(null))
  }, [])

  if (!state || state.behindBy <= 0) return null
  return (
    <div className="mx-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-warning/50 bg-warning/10 px-3 py-2 text-sm text-foreground" role="status" data-origin-outdated={state.behindBy}>
      <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
      <span className="flex-1">{words.text.replace("{n}", String(state.behindBy))}</span>
      {state.repo && (
        <a href={state.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">
          {words.sync}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      )}
    </div>
  )
}
