"use client"

import { useEffect, useRef, useState } from "react"
import { CircleHelp, Copy, ExternalLink, Highlighter, RefreshCw, Search, SquareTerminal } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WebPreview, WebPreviewBody, WebPreviewNavigation, WebPreviewUrl } from "@/components/ai-elements/web-preview"
import { useScreenScale } from "./use-screen-scale.client"
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
//
// 🔒 «НАЙТИ БЛОК» — ОБРАТНЫЙ ХОД (шаг 318, слово владельца: «когда пользователь вставляет и нажимает то открывается нужно
// страница она прокручивается до нужной секции и выделяется нужный блок… блок подсвечивается на 3 секунды а потом тухнет
// адрес внутри инпут очищается»). Ссылка — `/<lang>/<путь>#block=<bid>` (её даёт агент элемента и строка «Ссылка» в
// «Скопировать адрес»); полный адрес принимается только с источником этого элемента. Окно открывает страницу заново
// (перемонтирование просмотра), по загрузке ядро шлёт `{ type: "fractera:locate", bid }`, прокрутку и рамку делает сам
// элемент и отвечает `fractera:locate-state`. Нашёл — поле пустеет; не нашёл или молчит — причина под полем, текст
// остаётся, чтобы человек видел, что вставил.

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
  findPlaceholder: string
  find: string
  findHelp: string
  findSearching: string
  findNotFound: string
  findNoAnswer: string
  findBadLink: string
  findForeign: string
}

type FindState = "idle" | "waiting" | "notFound" | "silent" | "bad" | "foreign"
const LOCATE_EVERY_MS = 300
const LOCATE_MAX_MS = 5000

/** Ссылка на блок из вставленного текста: `/<путь>#block=<bid>` или полный адрес с тем же хвостом; из скопированного
 *  адреса в несколько строк берётся строка со ссылкой. `origin` — источник, если ссылка была полным адресом. */
function parseBlockLink(text: string): { path: string; bid: string; origin: string | null } | null {
  const m = text.match(/(\S*)#block=([a-z0-9]+)/i)
  if (!m) return null
  const [, head, bid] = m
  if (/^https?:\/\//i.test(head)) {
    try {
      const u = new URL(head)
      return { path: u.pathname, bid, origin: u.origin }
    } catch {
      return null
    }
  }
  return head.startsWith("/") ? { path: head, bid, origin: null } : null
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
  // 334: фрейм шириной окна ядра, уменьшенный до места (`use-screen-scale.client.ts`).
  const { boxRef, fit } = useScreenScale<HTMLDivElement>()
  // «Найти блок» (318): текст поля, ход поиска, адрес, с которого просмотр открыт заново, и блок, ждущий загрузки окна.
  const [findText, setFindText] = useState("")
  const [find, setFind] = useState<FindState>("idle")
  const [startUrl, setStartUrl] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const pendingBid = useRef<string | null>(null)
  const findTimer = useRef<number | null>(null)

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
      const d = e.data as { type?: string; on?: boolean; address?: string; bid?: string; found?: boolean } | null
      if (d?.type === "fractera:highlight-state") setAnswer(d.on ? "on" : "none")
      if (d?.type === "fractera:locate-state" && pendingBid.current && d.bid === pendingBid.current) {
        pendingBid.current = null
        if (findTimer.current) window.clearTimeout(findTimer.current)
        if (d.found) { setFind("idle"); setFindText("") } else setFind("notFound")
      }
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
      // 324-6: перерисовку зовёт сервер ядра по петле машины — на собственном домене элемента кука узла не живёт.
      const r = await fetch(`${BASE}/api/architect/items/${encodeURIComponent(serviceId)}/redraw`, { method: "POST", cache: "no-store" })
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

  // Окно открывается заново на странице из ссылки; блок ищется, когда оно загрузится (`onLoad` ниже).
  function findBlock() {
    const link = parseBlockLink(findText.trim())
    if (!link || !elementOrigin) { setFind("bad"); return }
    if (link.origin && link.origin !== elementOrigin) { setFind("foreign"); return }
    const target = `${elementOrigin}${link.path}`
    pendingBid.current = link.bid
    setFind("waiting")
    setStartUrl(target)
    setCurrent(target)
    setPreviewKey((k) => k + 1)
  }

  // 🛑 `onLoad` окна приходит РАНЬШЕ, чем островок элемента оживёт в браузере и начнёт слушать: первое сообщение
  // теряется (замерено 318-2 в браузере владельца — «не ответил», то же сообщение секундой позже — `found: true`).
  // Поэтому сообщение повторяется каждые LOCATE_EVERY_MS, пока элемент не ответит, но не дольше LOCATE_MAX_MS. Повторы
  // живут только внутри одного нажатия «Найти» — сами по себе ничего не запускают.
  function sendLocate() {
    const bid = pendingBid.current
    if (!bid || !elementOrigin) return
    const origin = elementOrigin
    const started = Date.now()
    if (findTimer.current) window.clearTimeout(findTimer.current)
    const tick = () => {
      if (pendingBid.current !== bid) return
      if (Date.now() - started > LOCATE_MAX_MS) {
        pendingBid.current = null
        setFind("silent")
        return
      }
      frameRef.current?.contentWindow?.postMessage({ type: "fractera:locate", bid }, origin)
      findTimer.current = window.setTimeout(tick, LOCATE_EVERY_MS)
    }
    tick()
  }

  const findMessage =
    find === "waiting" ? words.findSearching : find === "notFound" ? words.findNotFound : find === "silent" ? words.findNoAnswer
      : find === "bad" ? words.findBadLink : find === "foreign" ? words.findForeign : null

  async function copyPicked() {
    if (!picked) return
    try { await navigator.clipboard.writeText(picked); setCopied(true) } catch { setCopied(false) }
  }

  const status =
    reload === "busy" ? words.reloading : reload === "done" ? words.reloaded : reload === "unconfirmed" ? words.reloadUnconfirmed : null

  return (
    <div className="flex flex-col gap-2" data-element-preview={serviceId}>
      {!state.public && <p className="text-muted-foreground text-sm">{words.localOnly}</p>}
      <TooltipProvider>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => { e.preventDefault(); findBlock() }}
          data-preview-find
        >
          <Input
            value={findText}
            onChange={(e) => { setFindText(e.target.value); if (find !== "waiting") setFind("idle") }}
            placeholder={words.findPlaceholder}
            aria-label={words.findPlaceholder}
            className="h-8 flex-1 font-mono text-sm"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" aria-label={words.findHelp} data-preview-find-help>
                <CircleHelp className="size-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{words.findHelp}</TooltipContent>
          </Tooltip>
          <Button type="submit" variant="outline" size="sm" className="shrink-0 gap-1.5" disabled={!findText.trim() || find === "waiting"}>
            <Search className="size-4" aria-hidden />
            {words.find}
          </Button>
        </form>
      </TooltipProvider>
      {findMessage && (
        <p className="text-muted-foreground text-sm" role="status" data-preview-find-state={find}>
          {findMessage}
        </p>
      )}
      <WebPreview key={previewKey} defaultUrl={startUrl ?? state.url} onUrlChange={setCurrent} className="h-[70vh] min-h-[480px]">
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
        <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden" data-preview-scale={fit ? fit.scale.toFixed(3) : undefined}>
          <WebPreviewBody
            key={frameKey}
            ref={frameRef}
            allow="clipboard-write"
            className="absolute top-0 left-0 border-0"
            style={fit ? { width: fit.width, height: fit.height, transform: `scale(${fit.scale})`, transformOrigin: "0 0" } : undefined}
            onLoad={() => {
              if (highlight) { awaitAnswer(); sendHighlight(true) }
              if (pendingBid.current) sendLocate()
            }}
          />
        </div>
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
