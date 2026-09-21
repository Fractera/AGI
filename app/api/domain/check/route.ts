// @api check publicly whether the domain already points at Cloudflare nameservers
import { NextResponse, type NextRequest } from "next/server"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"

// ПРОВЕРКА ТРЕТЬЕЙ СТУПЕНИ — БЕЗ ЕДИНОГО КЛЮЧА (259-1, дополнено 2026-09-21).
//
// 🔒 ПОЧЕМУ ЭТО ВОЗМОЖНО БЕЗ ТОКЕНА, И ПОЧЕМУ ЭТО ВАЖНО. Серверы имён домена —
// публичное знание: их отдаёт любой резолвер всему интернету. Значит «сменил ли
// человек серверы имён» проверяется ДО того, как у узла появился ключ, — а
// ключ создаётся в панели, попасть в которую можно только после этого шага.
// Спрашивать самоотчёт там, где есть измерение, — уступка, за которую платит
// человек: он отметит «сделал», а дальше ничего не заработает без объяснения.
//
// 🔒 СПРАШИВАЕТСЯ КОРЕНЬ ДОМЕНА, А НЕ ВВЕДЁННОЕ ИМЯ. Серверы имён живут у зоны:
// у `www.example.com` их нет, они у `example.com`. Спроси мы введённое имя —
// получили бы пустой ответ и объявили бы неудачей верную настройку.
//
// 🛑 ОТВЕТ РЕЗОЛВЕРА — ДАННЫЕ, А НЕ ПРИГОВОР. `Status: 3` (имени нет) у свежего
// домена законен: запись ещё не разошлась. Поэтому «не Cloudflare» и «ещё не
// видно» — разные ответы с разным текстом для человека.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const STATE_FILE = join(ROOT, "logs", "domain.json")
const DOH = "https://cloudflare-dns.com/dns-query"

/** Корень зоны: последние две части имени. Для `a.b.example.com` — `example.com`. */
function apex(hostname: string): string {
  const parts = hostname.split(".").filter(Boolean)
  return parts.length <= 2 ? hostname : parts.slice(-2).join(".")
}

function readState(): Record<string, unknown> {
  if (!existsSync(STATE_FILE)) return {}
  try { return JSON.parse(readFileSync(STATE_FILE, "utf8")) as Record<string, unknown> } catch { return {} }
}

function remember(patch: Record<string, unknown>) {
  mkdirSync(join(ROOT, "logs"), { recursive: true })
  let prev: Record<string, unknown> = {}
  if (existsSync(STATE_FILE)) {
    try { prev = JSON.parse(readFileSync(STATE_FILE, "utf8")) } catch { /* пустое — перезапишем */ }
  }
  writeFileSync(STATE_FILE, `${JSON.stringify({ ...prev, ...patch }, null, 2)}\n`, "utf8")
}

export async function POST(req: NextRequest) {
  let hostname = ""
  // 🔒 ЗАПОМНИТЬ ИМЯ И ПРОВЕРИТЬ ПРИВЯЗКУ — РАЗНЫЕ ПРОСЬБЫ, И ИХ РАЗДЕЛИЛ
  // ВЛАДЕЛЕЦ 2026-09-21: «на первом действии ты проверяешь результат, который
  // может появиться только после третьего действия». Он прав: на первой ступени
  // человек только НАЗЫВАЕТ домен, и отвечать ему «не указывает на Cloudflare»
  // там — значит объявлять неудачей то, чего он ещё не делал.
  let verify = true
  try {
    const body = (await req.json()) as { hostname?: unknown; verify?: unknown }
    if (body.verify === false) verify = false
    hostname = typeof body.hostname === "string"
      ? body.hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : ""
  } catch { return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 }) }

  if (!hostname || !hostname.includes(".") || /\s/.test(hostname)) {
    return NextResponse.json({ ok: false, reason: "bad-hostname" }, { status: 400 })
  }

  // 🛑 СМЕНИЛОСЬ ИМЯ — ПРЕЖНЯЯ ПРОВЕРКА БОЛЬШЕ НЕ О ЧЁМ. ✗ оплачено 2026-09-21:
  // один домен был проверен и признан привязанным, потом человек ввёл ДРУГОЙ — и
  // лестница показала третью ступень закрытой галочкой, хотя новый домен не
  // проверялся никогда. Отметка о проверке принадлежит ИМЕНИ, а не узлу; пережив
  // смену имени, она превращается в уверенную неправду.
  const previous = readState()
  const changed = typeof previous.wanted === "string" && previous.wanted !== hostname
  if (changed) remember({ wanted: hostname, nsVerifiedAt: null, zone: null })
  else remember({ wanted: hostname })

  // Просили только запомнить — на том и остановимся. Ответ честно говорит, что
  // привязка НЕ проверялась, а не выдаёт отсутствие проверки за отрицательный
  // результат.
  if (!verify) return NextResponse.json({ ok: true, hostname, saved: true, checked: false })

  const zone = apex(hostname)
  let answer: Array<{ data?: string }> = []
  let status = -1
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(zone)}&type=NS`, {
      headers: { accept: "application/dns-json" },
      cache: "no-store",
    })
    const body = (await res.json()) as { Status?: number; Answer?: Array<{ data?: string }> }
    status = typeof body.Status === "number" ? body.Status : -1
    answer = body.Answer ?? []
  } catch (e) {
    return NextResponse.json({
      ok: false, reason: `network:${e instanceof Error ? e.message : "unknown"}`, hostname, zone,
    }, { status: 200 })
  }

  const nameservers = answer.map((a) => (a.data ?? "").replace(/\.$/, "").toLowerCase()).filter(Boolean)
  const onCloudflare = nameservers.length > 0 && nameservers.every((n) => n.endsWith("ns.cloudflare.com"))

  if (onCloudflare) remember({ nsVerifiedAt: new Date().toISOString(), zone })

  return NextResponse.json({
    ok: true,
    hostname,
    zone,
    onCloudflare,
    // Имени ещё нет в мире — это не «не Cloudflare», а «слишком рано».
    unknown: nameservers.length === 0,
    dnsStatus: status,
    nameservers,
  })
}
