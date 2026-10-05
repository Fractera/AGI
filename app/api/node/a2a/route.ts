// @api find which node element can do a job and where
import { timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/auth/require-roles"
import { findEntries, nodeEntries } from "@/lib/a2a/node-registry"
import { telegramConnected } from "@/lib/a2a/telegram-relay"

// ДВЕРЬ «НАЙТИ / ПОЛУЧИТЬ» РЕЕСТРА A2A УЗЛА (шаг 406-6). Ядро — центр обнаружения; вызов соседа идёт напрямую по адресу из
// ответа. `?q=<слова или способность>` — до 10 записей (уровень 1) по убыванию совпадения; `?address=<адрес>` — одна запись;
// без параметров — все. Кто вправе: элемент узла с ключом узла (`X-Node-Key`) или архитектор/админ.
// Состояние записи: fresh — реестр совпадает с визиткой; drift — визитка изменилась, а describe:publish не звали;
// unpublished — визитка есть, в реестре её нет; no-card — в реестре есть, визитки больше нет.
// `telegram` — подключён ли бот элемента (токен и допущенный), измеряется по его папке при запросе (408-5): реестр и визитка
// элемента читают одну и ту же папку, поэтому не расходятся.
export const dynamic = "force-dynamic"

function nodeKeyOk(given: string | null): boolean {
  const expected = process.env.SETTINGS_SECRET ?? ""
  if (!expected || !given) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

const withTelegram = <T extends { id: string }>(e: T) => ({ ...e, telegram: telegramConnected(e.id) })

export async function GET(req: NextRequest) {
  if (!nodeKeyOk(req.headers.get("x-node-key"))) {
    const denied = await requireRoles(req, ["architect", "admin"])
    if (denied) return denied
  }
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  const address = req.nextUrl.searchParams.get("address")?.trim() ?? ""
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10) || 10
  const headers = { "Cache-Control": "no-store" }
  if (address) {
    const e = nodeEntries().find((x) => x.address === address || x.id === address)
    return e ? NextResponse.json({ ok: true, entry: withTelegram(e) }, { headers }) : NextResponse.json({ ok: false, error: "not-found" }, { status: 404, headers })
  }
  if (q) {
    const found = findEntries(q, limit)
    // Уровень 0 (M2M): не нашлось в узле ≠ не существует; выход в сеть узлов пока недоступен — говорится прямо.
    return NextResponse.json({ ok: true, entries: found.map(withTelegram), outside: found.length ? null : "not found in this node; search on other nodes is not available yet" }, { headers })
  }
  return NextResponse.json({ ok: true, entries: nodeEntries().map(withTelegram) }, { headers })
}
