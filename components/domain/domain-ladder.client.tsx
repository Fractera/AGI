"use client"

import { Check, ChevronDown, CircleAlert, ExternalLink, TriangleAlert } from "lucide-react"
import { type ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { H3, Small } from "@/components/ui/typography"
import { isTemporaryHostname } from "@/lib/auth/temporary-address"
import type { DomainLadderWords } from "@/components/domain/domain-ladder.i18n"

// ЛЕСТНИЦА ПОДКЛЮЧЕНИЯ СВОЕГО ДОМЕНА (259-1).
//
// 🎯 УСТРОЙСТВО ВЗЯТО У ОБРАЗЦА, НАЗВАННОГО ВЛАДЕЛЬЦЕМ: канал управления в службе
// памяти (`build-channel.client.tsx`). Оттуда три закона, и каждый оплачен его же
// словами 2026-09-17 «вообще непонятно что делать… никаких признаков того, что
// токен был успешно подключён, я не увидел»:
//
//   1. ЛЕСТНИЦА, А НЕ ПОЛОТНО. Ступень открывается, когда сделана предыдущая. На
//      месте закрытой стоит серая строка, называющая, ЧТО здесь появится и ПОСЛЕ
//      ЧЕГО. Скрытая без такой строки — то же «непонятно что делать», только тише.
//   2. ОТВЕТ ВСЕГДА ВИДЕН, И У УСПЕХА ОН НАЗЫВАЕТ СЛЕДУЮЩИЙ ШАГ. Молчаливый успех
//      неотличим от молчаливого отказа.
//   3. СЕКРЕТ УХОДИТ И НЕ ВОЗВРАЩАЕТСЯ. Сюда приходит только «настроен» и хвост.
//
// 🔒 СОСТОЯНИЕ СПРАШИВАЕТСЯ У УЗЛА, А НЕ ПОМНИТСЯ ЗДЕСЬ. Островок, который сам
// решает, «докуда дошёл человек», врёт при открытии с другого устройства. Отсюда
// разделение: что СДЕЛАНО — говорит дверь; что человек ПРОСМОТРЕЛ — местное дело
// экрана, и оно не выдаётся за сделанное.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// 🔒 ПОДСКАЗКА ПЕРВОЙ СТУПЕНИ — ИМЕНА И АДРЕСА, И БОЛЬШЕ НИЧЕГО (слово владельца
// 2026-09-21: «дадим подсказку пользователю по регистрации домена, покажем
// несколько популярных ссылок»).
//
// 🛑 ЦЕН И СРАВНЕНИЙ ЗДЕСЬ НЕТ НАМЕРЕННО. Цена домена зависит от зоны и меняется
// у каждого регистратора; вписанная в код, она устаревает молча и врёт человеку
// ровно в тот момент, когда он собрался платить. Имя и адрес не устаревают.
//
// 🔒 CLOUDFLARE СТОИТ ОТДЕЛЬНО, И ЭТО НЕ РЕКЛАМА, А КОРОТКИЙ ПУТЬ. Домен, купленный
// у них, сразу на их серверах имён (проверено по их документации 2026-09-21) —
// значит ступени 2 и 3 отпадают целиком. Человеку это стоит сказать ДО того, как
// он купит домен в другом месте и пойдёт менять серверы имён руками.
const REGISTRARS = [
  { name: "Porkbun", href: "https://porkbun.com" },
  { name: "Namecheap", href: "https://www.namecheap.com" },
  { name: "GoDaddy", href: "https://www.godaddy.com" },
  { name: "one.com", href: "https://www.one.com" },
  { name: "Gandi", href: "https://www.gandi.net" },
] as const

const CLOUDFLARE_REGISTRAR = "https://www.cloudflare.com/products/registrar/"

// 🔒 Панель Cloudflare — один адрес на две ступени: вторая заводит там зону,
// четвёртая создаёт там же токен. Второй копии адреса не заводим.
const CLOUDFLARE_DASH = "https://dash.cloudflare.com/"

type State = {
  wanted: string | null
  nsVerifiedAt: string | null
  keyConfigured: boolean
  keyTail: string | null
  zone: string | null
  hostname: string | null
  nodeUrl: string | null
  quickTunnel: string | null
}

function Step({ children, done, n, title }: { children: ReactNode; done?: boolean; n: number; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-step={n}>
      <H3 className="mb-2 flex items-center gap-2" variant="ui">
        <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check className="size-3.5" aria-hidden /> : n}
        </span>
        {title}
      </H3>
      {children}
    </section>
  )
}

/** Серая строка на месте закрытой ступени: что здесь появится и после чего. */
function Locked({ n, text }: { n: number; text: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-border border-dashed px-4 py-3 text-muted-foreground text-sm" data-step-locked={n}>
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      {text}
    </p>
  )
}

export function DomainLadder({ lang, words }: { lang: string; words: DomainLadderWords }) {
  const [state, setState] = useState<State | null>(null)
  const [token, setToken] = useState("")
  const [busy, setBusy] = useState(false)
  // 🔒 ОТВЕТ ДВЕРИ ЖИВЁТ НА ЭКРАНЕ, А НЕ МЕЛЬКАЕТ. Закон образца: молчаливый
  // успех неотличим от молчаливого отказа, и у успеха обязан быть назван
  // СЛЕДУЮЩИЙ шаг — иначе человек не знает, куда смотреть дальше.
  const [answer, setAnswer] = useState<{ ok: boolean; text: string; zones?: string[] } | null>(null)
  const [busy5, setBusy5] = useState(false)
  const [answer5, setAnswer5] = useState<{ ok: boolean; text: string } | null>(null)
  // 🔒 ОГРАНИЧЕНИЯ СВЁРНУТЫ, НО НЕ СПРЯТАНЫ. Развёрнутые, они забивают первую
  // ступень пятью абзацами и человек перестаёт видеть, что вообще надо сделать.
  // Спрятанные совсем — мы бы посоветовали короткий путь, умолчав о его цене.
  const [cfLimits, setCfLimits] = useState(false)
  // 🔒 КАРТОЧКА РЕГИСТРАТОРОВ СВЁРНУТА (слово владельца 2026-09-21). У человека,
  // у которого домен УЖЕ есть, она занимает половину первой ступени и отвечает
  // на вопрос, которого он не задавал.
  const [registrars, setRegistrars] = useState(false)
  // 🔒 СВЁРНУТО ПО ТОЙ ЖЕ ПРИЧИНЕ, ЧТО И РЕГИСТРАТОРЫ: человек, у которого токен
  // уже есть, не должен продираться через инструкцию его создания.
  const [tokenHow, setTokenHow] = useState(false)
  // 🔒 ПРЕДУПРЕЖДАЕМ ДО ВВОДА, А НЕ ПОСЛЕ ОТКАЗА. ✗ оплачено 2026-09-21: владелец
  // сидел за этим самым компьютером, вставил токен и получил «это можно сделать
  // только на том компьютере, где работает узел» — неправду. Он смотрел сайт по
  // публичному адресу туннеля. Поле, которое заведомо откажет, показывать нельзя:
  // человек тратит действие и получает неверное объяснение.
  const [onTemporary, setOnTemporary] = useState(false)
  useEffect(() => {
    setOnTemporary(isTemporaryHostname(window.location.hostname))
  }, [])
  const [wanted, setWanted] = useState("")
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<{ ok: boolean; text: string } | null>(null)
  const [nsAnswer, setNsAnswer] = useState<{ kind: "ok" | "foreign" | "unknown" | "fail"; text: string; ns?: string[] } | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/domain/state`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setState(d as State) })
      .catch(() => { if (alive) setState(null) })
    return () => { alive = false }
  }, [])

  if (!state) return <p className="text-muted-foreground text-sm">{words.loading}</p>

  // 🔒 ЧТО СДЕЛАНО — ВЫВОДИТСЯ ИЗ ИЗМЕРЕНИЙ, А НЕ ИЗ САМООТЧЁТА (переделано
  // 2026-09-21 по слову владельца). Ступень 1 закрыта, когда человек назвал имя;
  // 2 и 3 — когда серверы имён домена ДЕЙСТВИТЕЛЬНО указывают на Cloudflare. Это
  // видно публично, без единого ключа, поэтому спрашивать незачем.
  //
  // 🛑 КНОПКА «Я ЭТО СДЕЛАЛ» УБРАНА НАМЕРЕННО: человек отмечал шаг, дальше ничего
  // не работало, и причина была не названа нигде. Самоотчёт там, где есть
  // измерение, — уступка, за которую платит он, а не мы.
  const named = !!state.wanted
  const nsDone = !!state.nsVerifiedAt || nsAnswer?.kind === "ok"
  const outside = state.keyConfigured || nsDone ? 3 : named ? 1 : 0
  const domainName = state.wanted ?? wanted.trim()

  /** Перевод причины отказа в человеческие слова. Голый код беды — тот же тупик. */
  const reasonText = (reason: string): string => {
    if (reason === "empty") return words.reasonEmpty
    if (reason === "no-zones") return words.reasonNoZones
    if (reason === "not-owner") return words.reasonNotOwner
    if (reason.startsWith("network:")) return words.reasonNetwork
    if (reason.startsWith("token-")) return words.reasonToken
    // Слова самого Cloudflare передаются как есть: они точнее нашего пересказа.
    if (reason.startsWith("cloudflare:")) return `${words.keyRejected} ${reason.slice("cloudflare:".length)}`
    return words.keyRejected
  }

  async function sendKey() {
    if (busy) return
    setBusy(true)
    setAnswer(null)
    try {
      const res = await fetch(`${BASE}/api/domain/key`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = (await res.json()) as { ok?: boolean; reason?: string; keyTail?: string; zones?: Array<{ name: string }> }
      // 🛑 ПОЛЕ ОЧИЩАЕТСЯ В ЛЮБОМ ИСХОДЕ. Токен, оставшийся на экране после
      // отправки, виден каждому, кто подойдёт к компьютеру.
      setToken("")
      if (data.ok) {
        setAnswer({ ok: true, text: `${words.keyAccepted} ${words.keyNextStep}`, zones: (data.zones ?? []).map((z) => z.name) })
        setState((prev) => (prev ? { ...prev, keyConfigured: true, keyTail: data.keyTail ?? null } : prev))
      } else {
        setAnswer({ ok: false, text: reasonText(data.reason ?? "") })
      }
    } catch {
      setAnswer({ ok: false, text: words.reasonNetwork })
    } finally {
      setBusy(false)
    }
  }

  /**
   * Запомнить имя домена. Это ВСЁ, что делает первая ступень.
   *
   * 🔒 ПРОВЕРКИ ЗДЕСЬ НЕТ НАМЕРЕННО (слово владельца 2026-09-21). Привязка к
   * Cloudflare появляется только после третьего шага; спрашивать о ней на первом
   * значит показывать человеку отказ за работу, которую он ещё не начинал.
   */
  async function saveName(name: string) {
    if (saving || !name.trim()) return
    setSaving(true)
    setSaved(null)
    try {
      const res = await fetch(`${BASE}/api/domain/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hostname: name, verify: false }),
      })
      const d = (await res.json()) as { ok?: boolean; reason?: string; hostname?: string }
      if (d.ok) {
        setSaved({ ok: true, text: words.domainSaved })
        setState((prev) => (prev ? { ...prev, wanted: d.hostname ?? name } : prev))
      } else {
        setSaved({ ok: false, text: d.reason === "bad-hostname" ? words.reasonBadHostname : words.reasonNetwork })
      }
    } catch {
      setSaved({ ok: false, text: words.reasonNetwork })
    } finally {
      setSaving(false)
    }
  }

  /**
   * Спросить интернет, куда сейчас указывает домен.
   *
   * 🔒 ЭТО ИЗМЕРЕНИЕ, А НЕ САМООТЧЁТ. Прежде здесь стояла кнопка «Я это сделал»,
   * и человек отмечал шаг сам — а дальше всё молча не работало. Серверы имён
   * публичны, значит спросить можно, и спрашивать надо.
   */
  async function checkNs(name: string) {
    if (checking || !name.trim()) return
    setChecking(true)
    setNsAnswer(null)
    try {
      const res = await fetch(`${BASE}/api/domain/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hostname: name }),
      })
      const d = (await res.json()) as {
        ok?: boolean; reason?: string; onCloudflare?: boolean; unknown?: boolean; nameservers?: string[]
      }
      if (!d.ok) {
        setNsAnswer({ kind: "fail", text: d.reason === "bad-hostname" ? words.reasonBadHostname : words.reasonNetwork })
      } else if (d.onCloudflare) {
        setNsAnswer({ kind: "ok", text: words.nsOk })
        setState((prev) => (prev ? { ...prev, wanted: name, nsVerifiedAt: new Date().toISOString() } : prev))
      } else if (d.unknown) {
        setNsAnswer({ kind: "unknown", text: words.nsUnknown })
        setState((prev) => (prev ? { ...prev, wanted: name } : prev))
      } else {
        setNsAnswer({ kind: "foreign", text: words.nsForeign, ns: d.nameservers })
        setState((prev) => (prev ? { ...prev, wanted: name } : prev))
      }
    } catch {
      setNsAnswer({ kind: "fail", text: words.reasonNetwork })
    } finally {
      setChecking(false)
    }
  }

  const reason5 = (reason: string): string => {
    if (reason === "zone-not-found") return words.reasonZoneNotFound
    if (reason.startsWith("zone-")) return words.reasonZoneInactive
    if (reason === "bad-hostname") return words.reasonBadHostname
    if (reason === "no-key") return words.reasonNoKey
    if (reason === "not-owner") return words.reasonNotOwner
    if (reason.startsWith("network:")) return words.reasonNetwork
    if (reason.startsWith("cloudflare:")) return reason.slice("cloudflare:".length)
    return reason
  }

  async function activate() {
    if (busy5 || !domainName) return
    setBusy5(true)
    setAnswer5(null)
    try {
      const res = await fetch(`${BASE}/api/domain/activate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hostname: domainName }),
      })
      const data = (await res.json()) as { ok?: boolean; reason?: string; hostname?: string }
      if (data.ok) {
        setAnswer5({ ok: true, text: `${words.activated} ${words.activatedNext}` })
        setState((prev) => (prev ? { ...prev, hostname: data.hostname ?? domainName } : prev))
      } else {
        setAnswer5({ ok: false, text: reason5(data.reason ?? "") })
      }
    } catch {
      setAnswer5({ ok: false, text: words.reasonNetwork })
    } finally {
      setBusy5(false)
    }
  }

  // 🔒 ДЕЙСТВИЯ НУМЕРОВАННЫМ СПИСКОМ, А НЕ ПРОЗОЙ. ✗ оплачено словами владельца
  // 2026-09-21 о прежнем тексте: «здесь совершенно непонятно что нужно делать».
  // Абзац описывает, что произойдёт; список говорит, что нажать. Человек у чужой
  // панели читает не для понимания, а для исполнения.
  //
  // 🔒 СТУПЕНИ 2 И 3 СВЯЗАНЫ ЯВНО: вторая кончается «скопируйте оба имени»,
  // третья начинается «вставьте те два имени с шага 2». Два шага, между которыми
  // человек должен сам догадаться перенести данные, — это разорванная цепочка.
  const manual: Array<{ n: number; title: string; text: string; steps?: string[]; tail?: string }> = [
    { n: 1, title: words.step1Title, text: words.step1Text },
    { n: 2, title: words.step2Title, text: words.step2Text, steps: words.step2Steps, tail: words.step2Take },
    { n: 3, title: words.step3Title, text: words.step3Text, steps: words.step3Steps, tail: words.step3Wait },
  ]

  return (
    <div className="my-6 flex flex-col gap-3" data-domain-ladder>
      <p className="text-muted-foreground text-sm">{words.lead}</p>

      {manual.map((s) => (
        <Step key={s.n} n={s.n} title={s.title} done={outside >= s.n}>
          <p className="text-muted-foreground text-sm">{s.text}</p>
          {s.steps ? (
            <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm" data-actions={s.n}>
              {s.steps.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          ) : null}
          {s.tail ? <Small className="mt-2 block text-muted-foreground">{s.tail}</Small> : null}
          {s.n === 1 ? (
            <div className="mt-3 flex flex-col gap-2" data-domain-form>
              <Small className="text-muted-foreground">{words.domainLabel}</Small>
              <div className="flex flex-wrap gap-2">
                <input
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                  onChange={(e) => setWanted(e.target.value)}
                  placeholder={words.hostPlaceholder}
                  type="text"
                  value={state.wanted && !wanted ? state.wanted : wanted}
                />
                <Button className="h-[38px]" disabled={saving || !(wanted.trim() || state.wanted)} onClick={() => saveName(wanted.trim() || (state.wanted ?? ""))} size="sm">
                  {saving ? words.saving : words.domainSave}
                </Button>
              </div>
              {saved ? (
                <p
                  className={`rounded-md border px-3 py-2 text-sm ${saved.ok ? "border-primary/40 bg-primary/5 text-foreground" : "border-border bg-muted/40 text-foreground"}`}
                  data-saved={saved.ok ? "ok" : "fail"}
                >
                  {saved.text}
                </p>
              ) : null}
            </div>
          ) : null}
          {s.n === 1 ? (
            <div className="mt-3 rounded-md border border-border bg-muted/40 p-3" data-registrars>
              <button
                aria-expanded={registrars}
                className="flex w-full items-center justify-between gap-2 text-left"
                onClick={() => setRegistrars((v) => !v)}
                type="button"
              >
                <Small className="font-semibold text-foreground">{words.registrarsTitle}</Small>
                <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${registrars ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {registrars ? (<>
              <p className="mt-1 text-muted-foreground text-sm">
                <a className="underline" href={CLOUDFLARE_REGISTRAR} rel="noreferrer noopener" target="_blank">Cloudflare Registrar</a>
                {" — "}{words.registrarCloudflare}
              </p>
              <div className="mt-2 flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2" data-fast-path>
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <p className="text-foreground text-sm">
                  <span className="font-semibold">{words.fastPath}</span>{" "}{words.fastPathSaving}
                </p>
              </div>
              <button
                aria-expanded={cfLimits}
                className="mt-2 inline-flex items-center gap-1.5 text-left text-foreground text-sm underline"
                onClick={() => setCfLimits((v) => !v)}
                type="button"
              >
                <CircleAlert className="size-4 shrink-0 text-primary" aria-hidden />
                {words.cfLimitsToggle}
              </button>
              {cfLimits ? (
                <div className="mt-2 rounded-md border border-border bg-muted/40 p-3" data-cf-limits>
                  <p className="text-foreground text-sm">{words.cfLimitsLead}</p>
                  <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
                    <li>{words.cfLimit1}</li>
                    <li>{words.cfLimit2}</li>
                    <li>{words.cfLimit3}</li>
                    <li>{words.cfLimit4}</li>
                    <li>{words.cfLimit5}</li>
                  </ul>
                  <Small className="mt-2 block text-muted-foreground">{words.cfLimitsSource}</Small>
                </div>
              ) : null}
              <p className="mt-2 text-muted-foreground text-sm">{words.registrarOthers}</p>
              <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                {REGISTRARS.map((r) => (
                  <li key={r.name}>
                    <a className="inline-flex items-center gap-1 text-sm underline" href={r.href} rel="noreferrer noopener" target="_blank">
                      {r.name}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
              <Small className="mt-2 block text-muted-foreground">{words.registrarPriceNote}</Small>
              </>) : null}
            </div>
          ) : null}
          {s.n === 2 ? (
            <p className="mt-2">
              <a className="inline-flex items-center gap-1 text-sm underline" href={CLOUDFLARE_DASH} rel="noreferrer noopener" target="_blank">
                {words.dashOpen}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </p>
          ) : null}
          {s.n === 3 && domainName ? (
            <div className="mt-3 flex flex-col gap-2" data-ns-check>
              <Button className="w-fit" disabled={checking} onClick={() => checkNs(domainName)} size="sm" variant="outline">
                {checking ? words.checking : words.checkNs}
              </Button>
              {nsAnswer ? (
                <p
                  className={`rounded-md border px-3 py-2 text-sm ${nsAnswer.kind === "ok" ? "border-primary/40 bg-primary/5 text-foreground" : "border-border bg-muted/40 text-foreground"}`}
                  data-ns-answer={nsAnswer.kind}
                >
                  {nsAnswer.text}
                  {nsAnswer.ns?.length ? (
                    <span className="mt-1 block font-mono text-muted-foreground text-xs">
                      {words.nsCurrent}: {nsAnswer.ns.join(", ")}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>
          ) : null}
        </Step>
      ))}

      {outside >= 3 ? (
        <Step n={4} title={words.step4Title} done={state.keyConfigured}>
          <p className="text-muted-foreground text-sm">{state.keyConfigured ? `${words.keyConfigured} · ····${state.keyTail}` : words.step4Text}</p>
          {!state.keyConfigured && onTemporary ? (
            <div className="mt-3 flex gap-2 rounded-md border border-warning/50 bg-warning/10 px-3 py-2" data-key-blocked>
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="text-foreground text-sm">{words.reasonTemporary}</p>
                {state.nodeUrl ? (
                  <a className="mt-1 inline-flex items-center gap-1 font-mono text-sm underline" href={`${state.nodeUrl}/${lang}/architect/hosting/domain`}>
                    {words.openLocally}: {state.nodeUrl}
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
          {!state.keyConfigured && !onTemporary ? (
            <div className="mt-3 flex flex-col gap-2" data-key-form>
              <Small className="text-muted-foreground">{words.keyHelp}</Small>
              <a className="inline-flex w-fit items-center gap-1 text-sm underline" href={CLOUDFLARE_DASH} rel="noreferrer noopener" target="_blank">
                {words.dashOpen}
                <ExternalLink className="size-3" aria-hidden />
              </a>
              <div className="rounded-md border border-border bg-muted/40 p-3" data-token-how>
                <button
                  aria-expanded={tokenHow}
                  className="flex w-full items-center justify-between gap-2 text-left"
                  onClick={() => setTokenHow((v) => !v)}
                  type="button"
                >
                  <Small className="font-semibold text-foreground">{words.tokenHowToggle}</Small>
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${tokenHow ? "rotate-180" : ""}`} aria-hidden />
                </button>
                {tokenHow ? (
                  <>
                    <ol className="mt-2 flex list-decimal flex-col gap-1 pl-5 text-foreground text-sm">
                      {words.tokenHowSteps.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ol>
                    <Small className="mt-3 block font-semibold text-foreground">{words.tokenPermsTitle}</Small>
                    {/* 🛑 Таблица в своей прокрутке: на телефоне три столбца шире экрана,
                        а страница целиком горизонтально ездить не должна. */}
                    <div className="mt-1 overflow-x-auto">
                      <table className="w-full min-w-[20rem] border-collapse text-sm">
                        <thead>
                          <tr>
                            {words.tokenPermsHead.map((h) => (
                              <th className="border border-border bg-muted px-2 py-1 text-left font-semibold" key={h} scope="col">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {words.tokenPermsRows.map((row) => (
                            <tr key={row.join("-")}>
                              {row.map((cell) => (
                                <td className="border border-border px-2 py-1 font-mono" key={cell}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted-foreground text-sm">
                      {words.tokenPermsWhy.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <ul className="mt-3 flex list-disc flex-col gap-1 pl-5 text-foreground text-sm">
                      {words.tokenTail.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={words.keyPlaceholder}
                  type="password"
                  value={token}
                />
                <Button className="h-[38px]" disabled={busy || !token.trim()} onClick={sendKey} size="sm">
                  {busy ? words.keySaving : words.keySave}
                </Button>
              </div>
            </div>
          ) : null}
          {answer ? (
            <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${answer.ok ? "border-primary/40 bg-primary/5 text-foreground" : "border-destructive/40 bg-destructive/5 text-foreground"}`} data-key-answer={answer.ok ? "ok" : "fail"}>
              {answer.text}
            </p>
          ) : null}
          {answer?.zones?.length ? (
            <p className="mt-2 text-muted-foreground text-xs">
              {words.zonesFound}: <span className="font-mono">{answer.zones.join(", ")}</span>
            </p>
          ) : null}
        </Step>
      ) : (
        <Locked n={4} text={words.locked4} />
      )}

      {state.keyConfigured ? (
        <Step n={5} title={words.step5Title} done={!!state.hostname}>
          <p className="text-muted-foreground text-sm">{state.hostname ?? words.step5Text}</p>
          {/* 🛑 ВТОРОГО ПОЛЯ ЗДЕСЬ НЕТ, И ЭТО ИСПРАВЛЕНИЕ, А НЕ УПРОЩЕНИЕ. ✗ оплачено
              словами владельца 2026-09-21: «говоришь, здесь ничего заполнять не надо —
              и тут же заполни это поле». Имя домена он назвал на ПЕРВОЙ ступени;
              спрашивать его снова значит либо не помнить сказанного, либо готовиться
              принять два разных имени. Лестница помнит. */}
          {!state.hostname ? (
            <div className="mt-3 flex flex-col gap-2" data-host-form>
              {domainName ? (
                <>
                  <Button className="w-fit" disabled={busy5} onClick={activate} size="sm">
                    {busy5 ? words.activating : `${words.activateFor}: ${domainName}`}
                  </Button>
                </>
              ) : (
                <Small className="text-muted-foreground">{words.noNameYet}</Small>
              )}
            </div>
          ) : null}
          {answer5 ? (
            <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${answer5.ok ? "border-primary/40 bg-primary/5 text-foreground" : "border-destructive/40 bg-destructive/5 text-foreground"}`} data-host-answer={answer5.ok ? "ok" : "fail"}>
              {answer5.text}
            </p>
          ) : null}
        </Step>
      ) : (
        <Locked n={5} text={words.locked5} />
      )}

      <dl className="mt-1 grid gap-1 text-muted-foreground text-xs">
        {state.nodeUrl ? (
          <div className="flex gap-2"><dt>{words.nodeAddress}:</dt><dd className="font-mono">{state.nodeUrl}</dd></div>
        ) : null}
        {/* 🔒 ПОДКЛЮЧЁННЫЙ ДОМЕН СТАНОВИТСЯ ГЛАВНЫМ АДРЕСОМ, А ВРЕМЕННЫЙ — СНОСКОЙ.
            ✗ оплачено 2026-09-21: домен уже отвечал, а внизу по-прежнему висело
            «сейчас работает временный адрес» — человек читал это как «ничего не
            получилось». Подпись обязана меняться вместе с тем, что она описывает. */}
        {state.hostname ? (
          <div className="flex gap-2">
            <dt className="font-semibold text-foreground">{words.liveAddress}:</dt>
            <dd>
              <a className="inline-flex items-center gap-1 font-semibold text-foreground underline" href={`https://${state.hostname}`} rel="noreferrer noopener" target="_blank">
                https://{state.hostname}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </dd>
          </div>
        ) : null}
        {state.quickTunnel ? (
          <div className="flex gap-2">
            <dt>{state.hostname ? words.quickRetired : `${words.quickAddress}:`}</dt>
            {state.hostname ? null : (
              <dd><a className="inline-flex items-center gap-1 underline" href={state.quickTunnel} rel="noreferrer noopener" target="_blank">{state.quickTunnel}<ExternalLink className="size-3" aria-hidden /></a></dd>
            )}
          </div>
        ) : null}
      </dl>
    </div>
  )
}
