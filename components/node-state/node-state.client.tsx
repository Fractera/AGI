"use client"

import { useEffect, useState } from "react"
import { Small } from "@/components/ui/typography"
import type { NodeStateWords } from "@/components/node-state/node-state.i18n"

// ОСТРОВОК СОСТОЯНИЯ УЗЛА (276-2).
//
// 🔒 ПОЧЕМУ ЭТО ОСТРОВОК, А НЕ СЕРВЕРНАЯ СТРОКА. Главная страница слоя предрендерена. Серверный
// компонент измерил бы адрес НА СБОРКЕ, и утверждение «ваш сайт виден в интернете» застыло бы в HTML
// навсегда — оно продолжало бы висеть в день, когда домен уехал или туннель умер. Тот же класс, что
// и запечённый порт в 264, только дороже: там врало число, здесь врал бы вывод.
//
// 🔒 ТРИ СОСТОЯНИЯ ОСТРОВКА, И НИ ОДНО НЕ ПОДМЕНЯЕТСЯ УМОЛЧАНИЕМ: «спрашиваю» · «знаю» · «дверь не
// ответила». Последнее значит «не знаю», а не «ничего не настроено»: ворота закрывают `/api/*` тому,
// кто не вошёл, и 401 здесь — про права, а не про узел.
//
// 🛑 ИЗМЕРЕННОЕ И ОБЪЯВЛЕННОЕ ПОМЕЧЕНЫ ПО-РАЗНОМУ И ВЫГЛЯДЯТ ПО-РАЗНОМУ. Индикатор, показывающий
// объявленное с той же уверенностью, что и измеренное, — прибор, который врёт видом.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Answer = {
  ok?: boolean
  reach?: { kind: string; host: string | null; ours: boolean | null; detail: string; checkedAt: string }
  place?: { kind: string; source: string }
  isolation?: { kind: string; detail: string }
}

type State = "asking" | "known" | "unknown"

function Row({
  title,
  text,
  mark,
  tone,
  extra,
}: {
  title: string
  text: string
  mark: string
  tone: "ok" | "warn" | "soft"
  extra?: React.ReactNode
}) {
  // Цвет несёт тот же смысл, что и слова, и никогда не несёт смысла вместо них.
  const bar =
    tone === "ok" ? "border-l-primary" : tone === "warn" ? "border-l-destructive" : "border-l-border"
  return (
    <div className={`border-l-2 pl-4 ${bar}`}>
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-foreground text-sm">{text}</p>
      <Small className="text-muted-foreground">
        {mark}
        {extra ? <> · {extra}</> : null}
      </Small>
    </div>
  )
}

export function NodeStateIndicator({ lang, words }: { lang: string; words: NodeStateWords }) {
  const [state, setState] = useState<State>("asking")
  const [data, setData] = useState<Answer | null>(null)

  useEffect(() => {
    let alive = true
    // `no-store`: ответ о состоянии кэшировать нельзя по той же причине, по которой его нельзя запекать.
    fetch(`${BASE}/api/node/state`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Answer>) : Promise.reject(new Error(String(r.status)))))
      .then((answer) => {
        if (!alive) return
        setData(answer)
        setState("known")
      })
      .catch(() => alive && setState("unknown"))
    return () => {
      alive = false
    }
  }, [])

  if (state === "asking") {
    return (
      <div className="my-6" data-node-state="asking">
        <p className="text-muted-foreground text-sm">{words.loading}</p>
      </div>
    )
  }

  if (state === "unknown" || !data?.reach) {
    return (
      <div className="my-6" data-node-state="unknown">
        <p className="text-foreground text-sm">{words.unknown}</p>
      </div>
    )
  }

  const reach = data.reach
  const host = reach.host ?? "—"
  const reachLine =
    reach.kind === "own-domain"
      ? reach.ours === true
        ? { text: words.reachOwnDomain.replace("{host}", host), tone: "ok" as const }
        : reach.ours === false
          ? { text: words.reachOwnDomainForeign.replace("{host}", host), tone: "warn" as const }
          : { text: words.reachOwnDomainSilent.replace("{host}", host), tone: "warn" as const }
      : reach.kind === "temporary"
        ? reach.ours === true
          ? { text: words.reachTemporary.replace("{host}", host), tone: "soft" as const }
          : { text: words.reachTemporaryBroken, tone: "warn" as const }
        : { text: words.reachLocalOnly, tone: "soft" as const }

  const place = data.place?.kind
  const placeLine =
    place === "home" ? words.placeHome : place === "server" ? words.placeServer : words.placeUnknown

  const isolation = data.isolation?.kind === "container" ? words.isolationContainer : words.isolationNone

  // Время замера показывается рядом с измеренным — чтобы «сейчас» имело адресата во времени.
  const at = (() => {
    try {
      return new Date(reach.checkedAt).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB")
    } catch {
      return ""
    }
  })()

  return (
    <div className="my-6 flex flex-col gap-4" data-node-state="known" data-reach={reach.kind} data-ours={String(reach.ours)}>
      <Row title={words.reachTitle} text={reachLine.text} mark={`${words.measured}${at ? ` · ${at}` : ""}`} tone={reachLine.tone} />
      <Row
        title={words.placeTitle}
        text={placeLine}
        mark={place === "home" || place === "server" ? words.declared : words.notKnown}
        tone={place === "home" || place === "server" ? "soft" : "warn"}
        extra={
          <a className="text-primary underline decoration-primary/40 underline-offset-2" href={`/${lang}/architect/hosting/hosting`}>
            {words.placeChange}
          </a>
        }
      />
      <Row title={words.isolationTitle} text={isolation} mark={words.measured} tone={data.isolation?.kind === "container" ? "ok" : "soft"} />
      <Small className="text-muted-foreground">{words.note}</Small>
    </div>
  )
}
