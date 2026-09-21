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


type Method = "GET" | "POST" | "PUT"

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
export async function setIngress(token: string, accountId: string, tunnelId: string, hostname: string, service: string) {
  return send<unknown>("PUT", `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`, token, {
    config: { ingress: [{ hostname, service }, { service: "http_status:404" }] },
  })
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
