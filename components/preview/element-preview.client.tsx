"use client"

import { useEffect, useState } from "react"
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview"

// ПРОСМОТР ЭЛЕМЕНТА УЗЛА ВНУТРИ ЯДРА (слово владельца 2026-09-24: «транслировалось наше корневое
// приложение»). Компонент — WebPreview из AI Elements; адрес спрашивается у двери ядра в браузере:
// страница предрендерена, а адрес зависит от того, подключён ли домен.

export type ElementPreviewWords = { loading: string; unavailable: string; localOnly: string }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementPreview({ serviceId, lang, words }: { serviceId: string; lang: string; words: ElementPreviewWords }) {
  const [state, setState] = useState<{ url: string; public: boolean } | "loading" | "failed">("loading")

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/node/preview-url?id=${encodeURIComponent(serviceId)}&lang=${encodeURIComponent(lang)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { url: string; public: boolean }) => alive && setState(d))
      .catch(() => alive && setState("failed"))
    return () => {
      alive = false
    }
  }, [serviceId, lang])

  if (state === "loading") return <p className="text-muted-foreground text-sm">{words.loading}</p>
  if (state === "failed") return <p className="text-muted-foreground text-sm">{words.unavailable}</p>

  return (
    <div className="flex flex-col gap-2" data-element-preview={serviceId}>
      {!state.public && <p className="text-muted-foreground text-sm">{words.localOnly}</p>}
      <WebPreview defaultUrl={state.url} className="h-[70vh] min-h-[480px]">
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    </div>
  )
}
