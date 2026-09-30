// ОБРАЩЕНИЯ К API CLOUDFLARE — одно место на весь узел (259-2).
//
// 🔒 УЗЕЛ ХОДИТ В API С ТОКЕНОМ, А НЕ ЧЕРЕЗ MCP, И ЭТО РЕШЕНИЕ, А НЕ УДОБСТВО.
// Туннель поднимается при загрузке компьютера, когда рядом нет ни агента, ни
// человека у браузера, а вход в Cloudflare через MCP требует и того и другого.
// Поставь мы MCP в путь запуска — сайт перестал бы вставать без чужой живой
// службы, то есть мы завели бы единую точку отказа, запрещённую решением
// владельца 2026-09-18. MCP едет в комплекте АГЕНТУ человека (259-6) и в рантайме
// узла не участвует.
//
// 🔒 ПУТИ ВЗЯТЫ ИЗ ПЕРВОИСТОЧНИКА 2026-09-21 (developers.cloudflare.com):
// `GET /user/tokens/verify` — проверка токена, `status` бывает active, disabled,
// expired; `GET /zones` — список зон, `status` бывает initializing, pending,
// active, moved. Заголовок — `Authorization: Bearer <токен>`.
//
// 🛑 ОТКАЗ НАЗЫВАЕТ ПРИЧИНУ, А НЕ ВОЗВРАЩАЕТ ПУСТОТУ. Пустой список зон и
// неверный токен — разные беды с разным лечением, и человек должен видеть, какая
// у него. Отказ без причины есть тупик.

const API = "https://api.cloudflare.com/client/v4"

// 🔒 ПУТИ ВЗЯТЫ ИЗ ПЕРВОИСТОЧНИКА 2026-09-21 И НАЗВАНЫ ЗДЕСЬ, А НЕ РАЗБРОСАНЫ:
//   POST /accounts/{account}/cfd_tunnel                    — создать туннель
//   GET  /accounts/{account}/cfd_tunnel/{id}/token         — его токен
//   PUT  /accounts/{account}/cfd_tunnel/{id}/configurations — правила входа
//   POST /zones/{zone}/dns_records                          — запись DNS
// Ответ на создание туннеля токена НЕ содержит: документация прямо говорит взять
// его отдельным запросом. Предположи мы обратное — получили бы пустое значение,
// которое выглядит как успех.

export type CfFailure = { ok: false; reason: string }
export type CfZone = { id: string; name: string; status: string }

async function call<T>(path: string, token: string): Promise<{ ok: true; result: T } | CfFailure> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch (e) {
    // Сети нет — это НЕ «токен плохой». Разные беды называются по-разному.
    return { ok: false, reason: `network:${e instanceof Error ? e.message : "unknown"}` }
  }

  let body: unknown
  try { body = await res.json() } catch { return { ok: false, reason: `http:${res.status}` } }

  const b = body as { success?: boolean; result?: T; errors?: Array<{ message?: string }> }
  if (!b?.success) {
    const first = b?.errors?.[0]?.message
    return { ok: false, reason: first ? `cloudflare:${first}` : `http:${res.status}` }
  }
  return { ok: true, result: b.result as T }
}

/** Жив ли токен. Отвечает статусом самого токена, а не только «да/нет». */
export async function verifyToken(token: string) {
  return call<{ id: string; status: string }>("/user/tokens/verify", token)
}

/**
 * Зоны, которые видит токен.
 *
 * 🔒 СПИСОК, А НЕ ОДНА ЗОНА: человек мог завести в Cloudflare несколько доменов,
 * и выбрать нужный обязан он, а не мы. Угадывание здесь — это уверенный неверный
 * ответ, который дороже пустого.
 */
export async function listZones(token: string) {
  return call<CfZone[]>("/zones?per_page=50", token)
}


export type CfZoneDetails = CfZone & { name_servers?: string[] }

/**
 * Зона по точному имени (324-1) — `GET /zones?name=<имя>`. Нет зоны — `result: null`.
 *
 * 🔒 ЗАМЕРЕНО 2026-09-27 на ответе API: у зоны есть `status` и `name_servers` (серверы имён, которые Cloudflare назначил
 * зоне и которые человек ставит у регистратора); чужое имя — пустой список, а не отказ. Пустой список значит «ключ этой
 * зоны не видит»: зоны нет в аккаунте ИЛИ ключ ограничен выбранными зонами (developers.cloudflare.com, «Create API token»:
 * доступ к зоне example.com даёт доступ «only for that specific zone») — различить можно только в панели владельца.
 */
export async function zoneByName(token: string, name: string) {
  const r = await call<CfZoneDetails[]>(`/zones?name=${encodeURIComponent(name)}`, token)
  if (!r.ok) return r
  return { ok: true as const, result: r.result.find((z) => z.name === name) ?? null }
}

type Method = "GET" | "POST" | "PUT" | "DELETE"

async function send<T>(method: Method, path: string, token: string, body?: unknown): Promise<{ ok: true; result: T } | CfFailure> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    })
  } catch (e) {
    return { ok: false, reason: `network:${e instanceof Error ? e.message : "unknown"}` }
  }
  let parsed: unknown
  try { parsed = await res.json() } catch { return { ok: false, reason: `http:${res.status}` } }
  const b = parsed as { success?: boolean; result?: T; errors?: Array<{ message?: string }> }
  if (!b?.success) {
    const first = b?.errors?.[0]?.message
    return { ok: false, reason: first ? `cloudflare:${first}` : `http:${res.status}` }
  }
  return { ok: true, result: b.result as T }
}

/**
 * Создать зону в аккаунте (324-1) — `POST /zones` `{ name, account: { id }, type: "full" }`.
 *
 * 🔒 ЗАМЕРЕНО 2026-09-27: ключ, выданный лестницей 259 на одну зону, получает отказ дословно «Requires permission
 * "com.cloudflare.api.account.zone.create" to create zones for the selected account». В документации Cloudflare («API token
 * permissions») право зовётся «Zone Edit / Zone Write — Grants write access to zone management». Отказ возвращается как есть.
 */
export async function createZone(token: string, accountId: string, name: string) {
  return send<CfZoneDetails>("POST", "/zones", token, { name, account: { id: accountId }, type: "full" })
}

/** Перезапустить проверку активации зоны (docs: «Rerun the Activation Check», `/zones/{zone_id}/activation_check`). */
export async function activationCheck(token: string, zoneId: string) {
  return send<{ id: string }>("PUT", `/zones/${zoneId}/activation_check`, token)
}

/**
 * Учётная запись, которой принадлежит зона.
 *
 * 🔒 СПРАШИВАЕТСЯ У ЗОНЫ, А НЕ У СПИСКА АККАУНТОВ. Токен может видеть несколько
 * учётных записей, и выбрать «первую» значит однажды создать туннель не там.
 * Зона знает своего владельца точно.
 */
export async function accountOfZone(token: string, zoneId: string) {
  const r = await send<{ account: { id: string } }>("GET", `/zones/${zoneId}`, token)
  if (!r.ok) return r
  const id = r.result?.account?.id
  return id ? ({ ok: true as const, result: id }) : ({ ok: false as const, reason: "zone-without-account" })
}

/** Создать именованный туннель. Возвращает его идентификатор. */
export async function createTunnel(token: string, accountId: string, name: string) {
  const r = await send<{ id: string }>("POST", `/accounts/${accountId}/cfd_tunnel`, token, {
    name,
    config_src: "cloudflare",
  })
  return r.ok ? ({ ok: true as const, result: r.result.id }) : r
}

/** Токен запуска туннеля — тот, с которым живёт `cloudflared`. */
export async function tunnelToken(token: string, accountId: string, tunnelId: string) {
  return send<string>("GET", `/accounts/${accountId}/cfd_tunnel/${tunnelId}/token`, token)
}

/**
 * Куда туннель отдаёт запросы.
 *
 * 🛑 ПОСЛЕДНЕЕ ПРАВИЛО — ЛОВУШКА ДЛЯ ВСЕГО ОСТАЛЬНОГО, И БЕЗ НЕЁ CLOUDFLARE
 * ОТКАЗЫВАЕТ. Правил должно быть хотя бы одно, и последнее обязано быть без
 * имени хоста: иначе запрос, не совпавший ни с чем, некуда деть.
 */
export type IngressRule = { hostname: string; service: string }

// 🔒 СПИСОК ПРАВИЛ, А НЕ ОДНО ИМЯ (259-8): сайт и вход идут одним туннелем на
// разные порты машины. `PUT` заменяет конфигурацию целиком, поэтому правила
// передаются все сразу — второе имя, добавленное отдельным вызовом, стёрло бы первое.
export async function setIngress(token: string, accountId: string, tunnelId: string, rules: IngressRule[]) {
  return send<unknown>("PUT", `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`, token, {
    config: { ingress: [...rules, { service: "http_status:404" }] },
  })
}

/**
 * Права ключа на Workers (узел, шаг 344): копия публичных страниц живёт в Workers аккаунта человека. Нужны Workers Scripts
 * (аккаунт) и Workers Routes (зона). Проба — чтение списков; отказ права — `false`. 🛑 Чтение доказывает право видеть, а не
 * править: право записи выясняется первой выкладкой копии, и она называет отказ словами.
 * ✗ Замер 2026-09-30 на ключе узла: `workers/scripts` 200, `zones/…/workers/routes` 403.
 */
export async function workersAccess(token: string, accountId: string, zoneId: string) {
  const scripts = await send<unknown[]>("GET", `/accounts/${accountId}/workers/scripts`, token)
  const routes = await send<unknown[]>("GET", `/zones/${zoneId}/workers/routes`, token)
  return { scripts: scripts.ok, routes: routes.ok }
}

/**
 * Туннель с этим именем, если он уже есть.
 *
 * 🔒 ПОВТОРНОЕ НАЖАТИЕ НЕ ПЛОДИТ ТУННЕЛИ (259-7). Прежде каждая активация звала
 * `createTunnel`, и вторая падала на занятом имени — то есть кнопку нельзя было
 * нажать второй раз даже ради починки. Теперь туннель переиспользуется.
 */
export async function findTunnel(token: string, accountId: string, name: string) {
  const r = await send<Array<{ id: string; name: string; deleted_at?: string | null }>>(
    "GET", `/accounts/${accountId}/cfd_tunnel?name=${encodeURIComponent(name)}&is_deleted=false`, token,
  )
  if (!r.ok) return r
  const hit = r.result.find((t) => t.name === name && !t.deleted_at)
  return { ok: true as const, result: hit?.id ?? null }
}

/**
 * Запись DNS, ведущая имя на туннель.
 *
 * 🔒 `proxied: true` ОБЯЗАТЕЛЬНО: адрес `<id>.cfargotunnel.com` существует только
 * внутри сети Cloudflare, и без проксирования имя никуда не ведёт.
 */
export async function upsertTunnelRecord(token: string, zoneId: string, name: string, tunnelId: string) {
  const content = `${tunnelId}.cfargotunnel.com`
  const existing = await send<Array<{ id: string }>>("GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&type=CNAME`, token)
  if (existing.ok && existing.result.length > 0) {
    return send<{ id: string }>("PUT", `/zones/${zoneId}/dns_records/${existing.result[0].id}`, token, {
      type: "CNAME", name, content, proxied: true,
    })
  }
  return send<{ id: string }>("POST", `/zones/${zoneId}/dns_records`, token, {
    type: "CNAME", name, content, proxied: true,
  })
}

// ── ЗАПИСИ DNS ДЛЯ ЧУЖОЙ СЛУЖБЫ ПОЧТЫ (266-4) ────────────────────────────────
//
// 🔒 НИЧЕГО ЧУЖОГО НЕ ПЕРЕЗАПИСЫВАЕТСЯ И НЕ УДАЛЯЕТСЯ. Зона — живые данные
// человека: в ней может уже стоять его DMARC или запись другой почты. Поэтому
// запись только ДОБАВЛЯЕТСЯ; совпадающая пропускается, а отличающаяся
// называется конфликтом и остаётся как была — решает человек, не узел.
//
// 🛑 `proxied: false` У CNAME ОБЯЗАТЕЛЬНО, в отличие от записи туннеля выше.
// Resend показывает «DNS Only»: проксированная запись отдаёт адрес Cloudflare
// вместо своего значения, и проверка домена у Resend не проходит никогда.

export type MailRecord = { type: "TXT" | "CNAME" | "MX"; name: string; content: string; priority?: number }
export type MailRecordResult = { name: string; type: string; outcome: "created" | "exists" | "conflict" | "failed"; reason?: string }

/** Имя записи в полной форме: Resend показывает его относительно зоны. */
export function fullRecordName(name: string, zone: string): string {
  const n = name.trim().replace(/\.$/, "").toLowerCase()
  const z = zone.toLowerCase()
  if (n === "@" || n === "" || n === z) return z
  return n.endsWith(`.${z}`) ? n : `${n}.${z}`
}

/** Сравнение значений без кавычек и хвостовой точки — так их отдаёт Cloudflare. */
function sameContent(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().replace(/^"|"$/g, "").replace(/\.$/, "").toLowerCase()
  return norm(a) === norm(b)
}

export async function addMailRecord(token: string, zoneId: string, zone: string, rec: MailRecord): Promise<MailRecordResult> {
  const name = fullRecordName(rec.name, zone)
  const found = await send<Array<{ id: string; content: string }>>(
    "GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&type=${rec.type}`, token,
  )
  if (!found.ok) return { name, type: rec.type, outcome: "failed", reason: found.reason }
  if (found.result.some((r) => sameContent(r.content, rec.content))) return { name, type: rec.type, outcome: "exists" }
  // Второй TXT с тем же именем законен в DNS, но для DKIM и DMARC он ломает
  // проверку; CNAME второй не бывает вовсе. Любая запись с тем же именем и типом
  // — конфликт, который человек разбирает сам.
  if (found.result.length > 0) return { name, type: rec.type, outcome: "conflict" }

  const body: Record<string, unknown> = { type: rec.type, name, content: rec.content.trim(), ttl: 1 }
  if (rec.type === "CNAME") body.proxied = false
  if (rec.type === "MX") body.priority = rec.priority ?? 10
  const made = await send<{ id: string }>("POST", `/zones/${zoneId}/dns_records`, token, body)
  return made.ok ? { name, type: rec.type, outcome: "created" } : { name, type: rec.type, outcome: "failed", reason: made.reason }
}

// ── АДРЕС СЛУЖБЫ В ИНТЕРНЕТЕ (289-2) ─────────────────────────────────────────
//
// 🔒 МАРШРУТ ДОПИСЫВАЕТСЯ, А НЕ ЗАМЕНЯЕТ. `setIngress` делает PUT всего списка: новое имя, записанное без чтения
// текущих правил, стёрло бы сайт, вход и ядро разом. Поэтому сначала читаются правила туннеля, затем к ним
// добавляется одно — и только если такого имени ещё нет.

/** Правила туннеля (без последнего «всё прочее — 404»). */
export async function getIngress(token: string, accountId: string, tunnelId: string) {
  const r = await send<{ config?: { ingress?: Array<{ hostname?: string; service: string }> } }>(
    "GET", `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`, token,
  )
  if (!r.ok) return r
  const rules = (r.result?.config?.ingress ?? []).filter((x): x is IngressRule => typeof x.hostname === "string" && !!x.hostname)
  return { ok: true as const, result: rules }
}

/** Есть ли в зоне запись с этим именем (любого типа). */
export async function hasDnsRecord(token: string, zoneId: string, name: string) {
  const r = await send<Array<{ id: string; type: string; content: string }>>(
    "GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}`, token,
  )
  if (!r.ok) return r
  return { ok: true as const, result: r.result.length > 0 }
}

/**
 * Снять все DNS-записи с этим именем (325-5: удаление элемента снимает его поддомен). Возвращает, сколько снято. Имени нет —
 * 0 и ok: снимать нечего — это не отказ.
 */
export async function deleteDnsRecords(token: string, zoneId: string, name: string) {
  const list = await send<Array<{ id: string }>>("GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}`, token)
  if (!list.ok) return list
  let removed = 0
  for (const rec of list.result) {
    const r = await send<{ id: string }>("DELETE", `/zones/${zoneId}/dns_records/${rec.id}`, token)
    if (!r.ok) return r
    removed += 1
  }
  return { ok: true as const, result: removed }
}

// ── АДРЕСНЫЕ ЗАПИСИ ИМЕНИ, ПОДКЛЮЧАЕМОГО К ЭЛЕМЕНТУ (324-3) ─────────────────
//
// 🔒 СНИМАЕТСЯ ТОЛЬКО ТО, ЧТО НАПРАВЛЯЕТ ИМЯ: A и AAAA на подключаемом имени мешают CNAME туннеля (Cloudflare не держит их
// рядом). Почта (MX), TXT и всё прочее на этом имени — данные человека и не трогаются. При отключении снимается только
// наша CNAME на туннель узла — не «все записи имени», как у удаления поддомена элемента (325-5): на корне домена рядом
// живут почтовые и проверочные записи.

/** Снять записи A и AAAA с этим именем — перед заведением CNAME туннеля. */
export async function deleteAddressRecords(token: string, zoneId: string, name: string) {
  let removed = 0
  for (const type of ["A", "AAAA"]) {
    const list = await send<Array<{ id: string }>>("GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&type=${type}`, token)
    if (!list.ok) return list
    for (const rec of list.result) {
      const r = await send<{ id: string }>("DELETE", `/zones/${zoneId}/dns_records/${rec.id}`, token)
      if (!r.ok) return r
      removed += 1
    }
  }
  return { ok: true as const, result: removed }
}

/** Снять только CNAME этого имени, ведущую на туннель узла. */
export async function deleteTunnelRecord(token: string, zoneId: string, name: string, tunnelId: string) {
  const list = await send<Array<{ id: string; content: string }>>("GET", `/zones/${zoneId}/dns_records?name=${encodeURIComponent(name)}&type=CNAME`, token)
  if (!list.ok) return list
  let removed = 0
  for (const rec of list.result.filter((x) => x.content === `${tunnelId}.cfargotunnel.com`)) {
    const r = await send<{ id: string }>("DELETE", `/zones/${zoneId}/dns_records/${rec.id}`, token)
    if (!r.ok) return r
    removed += 1
  }
  return { ok: true as const, result: removed }
}

/** Аккаунты, которые видит ключ (324-2: первый домен — зоны ещё нет, аккаунт узнаётся у ключа). Пусто — ключу не дано
 *  право чтения аккаунта; тогда человек называет Account ID сам. */
export async function listAccounts(token: string) {
  const r = await send<Array<{ id: string; name: string }>>("GET", "/accounts?per_page=50", token)
  if (!r.ok) return r
  return { ok: true as const, result: r.result.map((a) => ({ id: a.id, name: a.name })) }
}
