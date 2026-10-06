import { dataFetch } from "@/lib/fractera/data-service"
import { nodeEntries } from "@/lib/a2a/node-registry"
import { relayCall } from "@/lib/a2a/telegram-relay"

// ЖУРНАЛ ОБЩЕНИЯ АГЕНТОВ (шаг 408). Принимающий элемент отдаёт запись каждого вызова A2A ядру (`POST /api/node/a2a-log`),
// ядро пишет её в слой данных (`/a2a-log`, data v1.3.16: новые сверху, последние 10 000, ключи вырезаны, тела ≤ 8 КБ) и
// показывает лентой «Dashboard → Общение агентов». Ядро — единственный писатель журнала, и тем же действием шлёт вызов в
// Telegram участников и ядра (408-5, `lib/a2a/telegram-relay.ts`) — не дожидаясь отправки.

export type LogRecord = {
  from?: string; to: string; method?: string; skill?: string; taskId?: string; contextId?: string; state?: string
  httpStatus?: number; reason?: string; durationMs?: number; request?: unknown; response?: unknown
}

export type LogRow = {
  id: number; at: string; from_element: string; to_element: string; method: string | null; skill: string | null
  task_id: string | null; context_id: string | null; state: string | null; http_status: number | null; reason: string | null
  duration_ms: number | null; request: string | null; response: string | null; truncated: number
}

export type Agent = { key: string; address: string; name: string }

/** Записать вызов в слой данных. */
export async function writeLog(rec: LogRecord): Promise<{ ok: boolean; id?: number; error?: string }> {
  if (!rec || typeof rec.to !== "string" || !rec.to.trim()) return { ok: false, error: "to is required" }
  try {
    const res = await dataFetch("/a2a-log", { method: "POST", body: JSON.stringify(rec) })
    const body = (await res.json().catch(() => ({}))) as { id?: number; error?: string }
    if (!res.ok) return { ok: false, error: body.error ?? `data layer ${res.status}` }
    const from = entryOf(rec.from ?? "unknown")
    const to = entryOf(rec.to)
    relayCall({
      fromId: from.id, fromAddress: from.address, toId: to.id, toAddress: to.address, method: rec.method, skill: rec.skill, state: rec.state,
      httpStatus: rec.httpStatus, reason: rec.reason, durationMs: rec.durationMs != null ? Math.round(rec.durationMs) : null,
      request: json(rec.request), response: json(rec.response),
    })
      .then((r) => { if (r.sent) console.log(`[a2a-log] telegram: sent ${r.sent}`) })
      .catch(() => {})
    return { ok: true, id: body.id }
  } catch (e) {
    return { ok: false, error: String((e as Error).message ?? e) }
  }
}

const json = (v: unknown) => (v === undefined || v === null ? null : typeof v === "string" ? v : JSON.stringify(v))

/** Элемент реестра по адресу или id: id нужен, чтобы найти его бота; неизвестный — без id. */
function entryOf(key: string): { id: string | null; address: string } {
  const e = nodeEntries().find((x) => x.address === key || x.id === key)
  return e ? { id: e.id, address: e.address } : { id: null, address: key }
}

/** Как называть участника: его адрес в узле (владелец 2026-10-05: «roman в ленте лучше называть адресом»); неизвестный — как назвал себя сам. */
export function agentOf(key: string): Agent {
  const e = nodeEntries().find((x) => x.address === key || x.id === key)
  return e ? { key, address: e.address, name: e.address } : { key, address: key, name: key }
}

const FILTERS = ["after", "before", "element", "pair", "task", "context", "limit"] as const // 412-6: context — одна беседа

/** Прочитать журнал с отбором; к ответу — участники выборки с именами. */
export async function readLog(params: URLSearchParams): Promise<{ ok: boolean; rows: LogRow[]; total: number; agents: Agent[]; error?: string }> {
  const q = new URLSearchParams()
  for (const k of FILTERS) {
    const v = params.get(k)?.trim()
    if (v) q.set(k, v)
  }
  try {
    const res = await dataFetch(`/a2a-log${q.size ? `?${q}` : ""}`)
    if (!res.ok) return { ok: false, rows: [], total: 0, agents: [], error: `data layer ${res.status}` }
    const body = (await res.json()) as { rows: LogRow[]; total: number }
    const keys = [...new Set(body.rows.flatMap((r) => [r.from_element, r.to_element]))]
    return { ok: true, rows: body.rows, total: body.total, agents: keys.map(agentOf) }
  } catch (e) {
    return { ok: false, rows: [], total: 0, agents: [], error: String((e as Error).message ?? e) }
  }
}
