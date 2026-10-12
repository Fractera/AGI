import { Badge } from "@/components/ui/badge"
import type { A2ADoor, A2AOffer, ElementPassport as Passport } from "@/lib/a2a/element-passport"
import type { ElementPassportUi } from "../_i18n/element-passport.i18n"
import { SubscriptionsView } from "./subscriptions-view.client"

// СТРАНИЦЫ МЕНЮ ЭЛЕМЕНТА ПОКАЗЫВАЮТ ЕГО ПАСПОРТ (шаг 406-4; карта меню 406-2 — решение владельца «удалить всё предложенное,
// остальное как предложил»). Серверный компонент: читает уже прочитанный паспорт, своих данных не держит.

export type PassportView = "api" | "mcp" | "a2a" | "catalog" | "publish" | "find" | "subscriptions" | "cron"

function Example({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

function Door({ d, ui }: { d: A2ADoor; ui: ElementPassportUi }) {
  const callers = d.callers.includes("*") ? ui.everyone : d.callers.join(", ")
  const errors = d.errors && Object.keys(d.errors).length ? Object.entries(d.errors).map(([c, w]) => `${c} — ${w}`).join(" · ") : null
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3" data-passport-door={`${d.method ?? "MCP"} ${d.path}`}>
      <p className="flex flex-wrap items-center gap-2 font-mono text-sm">
        {d.method && <Badge variant="outline">{d.method}</Badge>}
        <span className="font-medium">{d.path}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        {ui.capability}: <span className="text-foreground">{d.skill}</span> · {ui.key}: <span className="text-foreground">{d.key}</span> · {ui.callers}: <span className="text-foreground">{callers}</span>
      </p>
      <Example label={ui.input} value={d.input} />
      <Example label={ui.output} value={d.output} />
      {errors && <p className="text-xs text-muted-foreground">{ui.errors}: {errors}</p>}
    </section>
  )
}

// 435-4: карточка витрины — что делает, что возвращает, цена, кому, лимит; у примера пометка, чтобы его не приняли за продажу.
function Offer({ o, example, ui }: { o: A2AOffer; example: boolean; ui: ElementPassportUi }) {
  const unit = o.price.unit === "message" ? ui.perMessage : ui.perRequest
  const limit = o.limit ? `${o.limit.count} ${o.limit.per === "hour" ? ui.perHour : ui.perDay}` : ui.unlimited
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 text-sm" data-passport-offer={o.id}>
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{o.name}</span>
        {example && <Badge variant="outline" className="text-muted-foreground">{ui.example}</Badge>}
      </p>
      <p>{o.description}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="text-muted-foreground">{ui.price}</dt><dd className="font-medium">${o.price.amount} {unit}</dd>
        <dt className="text-muted-foreground">{ui.access}</dt><dd>{o.access === "everyone" ? ui.accessEveryone : ui.accessRegistered}</dd>
        <dt className="text-muted-foreground">{ui.limit}</dt><dd>{limit}</dd>
        <dt className="text-muted-foreground">{ui.accepts} · {ui.returns}</dt><dd>{o.inputModes.join(", ")} → {o.outputModes.join(", ")}</dd>
      </dl>
    </div>
  )
}

export type NodeElementRow = { id: string; address: string; name: string; description: string; self: boolean }

// 435-3, выбор владельца «Показать оба»: сверху элементы узла из реестра ядра, ниже — каталог самого элемента.
function NodeElements({ rows, ui }: { rows: NodeElementRow[]; ui: ElementPassportUi }) {
  return (
    <section className="flex flex-col gap-2" data-node-elements={rows.length}>
      <p className="text-sm font-medium">{ui.nodeElements}</p>
      <p className="text-xs text-muted-foreground">{ui.nodeElementsLead}</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.id} className="text-sm">
            <span className="font-medium">{r.name}</span> <span className="font-mono text-xs text-muted-foreground">{r.address}</span>
            {r.self ? <Badge variant="secondary" className="ml-2">{ui.thisElement}</Badge> : null}
            <span className="text-muted-foreground"> — {r.description || ui.noDescription}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ElementPassport({ view, passport, ui, nodeElements }: { view: PassportView; passport: Passport | null; ui: ElementPassportUi; nodeElements?: NodeElementRow[] }) {
  if (view === "find") return <p className="my-4 text-sm text-muted-foreground" data-passport-view="find">{ui.networkSoon}</p>
  const card = passport?.card
  const x = passport?.ext
  const nodeList = view === "catalog" && nodeElements?.length ? <NodeElements rows={nodeElements} ui={ui} /> : null
  if (!card || !x) return <div className="my-4 flex flex-col gap-4">{nodeList}<p className="text-sm text-muted-foreground" data-passport-view="none">{ui.none} {ui.describeHint}</p></div>

  const notes = passport!.warnings.length ? (
    <p className="text-xs text-muted-foreground" data-passport-warnings>{ui.warnings} {passport!.warnings.join(" · ")}</p>
  ) : null
  const problems = passport!.problems.length ? (
    <div className="my-3 rounded-md border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-sm" role="alert" data-passport-problems>
      <p className="font-medium">{ui.problems}</p>
      <ul className="ml-5 list-disc">{passport!.problems.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="mt-1 text-muted-foreground">{ui.describeHint}</p>
    </div>
  ) : null

  let body: React.ReactNode = null
  if (view === "api" || view === "mcp") {
    const doors = (x.doors ?? []).filter((d) => d.protocol === (view === "api" ? "http" : "mcp"))
    body = doors.length
      ? <div className="flex flex-col gap-3"><p className="text-sm font-medium">{ui.doors}</p>{doors.map((d) => <Door key={`${d.method} ${d.path}`} d={d} ui={ui} />)}</div>
      : <p className="text-sm text-muted-foreground">{view === "api" ? ui.noHttp : ui.noMcp}</p>
  } else if (view === "a2a") {
    const offers = passport!.offers
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-sm">{card.description}</p>
        {offers && (
          <section className="flex flex-col gap-3" data-passport-offers={offers.offers.length}>
            <p className="text-sm font-medium">{ui.offers}</p>
            <p className="text-xs text-muted-foreground">{ui.offersLead}</p>
            <div className="grid gap-3 sm:grid-cols-2">{offers.offers.map((o) => <Offer key={o.id} o={o} example={offers.example} ui={ui} />)}</div>
          </section>
        )}
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium">{offers ? ui.forNeighbours : ui.can}</p>
          {offers && <p className="text-xs text-muted-foreground">{ui.forNeighboursLead}</p>}
          {card.skills.map((c) => (
            <div key={c.id} className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3 text-sm" data-passport-capability={c.id}>
              <p><span className="font-medium">{c.name}</span> <span className="font-mono text-xs text-muted-foreground">{c.id}</span></p>
              <p>{c.description}</p>
              <p className="text-xs text-muted-foreground">{ui.accepts}: {(c.inputModes ?? card.defaultInputModes).join(", ")} · {ui.returns}: {(c.outputModes ?? card.defaultOutputModes).join(", ")}</p>
              {c.examples?.length ? <p className="text-xs text-muted-foreground">{ui.examples}: «{c.examples.join("» · «")}»</p> : null}
              <p>{c.tags.map((t) => <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>)}</p>
            </div>
          ))}
        </section>
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium">{ui.needs}</p>
          {x.consumes?.length
            ? <ul className="flex flex-col gap-1.5">{x.consumes.map((c) => <li key={`${c.from}-${c.skill}`} className="text-sm"><span className="font-mono">{c.skill}</span>{c.from ? <> {ui.from} <span className="font-mono">{c.from}</span></> : null} — {c.why}</li>)}</ul>
            : <p className="text-sm text-muted-foreground">{ui.noNeeds}</p>}
        </section>
      </div>
    )
  } else if (view === "catalog") {
    const own = x.catalog
      ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">{ui.ownCatalog} · {ui.catalogDoors}</p>
          <p>{ui.find}: <span className="font-mono">{x.catalog.find}</span></p>
          <p>{ui.get}: <span className="font-mono">{x.catalog.get}</span></p>
          <p>{ui.contribute}: {x.catalog.contribute ? <span className="font-mono">{x.catalog.contribute}</span> : <span className="text-muted-foreground">{ui.noContribute}</span>}</p>
        </div>
      )
      : <p className="text-sm text-muted-foreground">{ui.catalogNone}</p>
    body = <div className="flex flex-col gap-5">{nodeList}{own}</div>
  } else if (view === "publish") {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{ui.notSent}</p>
        <Example label={`${ui.published} — ${ui.publishedLead}`} value={passport!.published} />
        <Example label={`${ui.registry} — ${ui.cardLead}`} value={passport!.registry} />
      </div>
    )
  } else if (view === "subscriptions") {
    // 463: внешние платные сервисы элемента — список, описание, ключи, «Проверить», платежи (SUBSCRIPTIONS.json).
    // 🪦 Владелец 2026-10-12 («to trush»): здесь стояли список нужд из паспорта («sign-in у auth …») и раздел «Внешние сервисы —
    // Нет…» по `process` вида `integration` (412-7) — сняты: вкладка показывает только подписки элемента.
    body = passport?.subscriptions
      ? <SubscriptionsView data={passport.subscriptions} ui={ui.subscriptions} />
      : <p className="text-sm text-muted-foreground">{ui.noIntegrations}</p>
  } else if (view === "cron") {
    body = (
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium">{ui.process}</p>
        {x.process?.length
          ? <ul className="flex flex-col gap-1.5">{x.process.map((p, i) => <li key={i} className="text-sm"><Badge variant="outline" className="mr-2">{p.kind}</Badge>{p.kind === "cron" && p.schedule ? <span className="mr-2 font-mono">{p.schedule}</span> : null}{p.what}</li>)}</ul>
          : <p className="text-sm text-muted-foreground">{ui.noProcess}</p>}
      </section>
    )
  }
  return (
    <div className="my-4 flex flex-col gap-3" data-passport-view={view}>
      {problems}
      {body}
      {notes}
    </div>
  )
}
