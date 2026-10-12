"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ExternalServices } from "@/lib/a2a/element-passport"

// ВКЛАДКА «ПРОЦЕСС → ПОДПИСКИ» (шаг 463). Владелец 2026-10-12: «…внутри попадающие список и добавим первый итем это будет ai search
// machine … краткое описание сервиса … поля для ввода необходимых ключей и пример таблицы дашборд платежей. Также сделай там кнопку:
// проверить … при нажатии на эту кнопку показывать текущее состояние в таблице истории платежей. Но так как это хардкор пример то мы
// вообще ничего не реализуем по факту».
// Данные — `OWN-SERVICE-PROPS/SUBSCRIPTIONS.json` элемента (lib/a2a/element-passport.ts). Ядро рисует, элемент описывает (навык
// элемента `connect-external-service`). 🔒 Сегодня ничего не сохраняется и не вызывается: поля ключей — для вида, «Проверить» у
// примера показывает строки примера, у настоящего сервиса — честно говорит, что проверка ещё не построена. Таймеров нет.

export type SubscriptionsUi = {
  title: string
  choose: string
  example: string
  exampleNote: string
  keys: string
  keysNote: string
  check: string
  checkNotBuilt: string
  payments: string
  date: string
  description: string
  amount: string
  status: string
  docs: string
  envName: string
}

export function SubscriptionsView({ data, ui }: { data: ExternalServices; ui: SubscriptionsUi }) {
  const [id, setId] = useState(data.services[0]?.id ?? "")
  const [checked, setChecked] = useState<string | null>(null)
  const s = data.services.find((x) => x.id === id) ?? data.services[0]
  if (!s) return null
  const shown = checked === s.id

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border px-4 py-4" data-subscriptions={data.services.length}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium">{ui.title}</p>
        {data.example && <Badge variant="outline">{ui.example}</Badge>}
      </div>
      {data.example && <p className="text-xs text-muted-foreground">{ui.exampleNote}</p>}

      <Select value={s.id} onValueChange={(v) => { setId(v); setChecked(null) }}>
        <SelectTrigger className="w-full sm:w-80" aria-label={ui.choose}>
          <SelectValue placeholder={ui.choose} />
        </SelectTrigger>
        <SelectContent>
          {data.services.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-1" data-subscription={s.id}>
        <p className="text-base font-semibold">{s.name}</p>
        <p className="text-sm text-muted-foreground">{s.description}</p>
        {s.docs && <a className="w-fit text-sm underline" href={s.docs} target="_blank" rel="noreferrer">{ui.docs}</a>}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">{ui.keys}</p>
        {s.keys.map((k) => (
          <div key={k.env} className="flex flex-col gap-1.5">
            <Label htmlFor={`key-${s.id}-${k.env}`}>{k.label}</Label>
            <Input id={`key-${s.id}-${k.env}`} type={k.secret ? "password" : "text"} autoComplete="off" placeholder={k.env} />
            <p className="text-xs text-muted-foreground">{ui.envName}: <span className="font-mono">{k.env}</span></p>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">{ui.keysNote}</p>
      </div>

      <div>
        <Button type="button" variant="outline" onClick={() => setChecked(s.id)}>{ui.check}</Button>
      </div>

      {shown && (
        s.examplePayments?.length
          ? (
            <div className="flex flex-col gap-2" data-subscription-payments={s.examplePayments.length}>
              <p className="text-sm font-medium">{ui.payments}{data.example ? ` · ${ui.example}` : ""}</p>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium">{ui.date}</th>
                      <th className="px-3 py-2 font-medium">{ui.description}</th>
                      <th className="px-3 py-2 text-right font-medium">{ui.amount}</th>
                      <th className="px-3 py-2 font-medium">{ui.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.examplePayments.map((p, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2 font-mono">{p.date}</td>
                        <td className="px-3 py-2">{p.description}</td>
                        <td className="px-3 py-2 text-right font-mono">{p.amount} {p.currency}</td>
                        <td className="px-3 py-2">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
          : <p className="text-sm text-muted-foreground">{ui.checkNotBuilt}</p>
      )}
    </section>
  )
}
