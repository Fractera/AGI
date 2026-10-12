"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CronPlan, CronSchedule } from "@/lib/a2a/element-passport"

// КАЛЕНДАРЬ «ПРОЦЕСС → КРОН АВТОМАТИЗАЦИИ» (шаг 465). Владелец 2026-10-12: «стандартный календарь у которого слева табло которое
// переключает месяц и год с возможностью листать месяца и … года а справа … список дел которые как карточки аккордеона могут
// раскрываться закрывая другие дела. … полоски размечены по 30 минут … если несколько на одно время то они делят горизонтальный
// блок». Данные — `OWN-SERVICE-PROPS/CRON.json` элемента и его журнал `data/cron-runs.jsonl` (lib/a2a/element-passport.ts).
// 🔒 Только показ: расписание меняется разговором с агентом элемента (терминал или Telegram). Времена — местные часы компьютера
// узла. Таймеров здесь нет: календарь ничего не запускает, запускает сервер элемента.

export type CronUi = {
  lead: string
  examplesTitle: string
  examples: string[]
  paused: string
  empty: string
  repeat: Record<CronSchedule["repeat"], string>
  status: { done: string; failed: string; missed: string; paused: string; planned: string }
  event: string
  repeatLabel: string
  since: string
  until: string
  lastRun: string
  noTasks: string
  prevYear: string
  prevMonth: string
  nextMonth: string
  nextYear: string
}

type Status = keyof CronUi["status"]

const pad = (n: number) => String(n).padStart(2, "0")
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d) }

/** Бывает ли расписание в этот день (тот же расчёт, что у исполнителя элемента, lib/cron/due.ts). */
function occursOn(s: CronSchedule, day: Date): boolean {
  const key = ymd(day)
  if (key < s.start || (s.until && key > s.until)) return false
  const start = parse(s.start)
  const dow = day.getDay()
  switch (s.repeat) {
    case "once": return key === s.start
    case "daily": return true
    case "weekdays": return dow >= 1 && dow <= 5
    case "weekly": return dow === start.getDay()
    case "monthly": return day.getDate() === start.getDate()
  }
}

const slotOf = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 2 + (m >= 30 ? 1 : 0) }

export function CronCalendar({ plan, lang, ui }: { plan: CronPlan; lang: string; ui: CronUi }) {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [day, setDay] = useState(today)
  const [open, setOpen] = useState("")
  const list = useRef<HTMLDivElement>(null)

  const eventName = (id: string) => plan.events.find((e) => e.id === id)?.name ?? id
  const eventText = (id: string) => plan.events.find((e) => e.id === id)?.description ?? ""
  const runOf = (s: CronSchedule, key: string) => plan.runs.filter((r) => r.schedule === s.id && r.slot === `${key}T${s.time}`).at(-1)
  const off = (s: CronSchedule) => !s.enabled || (plan.repeatsPaused && s.repeat !== "once")

  function status(s: CronSchedule, d: Date): Status {
    const key = ymd(d)
    const run = runOf(s, key)
    if (run) return run.ok ? "done" : "failed"
    if (off(s)) return "paused"
    const [h, m] = s.time.split(":").map(Number)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m) < new Date() ? "missed" : "planned"
  }

  const tasks = plan.schedules.filter((s) => occursOn(s, day)).sort((a, b) => a.time.localeCompare(b.time))
  const bySlot = new Map<number, CronSchedule[]>()
  for (const s of tasks) bySlot.set(slotOf(s.time), [...(bySlot.get(slotOf(s.time)) ?? []), s])

  // Выбран день — список встаёт на первую задачу (без плавной прокрутки: в браузере владельца она инертна, шаг 318).
  useEffect(() => {
    const box = list.current
    const first = box?.querySelector<HTMLElement>("[data-cron-task]")
    if (box) box.scrollTop = first ? Math.max(0, (first.closest("[data-cron-slot]") as HTMLElement).offsetTop - 8) : 16 * 32
  }, [day])

  // Сетка месяца: недели с понедельника.
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]
  while (cells.length % 7) cells.push(null)
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(lang, { weekday: "short" }).format(new Date(2026, 9, 12 + i)))
  const shift = (months: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + months, 1))

  const tone: Record<Status, string> = {
    done: "border-emerald-500/60 bg-emerald-500/10",
    failed: "border-destructive/60 bg-destructive/10",
    missed: "border-amber-500/60 bg-amber-500/10",
    paused: "border-border bg-muted/40 text-muted-foreground",
    planned: "border-primary/50 bg-primary/5",
  }

  return (
    <div className="flex flex-col gap-4" data-cron-calendar={plan.schedules.length}>
      <section className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3">
        <p className="text-sm">{ui.lead}</p>
        <p className="text-xs font-medium text-muted-foreground">{ui.examplesTitle}</p>
        <ul className="ml-5 list-disc text-sm text-muted-foreground">{ui.examples.map((e) => <li key={e}>«{e}»</li>)}</ul>
      </section>
      {plan.repeatsPaused && <p className="rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm" data-cron-paused>{ui.paused}</p>}

      <div className="grid gap-4 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <section className="flex flex-col gap-2 rounded-lg border border-border p-3" data-cron-month={`${month.getFullYear()}-${pad(month.getMonth() + 1)}`}>
          <div className="flex items-center justify-between gap-1">
            <Button size="icon" variant="ghost" aria-label={ui.prevYear} onClick={() => shift(-12)}><ChevronsLeft /></Button>
            <Button size="icon" variant="ghost" aria-label={ui.prevMonth} onClick={() => shift(-1)}><ChevronLeft /></Button>
            <span className="flex-1 text-center text-sm font-medium capitalize">{new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(month)}</span>
            <Button size="icon" variant="ghost" aria-label={ui.nextMonth} onClick={() => shift(1)}><ChevronRight /></Button>
            <Button size="icon" variant="ghost" aria-label={ui.nextYear} onClick={() => shift(12)}><ChevronsRight /></Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">{weekdays.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />
              const count = plan.schedules.filter((s) => !off(s) && occursOn(s, d)).length
              const chosen = ymd(d) === ymd(day)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setDay(d); setOpen("") }}
                  className={cn("flex aspect-square flex-col items-center justify-center rounded-md text-sm hover:bg-muted", chosen && "bg-primary text-primary-foreground hover:bg-primary", !chosen && ymd(d) === ymd(today) && "ring-1 ring-primary")}
                  aria-pressed={chosen}
                >
                  {d.getDate()}
                  <span className={cn("mt-0.5 size-1 rounded-full", count ? (chosen ? "bg-primary-foreground" : "bg-primary") : "bg-transparent")} />
                </button>
              )
            })}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3" data-cron-day={ymd(day)}>
          <p className="text-sm font-medium capitalize">{new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(day)}</p>
          {!tasks.length && <p className="text-xs text-muted-foreground">{ui.noTasks}</p>}
          <div ref={list} className="relative max-h-[34rem] overflow-y-auto">
            <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
              {Array.from({ length: 48 }, (_, slot) => {
                const here = bySlot.get(slot) ?? []
                return (
                  <div key={slot} data-cron-slot={slot} className="flex min-h-8 gap-2 border-t border-border/60 py-1">
                    <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{pad(Math.floor(slot / 2))}:{slot % 2 ? "30" : "00"}</span>
                    <div className="flex min-w-0 flex-1 gap-2">
                      {here.map((s) => {
                        const st = status(s, day)
                        const run = runOf(s, ymd(day))
                        return (
                          <AccordionItem key={s.id} value={s.id} data-cron-task={s.id} data-cron-status={st} className={cn("min-w-0 flex-1 rounded-md border px-2 last:border-b", tone[st])}>
                            <AccordionTrigger className="py-1.5 text-sm hover:no-underline">
                              <span className="flex min-w-0 flex-col items-start gap-0.5">
                                <span className="font-mono text-xs">{s.time}</span>
                                <span className="truncate">{s.name ?? eventName(s.event)}</span>
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-1 text-xs">
                              <Badge variant="outline" className="w-fit">{ui.status[st]}</Badge>
                              <p><span className="text-muted-foreground">{ui.event}:</span> {eventName(s.event)}</p>
                              {eventText(s.event) && <p className="text-muted-foreground">{eventText(s.event)}</p>}
                              <p><span className="text-muted-foreground">{ui.repeatLabel}:</span> {ui.repeat[s.repeat]} · {ui.since} {s.start}{s.until ? ` · ${ui.until} ${s.until}` : ""}</p>
                              {run && <p><span className="text-muted-foreground">{ui.lastRun}:</span> {new Date(run.at).toLocaleString(lang)}{run.detail ? ` — ${run.detail}` : ""}</p>}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </Accordion>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.keys(tone) as Status[]).map((k) => <span key={k} className={cn("rounded border px-1.5", tone[k])}>{ui.status[k]}</span>)}
          </div>
        </section>
      </div>
    </div>
  )
}
