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
