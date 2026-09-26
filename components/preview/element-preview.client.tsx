"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, ExternalLink, Highlighter, RefreshCw, SquareTerminal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview"
// 316: ссылка на терминал службы с адресом блока в окне вставки — одна функция мастера комплекта агента.
import { terminalLink } from "@/app/[lang]/(architectLayer)/architect/kits/_agent-kit/core/client/terminal-paste.mjs"

// ПРОСМОТР ЭЛЕМЕНТА УЗЛА ВНУТРИ ЯДРА (слово владельца 2026-09-24: «транслировалось наше корневое
// приложение»). Компонент — WebPreview из AI Elements; адрес спрашивается у двери ядра в браузере:
// страница предрендерена, а адрес зависит от того, подключён ли домен.
//
// 🔒 СТРОКА «АДРЕС | ОТКРЫТЬ СТРАНИЦУ | ОБНОВИТЬ» (слово владельца 2026-09-26: «yes in the preview flow as url |open page|
// reload»). Страницы элемента статические и обновляются раз в пять минут; «Обновить» просит элемент перерисовать их
// СЕЙЧАС — `POST <адрес элемента>/api/revalidate` по куке входа архитектора (ключа нет ни в адресе, ни в коде), — и
// перезапускает окно просмотра. Элемент без этой двери или без CORS для ядра отвечает непрочитанным ответом: окно всё
// равно перезапускается, а строка говорит «не подтверждено» — честно, без выдуманного успеха.
//
// 🔒 «ПОДСВЕТКА» (шаг 317-4, слово владельца: «разработать именно на этой странице кнопку активировать и деактивировать
// подсветку контейнеров»). Окно просмотра — другой источник: ядро не лезет в его страницу, а шлёт сообщение
// `{ type: "fractera:highlight", on }` ровно на источник элемента; рамки рисует островок самого элемента. Он отвечает
// `fractera:highlight-state` — нет ответа, значит элемент подсветку ещё не умеет, и строка так и говорит. Выбранный блок
// элемент присылает `fractera:block` — адрес «страница · файл · блок» стоит в панели под окном с кнопкой «Скопировать».

export type ElementPreviewWords = {
  loading: string
  unavailable: string
  localOnly: string
  openNew: string
  reload: string
  reloading: string
  reloaded: string
  reloadUnconfirmed: string
  highlight: string
  highlightOn: string
  highlightNoAnswer: string
  picked: string
  copy: string
  copied: string
  toTerminal: string
}

type ReloadState = "idle" | "busy" | "done" | "unconfirmed"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function ElementPreview({ serviceId, lang, words }: { serviceId: string; lang: string; words: ElementPreviewWords }) {
  const [state, setState] = useState<{ url: string; public: boolean } | "loading" | "failed">("loading")
  // Адрес, открытый в просмотре СЕЙЧАС (человек мог перейти внутри): его и открывает кнопка «в новой вкладке».
  const [current, setCurrent] = useState<string | null>(null)
  const [frameKey, setFrameKey] = useState(0)
  const [reload, setReload] = useState<ReloadState>("idle")
  const [highlight, setHighlight] = useState(false)
  const [answer, setAnswer] = useState<"none" | "waiting" | "on" | "silent">("none")
  const [picked, setPicked] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const frameRef = useRef<HTMLIFrameElement | null>(null)

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

  const elementOrigin = typeof state === "object" ? new URL(current ?? state.url).origin : null

  // Ответы элемента: подтверждение подсветки и выбранный блок — только от источника элемента.
  useEffect(() => {
    if (!elementOrigin) return
    function onMessage(e: MessageEvent) {
      if (e.origin !== elementOrigin) return
      const d = e.data as { type?: string; on?: boolean; address?: string } | null
      if (d?.type === "fractera:highlight-state") setAnswer(d.on ? "on" : "none")
      if (d?.type === "fractera:block" && typeof d.address === "string") { setPicked(d.address); setCopied(false) }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [elementOrigin])

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

  function sendHighlight(on: boolean) {
    const win = frameRef.current?.contentWindow
    if (!win || !elementOrigin) return
    win.postMessage({ type: "fractera:highlight", on }, elementOrigin)
  }

  // Ответ элемента ждём полторы секунды: раньше «не ответил» было бы неправдой — ответ ещё в пути.
  function awaitAnswer() {
    setAnswer("waiting")
    setTimeout(() => setAnswer((a) => (a === "waiting" ? "silent" : a)), 1500)
  }

  function toggleHighlight() {
    const on = !highlight
    setHighlight(on)
    if (on) awaitAnswer()
    else setAnswer("none")
    sendHighlight(on)
  }

  async function copyPicked() {
    if (!picked) return
    try { await navigator.clipboard.writeText(picked); setCopied(true) } catch { setCopied(false) }
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
          <Button type="button" variant={highlight ? "default" : "outline"} size="sm" className="shrink-0 gap-1.5" onClick={toggleHighlight} aria-pressed={highlight} data-preview-highlight>
            <Highlighter className="size-4" aria-hidden />
            {words.highlight}
          </Button>
        </WebPreviewNavigation>
        <WebPreviewBody
          key={frameKey}
          ref={frameRef}
          allow="clipboard-write"
          onLoad={() => { if (highlight) { awaitAnswer(); sendHighlight(true) } }}
        />
      </WebPreview>
      {highlight && answer !== "waiting" && (
        <p className="text-muted-foreground text-sm" role="status" data-preview-highlight-state={answer}>
          {answer === "on" ? words.highlightOn : words.highlightNoAnswer}
        </p>
      )}
      {picked && (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-3" data-preview-picked>
          <p className="text-sm font-medium">{words.picked}</p>
          <pre className="whitespace-pre-wrap break-all font-mono text-xs select-all">{picked}</pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={copyPicked}>
              <Copy className="size-4" aria-hidden />
              {copied ? words.copied : words.copy}
            </Button>
            {/* Текст в терминал не уходит сам: ссылка открывает страницу терминала с окном вставки, отправляет человек. */}
            <a
              href={terminalLink({ base: BASE, lang, service: serviceId, text: picked })}
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-fit gap-1.5" })}
              data-preview-to-terminal
            >
              <SquareTerminal className="size-4" aria-hidden />
              {words.toTerminal}
            </a>
          </div>
        </div>
      )}
      {status && (
        <p className="text-muted-foreground text-sm" role="status" data-preview-reload-state={reload}>
          {status}
        </p>
      )}
    </div>
  )
}
