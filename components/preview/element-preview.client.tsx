"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview"

// ПРОСМОТР ЭЛЕМЕНТА УЗЛА ВНУТРИ ЯДРА (слово владельца 2026-09-24: «транслировалось наше корневое
// приложение»). Компонент — WebPreview из AI Elements; адрес спрашивается у двери ядра в браузере:
// страница предрендерена, а адрес зависит от того, подключён ли домен.

export type ElementPreviewWords = { loading: string; unavailable: string; localOnly: string; openNew: string }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementPreview({ serviceId, lang, words }: { serviceId: string; lang: string; words: ElementPreviewWords }) {
  const [state, setState] = useState<{ url: string; public: boolean } | "loading" | "failed">("loading")
  // Адрес, открытый в просмотре СЕЙЧАС (человек мог перейти внутри): его и открывает кнопка «в новой вкладке».
  const [current, setCurrent] = useState<string | null>(null)

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
      <WebPreview defaultUrl={state.url} onUrlChange={setCurrent} className="h-[70vh] min-h-[480px]">
        <WebPreviewNavigation>
          <WebPreviewUrl />
          {/* Слово владельца 2026-09-25: «добавь кнопку открыть страницу в новой вкладке чтобы из превью можно было уйти
              сразу в работу на суб домен или домен если это про root». Адрес — от двери ядра (поддомен элемента, у root —
              корень домена); ссылка, а не кнопка со скриптом: открывается и без JavaScript. */}
          <a
            href={current ?? state.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0 gap-1.5" })}
          >
            <ExternalLink className="size-4" aria-hidden />
            {words.openNew}
          </a>
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    </div>
  )
}
