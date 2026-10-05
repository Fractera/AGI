import { Badge } from "@/components/ui/badge"
import type { A2ADoor, ElementPassport as Passport } from "@/lib/a2a/element-passport"
import type { ElementPassportUi } from "../_i18n/element-passport.i18n"

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
        {ui.capability}: <span className="text-foreground">{d.capability}</span> · {ui.key}: <span className="text-foreground">{d.key}</span> · {ui.callers}: <span className="text-foreground">{callers}</span>
      </p>
      <Example label={ui.input} value={d.input} />
      <Example label={ui.output} value={d.output} />
      {errors && <p className="text-xs text-muted-foreground">{ui.errors}: {errors}</p>}
    </section>
  )
}

export function ElementPassport({ view, passport, ui }: { view: PassportView; passport: Passport | null; ui: ElementPassportUi }) {
  if (view === "find") return <p className="my-4 text-sm text-muted-foreground" data-passport-view="find">{ui.networkSoon}</p>
  const a = passport?.a2a
  if (!a) return <p className="my-4 text-sm text-muted-foreground" data-passport-view="none">{ui.none} {ui.describeHint}</p>

  const problems = passport!.problems.length ? (
    <div className="my-3 rounded-md border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-sm" role="alert" data-passport-problems>
      <p className="font-medium">{ui.problems}</p>
      <ul className="ml-5 list-disc">{passport!.problems.map((p) => <li key={p}>{p}</li>)}</ul>
      <p className="mt-1 text-muted-foreground">{ui.describeHint}</p>
    </div>
  ) : null

  let body: React.ReactNode = null
  if (view === "api" || view === "mcp") {
    const doors = a.doors.filter((d) => d.protocol === (view === "api" ? "http" : "mcp"))
    body = doors.length
      ? <div className="flex flex-col gap-3"><p className="text-sm font-medium">{ui.doors}</p>{doors.map((d) => <Door key={`${d.method} ${d.path}`} d={d} ui={ui} />)}</div>
      : <p className="text-sm text-muted-foreground">{view === "api" ? ui.noHttp : ui.noMcp}</p>
  } else if (view === "a2a") {
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-sm">{a.summary}</p>
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium">{ui.can}</p>
          <ul className="flex flex-col gap-1.5">
            {a.capabilities.map((c) => (
              <li key={c.name} className="text-sm" data-passport-capability={c.name}>
                <span className="font-mono">{c.name}</span> — {c.words}{" "}
                {c.tags.map((t) => <Badge key={t} variant="secondary" className="ml-1">{t}</Badge>)}
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-2">
          <p className="text-sm font-medium">{ui.needs}</p>
          {a.consumes?.length
            ? <ul className="flex flex-col gap-1.5">{a.consumes.map((c) => <li key={`${c.from}-${c.capability}`} className="text-sm"><span className="font-mono">{c.capability}</span>{c.from ? <> {ui.from} <span className="font-mono">{c.from}</span></> : null} — {c.why}</li>)}</ul>
            : <p className="text-sm text-muted-foreground">{ui.noNeeds}</p>}
        </section>
      </div>
    )
  } else if (view === "catalog") {
    body = a.catalog
      ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">{ui.catalogDoors}</p>
          <p>{ui.find}: <span className="font-mono">{a.catalog.find}</span></p>
          <p>{ui.get}: <span className="font-mono">{a.catalog.get}</span></p>
          <p>{ui.contribute}: {a.catalog.contribute ? <span className="font-mono">{a.catalog.contribute}</span> : <span className="text-muted-foreground">{ui.noContribute}</span>}</p>
        </div>
      )
      : <p className="text-sm text-muted-foreground">{ui.catalogNone}</p>
  } else if (view === "publish") {
    const pr = passport!.projections as { nostrTags: string[][]; lightragText: string } | null
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{ui.notSent}</p>
        <Example label={`${ui.card} — ${ui.cardLead}`} value={passport!.card} />
        {pr && <Example label={ui.nostr} value={pr.nostrTags.map((t) => t[1]).join(", ")} />}
        {pr && <Example label={ui.lightrag} value={pr.lightragText} />}
      </div>
    )
  } else if (view === "subscriptions") {
    body = a.consumes?.length
      ? <ul className="flex flex-col gap-1.5">{a.consumes.map((c) => <li key={`${c.from}-${c.capability}`} className="text-sm"><span className="font-mono">{c.capability}</span>{c.from ? <> {ui.from} <span className="font-mono">{c.from}</span></> : null} — {c.why}</li>)}</ul>
      : <p className="text-sm text-muted-foreground">{ui.noNeeds}</p>
  } else if (view === "cron") {
    body = (
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium">{ui.process}</p>
        {a.process?.length
          ? <ul className="flex flex-col gap-1.5">{a.process.map((p, i) => <li key={i} className="text-sm"><Badge variant="outline" className="mr-2">{p.kind}</Badge>{p.what}</li>)}</ul>
          : <p className="text-sm text-muted-foreground">{ui.noProcess}</p>}
      </section>
    )
  }
  return (
    <div className="my-4 flex flex-col gap-3" data-passport-view={view}>
      {problems}
      {body}
    </div>
  )
}
