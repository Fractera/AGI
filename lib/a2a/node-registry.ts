import "server-only"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import paths from "@/lib/agi-items/paths.cjs"
import { listServices, serviceUrl } from "@/lib/microservices/registry"
import { fingerprintOf, passportProblems, registryEntryOf } from "@/lib/a2a/passport.mjs"
import { addressOf } from "@/lib/agi-items/address-file.mjs"
import elementProps from "@/lib/agi-items/element-props.cjs"

// РЕЕСТР A2A УЗЛА — ЯДРО КАК ЦЕНТР ОБНАРУЖЕНИЯ (шаг 406-6; владелец 2026-10-05: «центр … это будет ядро»; вызов — напрямую,
// ядро подсказывает адрес). Запись элемента (уровень 1) выводится из его визитки и пишется в реестр при `describe:publish`
// вместе с отпечатком; живая визитка с другим отпечатком = «расходится». Поиск — по словам и тегам, до 10 записей; полная
// визитка — по адресу `/.well-known/agent-card.json` самого элемента.

type Entry = {
  address: string; name: string; description: string
  skills: { id: string; tags: string[] }[]
  hasCatalog: boolean; visibility: string; fingerprint: string; card: string | null
}
export type NodeEntry = Entry & { id: string; url: string | null; state: "fresh" | "drift" | "unpublished" | "no-card" }

type Props = { id?: string; summary?: string; a2a?: { card?: unknown } }

function elementFolder(id: string, kind: string): string {
  return paths.itemDir(id, kind)
}

/** Визитка элемента с диска или null. */
export function readPassport(id: string, kind: string): Props | null {
  // 417: старый корневой файл или новая раскладка (визитка собирается из паспорта и A2A-CARD.json).
  return elementProps.readElementProps(elementFolder(id, kind)) as Props | null
}

/** Запись уровня 1 из визитки для реестра; null — визитки нет или она не проходит стандарт. */
export function entryForRegistry(id: string, kind: string): Entry | null {
  const p = readPassport(id, kind)
  if (!p?.a2a?.card) return null
  const { problems } = passportProblems(p) as { problems: string[] }
  if (problems.length) return null
  const url = serviceUrl(id)
  return registryEntryOf(p, { address: addressOf(id), cardUrl: url ? `${url}/.well-known/agent-card.json` : null }) as Entry
}

/** Все элементы узла с их записями и состоянием свежести. */
export function nodeEntries(): NodeEntry[] {
  const out: NodeEntry[] = []
  for (const s of listServices() as unknown as { id: string; kind?: string; a2a?: Entry }[]) {
    const kind = s.kind === "user" ? "user" : "core"
    const live = readPassport(s.id, kind)
    const url = serviceUrl(s.id)
    const stored = s.a2a ?? null
    if (!live?.a2a?.card) {
      if (stored) out.push({ ...stored, id: s.id, url, state: "no-card" })
      continue
    }
    const fp = fingerprintOf(live) as string
    const fresh = entryForRegistry(s.id, kind)
    if (!stored) { if (fresh) out.push({ ...fresh, id: s.id, url, state: "unpublished" }); continue }
    out.push({ ...stored, id: s.id, url, state: stored.fingerprint === fp ? "fresh" : "drift" })
  }
  return out
}

/** Найти: до `limit` записей, где совпали слова запроса (теги и id навыков весят больше слов описания). */
export function findEntries(query: string, limit = 10): (NodeEntry & { score: number })[] {
  const words = query.toLowerCase().split(/[^\p{L}\p{N}-]+/u).filter((w) => w.length > 1)
  if (!words.length) return []
  return nodeEntries()
    .map((e) => {
      const tags = new Set(e.skills.flatMap((s) => [s.id, ...s.tags]).map((t) => t.toLowerCase()))
      const text = `${e.name} ${e.description}`.toLowerCase()
      const score = words.reduce((n, w) => n + (tags.has(w) ? 3 : 0) + ([...tags].some((t) => t.includes(w)) ? 1 : 0) + (text.includes(w) ? 1 : 0), 0)
      return { ...e, score }
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(limit, 10)))
}
