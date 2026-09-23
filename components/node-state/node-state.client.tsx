"use client"

import { useCallback, useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { NodeStateWords } from "@/components/node-state/node-state.i18n"

// ОСТРОВОК СОСТОЯНИЯ УЗЛА (276-2; карточки со звездой и «Проверить сейчас» — 276-5).
//
// 🎯 Слово владельца 2026-09-23: три записи — три карточки; справа звезда, заполненная, если это
// правда, и пустая, если ложь; фон зелёный у правды и прозрачный у лжи; кнопка «Проверить сейчас»
// прячет карточки, крутит загрузку и показывает новый замер.
//
// 🔒 ПОЧЕМУ ЭТО ОСТРОВОК, А НЕ СЕРВЕРНАЯ СТРОКА. Главная страница слоя предрендерена. Серверный
// компонент измерил бы адрес НА СБОРКЕ, и утверждение «ваш сайт виден в интернете» застыло бы в HTML
// навсегда. Тот же класс, что и запечённый порт в 264, только дороже: там врало число, здесь вывод.
//
// 🔒 ПРАВДА У КАЖДОЙ КАРТОЧКИ ОДНА И НАЗВАНА ЗДЕСЬ: «как добираются» — адрес отвечает ЭТИМ узлом;
// «где стоит» — место сказано узлу (измерить его нечем, поэтому правда здесь — «известно»); «стена» —
// узел в контейнере. Звезда и фон повторяют слова и никогда не несут смысла вместо них.
//
// 🔒 ЧЕТЫРЕ СОСТОЯНИЯ ОСТРОВКА: «спрашиваю» · «знаю» · «проверяю заново» · «дверь не ответила».
// Последнее значит «не знаю», а не «ничего не настроено»: 401 здесь — про права, а не про узел.
//
// 🛑 «Проверить сейчас» спрашивает ту же дверь, что и первый замер: выбор места в «Хостинге»
// (временный способ до автоматизации, слово владельца 2026-09-23) виден после нажатия без перезагрузки.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Answer = {
  ok?: boolean
  reach?: { kind: string; host: string | null; ours: boolean | null; detail: string; checkedAt: string }
  place?: { kind: string; source: string }
  isolation?: { kind: string; detail: string }
}

type State = "asking" | "known" | "checking" | "unknown"

function Fact({
  title,
  text,
  mark,
  truth,
  extra,
  words,
}: {
  title: string
  text: string
  mark: string
  truth: boolean
  extra?: React.ReactNode
  words: NodeStateWords
}) {
  return (
    <Card
      size="sm"
      data-truth={String(truth)}
      className={cn(truth ? "bg-primary/10 ring-primary/40" : "bg-transparent")}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <StarIcon
            role="img"
            aria-label={truth ? words.starTrue : words.starFalse}
            className={cn("size-5", truth ? "fill-primary text-primary" : "text-muted-foreground")}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <p className="text-foreground text-sm">{text}</p>
        <Small className="text-muted-foreground">
          {mark}
          {extra ? <> · {extra}</> : null}
        </Small>
      </CardContent>
    </Card>
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
      <div className="my-6 flex flex-col gap-4" data-node-state={state}>
        <div className="flex items-center gap-2">
          <Spinner />
          <p className="text-muted-foreground text-sm">{state === "asking" ? words.loading : words.checking}</p>
        </div>
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
  const reachText =
    reach.kind === "own-domain"
      ? reach.ours === true
        ? words.reachOwnDomain.replace("{host}", host)
        : reach.ours === false
          ? words.reachOwnDomainForeign.replace("{host}", host)
          : words.reachOwnDomainSilent.replace("{host}", host)
      : reach.kind === "temporary"
        ? reach.ours === true
          ? words.reachTemporary.replace("{host}", host)
          : words.reachTemporaryBroken
        : words.reachLocalOnly

  const place = data.place?.kind
  const placeKnown = place === "home" || place === "server"
  const placeText = place === "home" ? words.placeHome : place === "server" ? words.placeServer : words.placeUnknown

  const walled = data.isolation?.kind === "container"

  // Время замера показывается рядом с измеренным — чтобы «сейчас» имело адресата во времени.
  const at = (() => {
    try {
      return new Date(reach.checkedAt).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB")
    } catch {
      return ""
    }
  })()

  return (
    <div className="my-6 flex flex-col gap-3" data-node-state="known" data-reach={reach.kind} data-ours={String(reach.ours)}>
      <Fact
        words={words}
        title={words.reachTitle}
        text={reachText}
        mark={`${words.measured}${at ? ` · ${at}` : ""}`}
        truth={reach.ours === true}
      />
      <Fact
        words={words}
        title={words.placeTitle}
        text={placeText}
        mark={placeKnown ? words.declared : words.notKnown}
        truth={placeKnown}
        extra={
          <a className="text-primary underline decoration-primary/40 underline-offset-2" href={`/${lang}/architect/hosting/hosting`}>
            {words.placeChange}
          </a>
        }
      />
      <Fact
        words={words}
        title={words.isolationTitle}
        text={walled ? words.isolationContainer : words.isolationNone}
        mark={words.measured}
        truth={walled}
      />
      <div className="flex flex-wrap items-center gap-3">
        {button}
        <Small className="text-muted-foreground">{words.note}</Small>
      </div>
    </div>
  )
}
