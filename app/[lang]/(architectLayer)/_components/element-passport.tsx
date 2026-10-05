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
        {ui.capability}: <span className="text-foreground">{d.skill}</span> · {ui.key}: <span className="text-foreground">{d.key}</span> · {ui.callers}: <span className="text-foreground">{callers}</span>
      </p>
      <Example label={ui.input} value={d.input} />
      <Example label={ui.output} value={d.output} />
      {errors && <p className="text-xs text-muted-foreground">{ui.errors}: {errors}</p>}
    </section>
  )
}

export function ElementPassport({ view, passport, ui }: { view: PassportView; passport: Passport | null; ui: ElementPassportUi }) {
  if (view === "find") return <p className="my-4 text-sm text-muted-foreground" data-passport-view="find">{ui.networkSoon}</p>
  const card = passport?.card
  const x = passport?.ext
  if (!card || !x) return <p className="my-4 text-sm text-muted-foreground" data-passport-view="none">{ui.none} {ui.describeHint}</p>

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
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-sm">{card.description}</p>
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium">{ui.can}</p>
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
    body = x.catalog
      ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">{ui.catalogDoors}</p>
          <p>{ui.find}: <span className="font-mono">{x.catalog.find}</span></p>
          <p>{ui.get}: <span className="font-mono">{x.catalog.get}</span></p>
          <p>{ui.contribute}: {x.catalog.contribute ? <span className="font-mono">{x.catalog.contribute}</span> : <span className="text-muted-foreground">{ui.noContribute}</span>}</p>
        </div>
      )
      : <p className="text-sm text-muted-foreground">{ui.catalogNone}</p>
  } else if (view === "publish") {
    const pr = passport!.projections
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{ui.notSent}</p>
        <Example label={`${ui.published} — ${ui.publishedLead}`} value={passport!.published} />
        <Example label={`${ui.registry} — ${ui.cardLead}`} value={passport!.registry} />
        {pr && <Example label={ui.nostr} value={pr.nostrTags.map((t) => t[1]).join(", ")} />}
        {pr && <Example label={ui.lightrag} value={pr.lightragText} />}
      </div>
    )
  } else if (view === "subscriptions") {
    body = x.consumes?.length
      ? <ul className="flex flex-col gap-1.5">{x.consumes.map((c) => <li key={`${c.from}-${c.skill}`} className="text-sm"><span className="font-mono">{c.skill}</span>{c.from ? <> {ui.from} <span className="font-mono">{c.from}</span></> : null} — {c.why}</li>)}</ul>
      : <p className="text-sm text-muted-foreground">{ui.noNeeds}</p>
  } else if (view === "cron") {
    body = (
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium">{ui.process}</p>
        {x.process?.length
          ? <ul className="flex flex-col gap-1.5">{x.process.map((p, i) => <li key={i} className="text-sm"><Badge variant="outline" className="mr-2">{p.kind}</Badge>{p.what}</li>)}</ul>
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
