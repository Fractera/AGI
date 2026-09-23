"use client"

import { useCallback, useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { NodeStateWords } from "@/components/node-state/node-state.i18n"

// ОСТРОВОК СОСТОЯНИЯ ПРОЕКТА (276-2; карточки и «Проверить сейчас» — 276-5; четыре + две + одна — 276-6).
//
// 🎯 Слово владельца 2026-09-23: адрес — четыре карточки (localhost · пробный домен Cloudflare ·
// IP-адрес · собственный домен), активна одна; размещение — две (локальный компьютер · выделенный
// сервер), названия очень жирные; «изоляция», а не «стена». Активная карточка — заполненная звезда и
// зелёный фон, остальные — пустая звезда и прозрачный фон.
//
// 🔒 ПОЧЕМУ ЭТО ОСТРОВОК, А НЕ СЕРВЕРНАЯ СТРОКА. Страница предрендерена: адрес, измеренный на сборке,
// застыл бы в HTML и продолжал бы говорить «сайт в интернете» после того, как домен уехал.
//
// 🔒 АКТИВНАЯ КАРТОЧКА АДРЕСА — ТА, ПО КОТОРОЙ ПРОЕКТ ОТВЕЧАЕТ САМ (сверка номера процесса и времени
// запуска в `lib/node-state/measure.ts`). Домен настроен, но отвечает не он — активен localhost, а
// карточка домена говорит, что с ним не так. IP-адрес сегодня не активен никогда: развёртывания на
// сервер ещё нет, и выдумывать его наличие прибор не должен.
//
// 🔒 ЧЕТЫРЕ СОСТОЯНИЯ ОСТРОВКА: «проверяю» · «знаю» · «проверяю заново» · «дверь не ответила».

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Answer = {
  ok?: boolean
  reach?: { kind: string; host: string | null; ours: boolean | null; detail: string; checkedAt: string }
  place?: { kind: string; source: string }
  isolation?: { kind: string; detail: string }
}

type State = "asking" | "known" | "checking" | "unknown"

function Choice({
  title,
  text,
  active,
  heavy,
  foot,
  words,
}: {
  title: string
  text: string
  active: boolean
  heavy?: boolean
  foot?: React.ReactNode
  words: NodeStateWords
}) {
  return (
    <Card
      size="sm"
      data-active={String(active)}
      className={cn(active ? "bg-primary/10 ring-primary/40" : "bg-transparent")}
    >
      <CardHeader>
        <CardTitle className={cn(heavy ? "text-base font-black" : "font-semibold")}>{title}</CardTitle>
        <CardAction>
          <StarIcon
            role="img"
            aria-label={active ? words.starTrue : words.starFalse}
            className={cn("size-5", active ? "fill-primary text-primary" : "text-muted-foreground")}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-foreground text-sm">{text}</p>
        {foot ? <Small className="text-muted-foreground">{foot}</Small> : null}
      </CardContent>
    </Card>
  )
}

function Group({ title, cols, children }: { title: string; cols: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <div className={cn("grid gap-3", cols)}>{children}</div>
    </section>
  )
}

export function NodeStateIndicator({ lang, words }: { lang: string; words: NodeStateWords }) {
  const [state, setState] = useState<State>("asking")
  const [data, setData] = useState<Answer | null>(null)

  const measure = useCallback(async () => {
    // `no-store`: ответ о состоянии кэшировать нельзя по той же причине, по которой его нельзя запекать.
    const r = await fetch(`${BASE}/api/node/state`, { cache: "no-store" })
    if (!r.ok) throw new Error(String(r.status))
    return (await r.json()) as Answer
  }, [])

  useEffect(() => {
    let alive = true
    measure()
      .then((answer) => {
        if (!alive) return
        setData(answer)
        setState("known")
      })
      .catch(() => alive && setState("unknown"))
    return () => {
      alive = false
    }
  }, [measure])

  async function checkNow() {
    setState("checking")
    try {
      setData(await measure())
      setState("known")
    } catch {
      setState("unknown")
    }
  }

  const button = (
    <Button variant="outline" size="sm" onClick={checkNow} disabled={state === "asking" || state === "checking"}>
      {words.checkNow}
    </Button>
  )

  if (state === "asking" || state === "checking") {
    return (
      <div className="my-6 flex items-center gap-2" data-node-state={state}>
        <Spinner />
        <p className="text-muted-foreground text-sm">{state === "asking" ? words.loading : words.checking}</p>
      </div>
    )
  }

  if (state === "unknown" || !data?.reach) {
    return (
      <div className="my-6 flex flex-col items-start gap-4" data-node-state="unknown">
        <p className="text-foreground text-sm">{words.unknown}</p>
        {button}
      </div>
    )
  }

  const reach = data.reach
  const host = reach.host ?? "—"
  const active =
    reach.ours !== true
      ? "localhost"
      : reach.kind === "own-domain"
        ? "own"
        : reach.kind === "temporary"
          ? "try"
          : reach.kind === "bare-ip"
            ? "ip"
            : "localhost"

  const ownText =
    reach.kind !== "own-domain"
      ? words.ownDomainText
      : reach.ours === true
        ? words.ownDomainActive.replace("{host}", host)
        : reach.ours === false
          ? words.ownDomainForeign.replace("{host}", host)
          : words.ownDomainSilent.replace("{host}", host)
  const tryText =
    reach.kind !== "temporary"
      ? words.tryDomainText
      : reach.ours === true
        ? words.tryDomainActive.replace("{host}", host)
        : words.tryDomainBroken

  const place = data.place?.kind
  const placeFoot = (
    <>
      {place === "home" || place === "server" ? words.placeFromYou : words.placeNotSet} ·{" "}
      <a className="text-primary underline decoration-primary/40 underline-offset-2" href={`/${lang}/architect/hosting/hosting`}>
        {words.placeChange}
      </a>
    </>
  )

  const walled = data.isolation?.kind === "container"

  // Время замера — чтобы «сейчас» имело адресата во времени.
  const at = (() => {
    try {
      return new Date(reach.checkedAt).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB")
    } catch {
      return ""
    }
  })()

  return (
    <div className="my-6 flex flex-col gap-5" data-node-state="known" data-reach={reach.kind} data-ours={String(reach.ours)}>
      <Group title={words.addressTitle} cols="sm:grid-cols-2 xl:grid-cols-4">
        <Choice words={words} title={words.localhost} text={words.localhostText} active={active === "localhost"} />
        <Choice words={words} title={words.tryDomain} text={tryText} active={active === "try"} />
        <Choice words={words} title={words.ip} text={words.ipText} active={active === "ip"} />
        <Choice words={words} title={words.ownDomain} text={ownText} active={active === "own"} />
      </Group>
      <Group title={words.placeTitle} cols="sm:grid-cols-2">
        <Choice words={words} heavy title={words.placeLocal} text={words.placeLocalText} active={place === "home"} foot={placeFoot} />
        <Choice words={words} heavy title={words.placeServer} text={words.placeServerText} active={place === "server"} foot={placeFoot} />
      </Group>
      <Group title={words.isolationTitle} cols="sm:grid-cols-2">
        <Choice words={words} title={words.container} text={walled ? words.containerYes : words.containerNo} active={walled} />
      </Group>
      <div className="flex flex-wrap items-center gap-3">
        {button}
        <Small className="text-muted-foreground">
          {at ? `${words.measuredAt.replace("{at}", at)} · ` : ""}
          {words.note}
        </Small>
      </div>
    </div>
  )
}
