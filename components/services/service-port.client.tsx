"use client"

import { useEffect, useState } from "react"
import { Small } from "@/components/ui/typography"
import type { ServicePortWords } from "@/components/services/service-port.i18n"

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

  return (
    <div className="my-6 flex flex-col gap-1" data-service-port={serviceId} data-state={state}>
      <p className="text-foreground text-sm" data-service-port-line>
        {line}
      </p>
      <Small className="text-muted-foreground">{words.note}</Small>
    </div>
  )
}
