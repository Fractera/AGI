import "server-only"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { listServices } from "@/lib/microservices/registry"

type RegistryEntry = ReturnType<typeof listServices>[number]
import { listDrafts } from "@/lib/agi-items/drafts"
import { addressOf } from "@/lib/agi-items/address-file.mjs"
import { domainRecord } from "@/lib/agi-items/element-domain"
import { birthState } from "@/lib/agi-items/birth"
import paths from "@/lib/agi-items/paths.cjs"
import deployLock from "@/lib/deploy/deploy-lock.cjs"

// СТРОКИ ТАБЛИЦЫ «Dashboard → Проекты» (339). Слово владельца 2026-09-29: «В каждой строке: порядковый номер · служебный адрес ·
// заголовок из мета · описание из мета · отдельно адрес если существует · выставлен на продажу в web3 · последний коммит ·
// статус: работает, остановлен, идёт сборка · дата · количество коммитов · ссылка · открыть этот AGI ITEMS · пользователи онлайн».
//
// 🔒 СОСТОЯНИЕ ИЗМЕРЯЕТСЯ, А НЕ ВСПОМИНАЕТСЯ: порт элемента спрашивается по HTTP (pm2 пишет online и у сервера, отдающего 500),
// из того же ответа берутся заголовок и описание страницы — как есть, а не как записано в конфиге.
// 🔒 «НАТИВНЫЕ» И «КАСТОМНЫЕ» ДЕЛЯТСЯ ТАК ЖЕ, КАК ЛЕВОЕ МЕНЮ (`_lib/draft-menu.tsx`): кастомные — черновики узла, остальное — нативные.
// 🛑 web3 и «онлайн» — источника в узле нет; поле `null` = «не знаю», а не «нет» (решение владельца 2026-09-30: колонки с «—»).

export type ProjectStatus = "running" | "stopped" | "building" | "unborn"

export type ProjectRow = {
  id: string
  custom: boolean
  /** Служебный адрес `<адрес>.<зона>` (root — корень зоны); без зоны узла — сам адрес. */
  service: string
  title: string | null
  description: string | null
  /** Свой домен элемента, если подключён. */
  domain: string | null
  web3: null
  commit: { hash: string; subject: string } | null
  status: ProjectStatus
  /** Дата последнего коммита, ISO. */
  date: string | null
  commits: number | null
  /** Сайт элемента: свой домен → служебный адрес; без зоны — null. */
  link: string | null
  /** Страница элемента в ядре, без языка: `/architect/<адрес>`. */
  open: string
  online: null
}

type NodeDomain = { zone?: string; hostname?: string }
function nodeDomain(): NodeDomain | null {
  try { return JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as NodeDomain } catch { return null }
}

// То же правило, что у двери `/api/node/reach` (hostnameFor): root отвечает на корне зоны, остальные — на поддомене адреса.
function serviceHost(id: string, d: NodeDomain | null): string {
  const name = addressOf(id)
  if (!d?.zone) return name
  return id === "root" ? d.hostname ?? d.zone : `${name}.${d.zone}`
}

function git(dir: string, args: string[]): string | null {
  if (!existsSync(join(dir, ".git"))) return null
  const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", windowsHide: true, timeout: 10_000 })
  return r.status === 0 ? r.stdout.trim() : null
}

function building(id: string): boolean {
  const lock = deployLock.readState() as { running?: boolean; current?: string | null } | null
  if (lock?.running && lock.current === id) return true
  try {
    const p = JSON.parse(readFileSync(join(process.cwd(), "data", "services", id, "preview.json"), "utf8")) as { state?: string }
    if (p.state === "building") return true
  } catch { /* предпросмотра нет */ }
  return birthState(id).state === "running"
}

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re)
  if (!m) return null
  const t = m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
  return t || null
}

/** Спросить элемент: отвечает ли он и что стоит в мета его главной (`/<lang>`, затем `/`). */
async function probe(port: number, lang: string): Promise<{ up: boolean; title: string | null; description: string | null }> {
  let up = false
  for (const path of [`/${lang}`, "/"]) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}${path}`, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(3000) })
      up = true
      if (!r.ok || !(r.headers.get("content-type") ?? "").includes("text/html")) continue
      const html = await r.text()
      const title = pick(html, /<title[^>]*>([^<]*)<\/title>/i)
      const description = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
        ?? pick(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)
      return { up, title, description }
    } catch { /* нет ответа по этому пути */ }
  }
  return { up, title: null, description: null }
}

async function row(id: string, entry: RegistryEntry | null, custom: boolean, lang: string, d: NodeDomain | null): Promise<ProjectRow> {
  const service = serviceHost(id, d)
  const own = domainRecord(id)
  const dir = entry ? (paths.entryDir(entry) as string) : null
  const log = dir ? git(dir, ["log", "-1", "--format=%h%x09%cI%x09%s"]) : null
  const [hash, date, subject] = log ? log.split("\t") : []
  const count = dir ? git(dir, ["rev-list", "--count", "HEAD"]) : null
  const port = entry && typeof entry.port === "number" ? entry.port : null
  const seen = port !== null ? await probe(port, lang) : { up: false, title: null, description: null }
  const status: ProjectStatus = building(id) ? "building" : !entry ? "unborn" : seen.up ? "running" : "stopped"
  return {
    id,
    custom,
    service,
    title: seen.title,
    description: seen.description,
    domain: own?.domain ?? null,
    web3: null,
    commit: hash ? { hash, subject: subject ?? "" } : null,
    status,
    date: date ?? null,
    commits: count && /^\d+$/.test(count) ? Number(count) : null,
    link: own ? `https://${own.domain}` : d?.zone ? `https://${service}` : null,
    open: `/architect/${addressOf(id)}`,
    online: null,
  }
}

/** Все AGI ITEMS узла: сначала нативные в порядке реестра, затем кастомные — новые сверху (`listDrafts`). */
export async function projectRows(lang: string): Promise<ProjectRow[]> {
  const d = nodeDomain()
  const drafts = listDrafts()
  const customIds = new Set(drafts.map((x) => x.id))
  const services = listServices()
  const byId = new Map(services.map((s) => [s.id, s]))
  const jobs = [
    ...services.filter((s) => !customIds.has(s.id)).map((s) => row(s.id, s, false, lang, d)),
    ...drafts.map((x) => row(x.id, byId.get(x.id) ?? null, true, lang, d)),
  ]
  return Promise.all(jobs)
}
