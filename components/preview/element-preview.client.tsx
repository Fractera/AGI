"use client"

import { useEffect, useState } from "react"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview"

// ПРОСМОТР ЭЛЕМЕНТА УЗЛА ВНУТРИ ЯДРА (слово владельца 2026-09-24: «транслировалось наше корневое
// приложение»). Компонент — WebPreview из AI Elements; адрес спрашивается у двери ядра в браузере:
// страница предрендерена, а адрес зависит от того, подключён ли домен.
//
// 🔒 СТРОКА «АДРЕС | ОТКРЫТЬ СТРАНИЦУ | ОБНОВИТЬ» (слово владельца 2026-09-26: «yes in the preview flow as url |open page|
// reload»). Страницы элемента статические и обновляются раз в пять минут; «Обновить» просит элемент перерисовать их
// СЕЙЧАС — `POST <адрес элемента>/api/revalidate` по куке входа архитектора (ключа нет ни в адресе, ни в коде), — и
// перезапускает окно просмотра. Элемент без этой двери или без CORS для ядра отвечает непрочитанным ответом: окно всё
// равно перезапускается, а строка говорит «не подтверждено» — честно, без выдуманного успеха.

export type ElementPreviewWords = {
  loading: string
  unavailable: string
  localOnly: string
  openNew: string
  reload: string
  reloading: string
  reloaded: string
  reloadUnconfirmed: string
}

type ReloadState = "idle" | "busy" | "done" | "unconfirmed"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementPreview({ serviceId, lang, words }: { serviceId: string; lang: string; words: ElementPreviewWords }) {
  const [state, setState] = useState<{ url: string; public: boolean } | "loading" | "failed">("loading")
  // Адрес, открытый в просмотре СЕЙЧАС (человек мог перейти внутри): его и открывает кнопка «в новой вкладке».
  const [current, setCurrent] = useState<string | null>(null)
  const [frameKey, setFrameKey] = useState(0)
  const [reload, setReload] = useState<ReloadState>("idle")

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

  const page = current ?? state.url

  async function redraw() {
    setReload("busy")
    let ok = false
    try {
      const r = await fetch(`${new URL(page).origin}/api/revalidate`, { method: "POST", credentials: "include", cache: "no-store" })
      ok = r.ok
    } catch {
      ok = false
    }
    setFrameKey((k) => k + 1)
    setReload(ok ? "done" : "unconfirmed")
  }

  const status =
    reload === "busy" ? words.reloading : reload === "done" ? words.reloaded : reload === "unconfirmed" ? words.reloadUnconfirmed : null

  return (
    <div className="flex flex-col gap-2" data-element-preview={serviceId}>
      {!state.public && <p className="text-muted-foreground text-sm">{words.localOnly}</p>}
      <WebPreview defaultUrl={state.url} onUrlChange={setCurrent} className="h-[70vh] min-h-[480px]">
        <WebPreviewNavigation>
          <WebPreviewUrl />
          {/* Слово владельца 2026-09-25: «добавь кнопку открыть страницу в новой вкладке чтобы из превью можно было уйти
              сразу в работу на суб домен или домен если это про root». Ссылка, а не кнопка со скриптом: открывается и
              без JavaScript. */}
          <a
            href={page}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "shrink-0 gap-1.5" })}
          >
            <ExternalLink className="size-4" aria-hidden />
            {words.openNew}
          </a>
          <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={redraw} disabled={reload === "busy"} data-preview-reload>
            <RefreshCw className={`size-4${reload === "busy" ? " animate-spin" : ""}`} aria-hidden />
            {words.reload}
          </Button>
        </WebPreviewNavigation>
        <WebPreviewBody key={frameKey} />
      </WebPreview>
      {status && (
        <p className="text-muted-foreground text-sm" role="status" data-preview-reload-state={reload}>
          {status}
        </p>
      )}
    </div>
  )
}
