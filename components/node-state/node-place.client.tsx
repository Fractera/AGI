"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Small } from "@/components/ui/typography"
import type { NodePlaceWords } from "@/components/node-state/node-place.i18n"

// ЭКРАН ОБЪЯВЛЕНИЯ: ГДЕ СТОИТ УЗЕЛ (276-3).
//
// 🔒 ОСТРОВОК, А НЕ ФОРМА НА СЕРВЕРЕ: страница предрендерена, и выбранное значение застыло бы в HTML.
// 🔒 ЧЕТЫРЕ СОСТОЯНИЯ: спрашиваю · знаю · сохраняю · дверь не ответила. Последнее значит «не знаю».
// 🛑 ЗДЕСЬ ЖЕ СКАЗАНО ВСЛУХ, ЧТО ОТВЕТ НЕ ПРОВЕРЯЕТСЯ. Человек вправе знать, что узел верит ему на
// слово и не может проверить: иначе он прочитает свою же строку в индикаторе как измеренный факт.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Kind = "home" | "server" | "unknown"
type Answer = { ok?: boolean; place?: { kind?: Kind; changedAt?: string | null } }
type State = "asking" | "known" | "saving" | "unknown"

export function NodePlace({ lang, words }: { lang: string; words: NodePlaceWords }) {
  const [state, setState] = useState<State>("asking")
  const [kind, setKind] = useState<Kind>("unknown")
  const [changedAt, setChangedAt] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/node/place`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Answer>) : Promise.reject(new Error(String(r.status)))))
      .then((a) => {
        if (!alive) return
        setKind(a.place?.kind ?? "unknown")
        setChangedAt(a.place?.changedAt ?? null)
        setState("known")
      })
      .catch(() => alive && setState("unknown"))
    return () => {
      alive = false
    }
  }, [])

  async function choose(value: "home" | "server") {
    setState("saving")
    try {
      const res = await fetch(`${BASE}/api/node/place`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ place: value }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const a = (await res.json()) as Answer
      setKind(a.place?.kind ?? value)
      setChangedAt(a.place?.changedAt ?? null)
      setState("known")
    } catch {
      setState("unknown")
    }
  }

  if (state === "asking") {
    return (
      <div className="my-6" data-node-place="asking">
        <p className="text-muted-foreground text-sm">{words.loading}</p>
      </div>
    )
  }

  if (state === "unknown") {
    return (
      <div className="my-6" data-node-place="unknown">
        <p className="text-foreground text-sm">{words.doorSilent}</p>
      </div>
    )
  }

  const at = (() => {
    if (!changedAt) return ""
    try {
      return new Date(changedAt).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB")
    } catch {
      return ""
    }
  })()

  const current =
    kind === "home" ? words.currentHome : kind === "server" ? words.currentServer : words.currentUnknown

  return (
    <div className="my-6 flex flex-col gap-3" data-node-place={kind} data-state={state}>
      <p className="text-foreground text-sm font-medium">{words.title}</p>
      <p className="text-foreground text-sm">{current}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant={kind === "home" ? "default" : "outline"} disabled={state === "saving"} onClick={() => choose("home")}>
          {words.chooseHome}
        </Button>
        <Button variant={kind === "server" ? "default" : "outline"} disabled={state === "saving"} onClick={() => choose("server")}>
          {words.chooseServer}
        </Button>
      </div>
      <Small className="text-muted-foreground">
        {words.note}
        {at ? ` · ${words.changedAt.replace("{at}", at)}` : ""}
      </Small>
    </div>
  )
}
