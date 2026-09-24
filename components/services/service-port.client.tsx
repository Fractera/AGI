"use client"

import { useEffect, useState } from "react"
import { StarIcon } from "lucide-react"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Small } from "@/components/ui/typography"
import { cn } from "@/lib/utils"
import type { ServicePortWords } from "@/components/services/service-port.i18n"
import { ServiceReach } from "@/components/services/service-reach.client"

// ОСТРОВОК: НА КАКОМ ПОРТУ ЖИВЁТ СМЕННЫЙ БЛОК (264-1).
//
// 🔒 ПОЧЕМУ ЭТО ОСТРОВОК, А НЕ СЕРВЕРНАЯ СТРОКА. Страницы слоя предрендерены.
// Серверный компонент прочитал бы реестр НА СБОРКЕ, и число застыло бы в HTML:
// установщик уступил номер — страница продолжает печатать прежний, уверенно и
// молча. Спрошенное в браузере число всегда описывает сегодняшний узел.
//
// 🔒 ЧЕТЫРЕ СОСТОЯНИЯ, И НИ ОДНО НЕ ПОДМЕНЯЕТСЯ УМОЛЧАНИЕМ. «Спрашиваю» ·
// «порт такой-то» · «блока в узле нет» · «дверь не ответила». Закон проекта:
// уверенное умолчание дороже отсутствующего значения — человек читает
// правдоподобное число как проверенный факт и перестаёт искать.
//
// 🔒 СЛОВА ПРИХОДЯТ ПРОПСАМИ, УЖЕ ВЫБРАННЫЕ ПО ЯЗЫКУ. Словарь остаётся на сервере
// целиком — за этим следит `check:lang-delivery`.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type Entry = { id: string; port: number | null; installed: boolean }
type Answer = { ok?: boolean; services?: Entry[] }

/** Что мы узнали о блоке: ещё спрашиваем · нашли · в составе без порта · нет в составе · дверь молчит. */
type State = "asking" | "port" | "not-installed" | "absent" | "unknown"

export function ServicePort({
  serviceId,
  words,
}: {
  /** вечное имя блока в реестре узла — `auth`, `data`, и так далее */
  serviceId: string
  words: ServicePortWords
}) {
  const [state, setState] = useState<State>("asking")
  const [port, setPort] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    // `no-store`: ответ о составе узла кэшировать нельзя по той же причине, по
    // которой его нельзя запекать в сборку.
    fetch(`${BASE}/api/services`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Answer>) : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!alive) return
        const found = data.services?.find((s) => s.id === serviceId)
        if (!found) return setState("absent")
        if (!found.installed || typeof found.port !== "number") return setState("not-installed")
        setPort(found.port)
        setState("port")
      })
      // 🛑 ОТКАЗ ДВЕРИ НЕ ПРЕВРАЩАЕТСЯ В «НЕТ СЛУЖБЫ». Ворота закрывают `/api/*`
      // для того, кто не вошёл, и 401 здесь значит «я не знаю», а не «её нет».
      .catch(() => alive && setState("unknown"))
    return () => {
      alive = false
    }
  }, [serviceId])

  const line =
    state === "asking"
      ? words.loading
      : state === "port" && port !== null
        ? words.onPort.replace("{port}", String(port))
        : state === "not-installed"
          ? words.notInstalled
          : state === "absent"
            ? words.absent
            : words.unknown

  // 289-6 (владелец: «Оформи это красивые карточки … как индикатор на главной архитектора … очень крупные цифры … подсвечивать
  // если соединение установлено и отвечает страница … карточка в стиле Warning, у которой звёздочка не закрашена»): две
  // карточки в стиле индикатора узла — порт и адрес; всё в порядке — подсветка и закрашенная звезда, нет — предупреждение.
  const known = state === "port" && port !== null
  return (
    <div className="my-6 flex flex-col gap-3" data-service-port={serviceId} data-state={state}>
      <div className="grid gap-3 md:grid-cols-2">
        <Card size="sm" data-active={String(known)} className={cn(known ? "bg-primary/10 ring-primary/40" : "bg-destructive/10 ring-destructive/40")}>
          <CardHeader>
            <CardTitle className="font-semibold">{words.portTitle}</CardTitle>
            <CardAction>
              <StarIcon role="img" aria-hidden className={cn("size-5", known ? "fill-primary text-primary" : "text-destructive")} />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {known ? (
              <p className="font-mono text-5xl font-black tracking-tight tabular-nums text-foreground" data-service-port-number>
                {port}
              </p>
            ) : null}
            <p className="text-foreground text-sm" data-service-port-line>
              {line}
            </p>
          </CardContent>
        </Card>
        {/* 289-3: адрес службы в интернете — режим, состояние, «Проверить подключение», «Подключить». */}
        <ServiceReach serviceId={serviceId} words={words.reach} />
      </div>
      <Small className="text-muted-foreground">{words.note}</Small>
    </div>
  )
}
