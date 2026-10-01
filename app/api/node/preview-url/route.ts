// @api tell the address where an element of this node can be previewed
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { getService, serviceUrl } from "@/lib/microservices/registry"
import { publicAuth } from "@/lib/domain/public-auth.cjs"
import { addressOf } from "@/lib/agi-items/address-file.mjs"
import { domainRecord } from "@/lib/agi-items/element-domain"

// АДРЕС ДЛЯ ПРОСМОТРА ЭЛЕМЕНТА (страница Preview, слово владельца 2026-09-24).
//
// 🔒 АДРЕС — ТОТ, ДО КОТОРОГО ДОТЯНЕТСЯ БРАУЗЕР ЧЕЛОВЕКА, А НЕ СЕРВЕР. На своём домене: сайт — корень
// зоны, вход — `auth.<зона>`. Без домена — петля машины: человек открыл ядро на этом же компьютере.
// У элемента без публичного имени (данные) — петля, и ответ говорит `public: false`: с чужого компьютера
// такой адрес не откроется, и страница обязана это сказать, а не показать пустую рамку молча.
export const dynamic = "force-dynamic"


/** Есть ли у имени запись A в DNS Cloudflare: true / false, или null — DNS не ответил. */
async function hasPublicName(host: string): Promise<boolean | null> {
  try {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=A`, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    })
    const j = (await r.json()) as { Answer?: Array<{ type: number }> }
    return Boolean(j.Answer?.some((a) => a.type === 1))
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const denied = await requireRoles(req, ["architect", "admin"])
  if (denied) return denied
  const id = req.nextUrl.searchParams.get("id") ?? ""
  const local = serviceUrl(id)
  if (!local) return NextResponse.json({ ok: false, reason: "unknown-element" }, { status: 404 })
  const lang = req.nextUrl.searchParams.get("lang") ?? "en"
  const pub = publicAuth(process.cwd())
  let base: string | null = null
  // 🔒 ОДНО ПРАВИЛО ДЛЯ ВСЕХ ЭЛЕМЕНТОВ (владелец 2026-09-25: у «Данных» и «Блоков» просмотр был белым). Здесь стояли
  // поимённо только root и auth — остальные получали http://127.0.0.1:<порт>, а страница ядра на https такой адрес во
  // фрейм не грузит. Формула та же, что у установщика (SERVICE_PUBLIC_URL) и двери /api/node/reach: root — корень зоны,
  // любой другой — <id>.<зона>.
  if (pub) base = id === "root" ? `https://${pub.siteHost}` : `https://${addressOf(id)}.${pub.zone}` // 325-8: по адресу элемента
  // 🔒 ИМЯ ЭЛЕМЕНТА ОБЯЗАНО СУЩЕСТВОВАТЬ, А НЕ ВЫВОДИТЬСЯ ФОРМУЛОЙ (319-2). Рождённому элементу поддомен выдаётся отдельной
  // кнопкой «Адрес в интернете»; до неё формула давала `https://<id>.<зона>`, которого нет (NXDOMAIN), и Preview показывал
  // пустоту. Проверка — DNS Cloudflare (DoH, мимо кэша машины, как у /api/node/reach): записи нет — петля машины и
  // `public: false`. DNS не ответил — «не знаю», оставляем прежний адрес.
  if (base && id !== "root" && (await hasPublicName(new URL(base).hostname)) === false) base = null
  // 324-4/324-5: у элемента подключён свой домен — Preview показывает его главный адрес (второй переадресует туда же).
  const own = domainRecord(id)?.url
  if (own) base = own
  // 2026-10-02 (владелец: белый экран на se2xu…/ru): элемент из репозитория человека — чужой проект без языковых адресов; путь
  // `/<язык>` есть только у наших стартеров. Mosaic Lite на `/ru`: «No routes matched location "/ru"» — пустая страница.
  const fromRepo = (getService(id) as { born?: { from?: string } } | null)?.born?.from === "repository"
  const url = `${(base ?? local).replace(/\/+$/, "")}/${fromRepo ? "" : lang}`
  return NextResponse.json({ ok: true, url, public: !!base }, { headers: { "Cache-Control": "no-store" } })
}
