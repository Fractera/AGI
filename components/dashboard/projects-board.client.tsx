"use client"

import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { TableTools } from "@/components/table/table-tools.client"
import type { TableUi } from "@/sections/table.i18n"

// ТАБЛИЦА «Dashboard → Проекты» (339). Страница предрендерена — строки спрашиваются у `/api/node/projects` один раз при
// открытии (опроса нет: его не заказывали). Таблица — стандартная `TableTools`: поиск сверху, страницы снизу, горизонтальная
// прокрутка; над ней два чекбокса «нативные» и «кастомные». Поиск идёт по служебному адресу, своему домену, заголовку и описанию.

type Status = "running" | "stopped" | "building" | "unborn"
type Row = {
  id: string
  custom: boolean
  service: string
  title: string | null
  description: string | null
  domain: string | null
  commit: { hash: string; subject: string } | null
  status: Status
  date: string | null
  commits: number | null
  link: string | null
  open: string
}

export type ProjectsBoardWords = {
  loading: string
  unavailable: string
  native: string
  custom: string
  head: string[]
  status: Record<Status, string>
  openLabel: string
  table: TableUi
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const DASH = "—"
const TONE: Record<Status, string> = {
  running: "text-foreground",
  stopped: "text-destructive",
  building: "text-primary",
  unborn: "text-muted-foreground",
}

export function ProjectsBoard({ words, lang }: { words: ProjectsBoardWords; lang: string }) {
  const [rows, setRows] = useState<Row[] | "loading" | "failed">("loading")

  useEffect(() => {
    fetch(`${BASE}/api/node/projects?lang=${lang}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { rows: Row[] }) => setRows(d.rows))
      .catch(() => setRows("failed"))
  }, [lang])

  if (rows === "loading") {
    return (
      <p className="my-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner /> {words.loading}
      </p>
    )
  }
  if (rows === "failed") return <p className="my-6 text-sm text-destructive" role="alert">{words.unavailable}</p>

  const cell = "px-4 py-3 align-top whitespace-nowrap"
  const wide = "px-4 py-3 align-top min-w-[16rem] max-w-[24rem] whitespace-normal"
  const link = "text-primary underline-offset-4 hover:underline"

  const head = (
    <tr className="border-b border-border">
      {words.head.map((h) => (
        <th key={h} scope="col" className="px-4 py-3 align-bottom font-semibold whitespace-nowrap text-foreground">{h}</th>
      ))}
    </tr>
  )

  const body = rows.map((r, i) => (
    <tr key={r.id} className="border-b border-border last:border-0 text-muted-foreground" data-project={r.id}>
      <td className={`${cell} font-medium text-foreground`}>{i + 1}</td>
      <td className={`${cell} text-foreground`}>{r.service}</td>
      <td className={wide}>{r.title ?? DASH}</td>
      <td className={wide}>{r.description ?? DASH}</td>
      <td className={cell}>{r.domain ?? DASH}</td>
      <td className={cell}>{DASH}</td>
      <td className={wide}>{r.commit ? <><code className="text-foreground">{r.commit.hash}</code> {r.commit.subject}</> : DASH}</td>
      <td className={`${cell} ${TONE[r.status]}`} data-status={r.status}>{words.status[r.status]}</td>
      <td className={cell}>{r.date ? new Date(r.date).toLocaleString(lang) : DASH}</td>
      <td className={cell}>{r.commits ?? DASH}</td>
      <td className={cell}>{r.link ? <a className={link} href={r.link} rel="noopener noreferrer" target="_blank">{r.link.replace(/^https?:\/\//, "")}</a> : DASH}</td>
      <td className={cell}><a className={link} href={`${BASE}/${lang}${r.open}`}>{words.openLabel}</a></td>
      <td className={cell}>{DASH}</td>
    </tr>
  ))

  return (
    <TableTools
      columns={words.head.length}
      head={head}
      rows={body}
      texts={rows.map((r) => [r.service, r.domain, r.title, r.description].filter(Boolean).join(" "))}
      toggles={[
        { label: words.native, match: rows.map((r) => !r.custom) },
        { label: words.custom, match: rows.map((r) => r.custom) },
      ]}
      words={words.table}
    />
  )
}
