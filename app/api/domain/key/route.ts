// @api accept the Cloudflare API token and remember it on the node
import { NextResponse, type NextRequest } from "next/server"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { verifyToken, listZones } from "@/lib/domain/cloudflare"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"

// ДВЕРЬ КЛЮЧА CLOUDFLARE (259-2).
//
// 🛑 КЛЮЧ ПРОВЕРЯЕТСЯ ДО ЗАПИСИ, А НЕ ПОСЛЕ. Записанный и неработающий ключ —
// худшее из состояний: экран покажет «настроен», а следующий шаг молча не
// сработает. Поэтому порядок: проверить у Cloudflare → узнать зоны → записать.
//
// 🔒 ДВЕРЬ ОТКРЫТА ТОЛЬКО ХОЗЯИНУ ЗА КЛАВИАТУРОЙ. Слой архитектора на временном
// публичном адресе открыт любому, кто знает ссылку (решение владельца 241/242 с
// названной ценой). Показывать страницы — одно, принимать ключ от платного
// аккаунта — другое: этого размена владелец не делал.
//
// 🛑 КЛЮЧ НЕ ВОЗВРАЩАЕТСЯ И НЕ ПОПАДАЕТ В ЖУРНАЛ. Ни в ответе, ни в `console`:
// показанный секрет считается раскрытым.

export const dynamic = "force-dynamic"

const ROOT = process.cwd()
const ENV_FILE = join(ROOT, ".env.local")
const KEY_NAME = "CLOUDFLARE_API_TOKEN"

/**
 * Записать переменную в `.env.local`, не тронув остальное.
 * 🔒 Тот же приём, что у `scripts/services-install.mjs`: есть строка — заменить,
 * нет — дописать. Переписывать файл целиком нельзя, в нём живут чужие значения.
 */
function putEnv(name: string, value: string) {
  const existing = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : ""
  const re = new RegExp(`^${name}=.*$`, "m")
  const text = re.test(existing)
    ? existing.replace(re, `${name}=${value}`)
    : `${existing}${existing.endsWith("\n") || existing === "" ? "" : "\n"}${name}=${value}\n`
  writeFileSync(ENV_FILE, text, "utf8")
}

export async function POST(req: NextRequest) {
  // 🛑 ДВЕ РАЗНЫЕ БЕДЫ — ДВА РАЗНЫХ ОТВЕТА (найдено владельцем 2026-09-21).
  // Прежде обе отвечали `not-owner`, и человек, сидящий ЗА ЭТИМ САМЫМ
  // компьютером, читал «это можно сделать только на том компьютере, где работает
  // узел» — то есть чистую неправду. На деле он открыл страницу по публичному
  // адресу туннеля, а узел различает только имя хоста, не человека.
  // Отказ, называющий неверную причину, дороже отказа без причины: он уводит в
  // сторону, и человек ищет несуществующую поломку.
  if (isTemporaryPublicAddress(req)) {
    return NextResponse.json({ ok: false, reason: "temporary-address" }, { status: 403 })
  }
  if (!isOwnerAtMachine(req)) {
    return NextResponse.json({ ok: false, reason: "not-owner" }, { status: 403 })
  }

  let token = ""
  try {
    const body = (await req.json()) as { token?: unknown }
    token = typeof body.token === "string" ? body.token.trim() : ""
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 })
  }
  if (!token) return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 })

  const verified = await verifyToken(token)
  if (!verified.ok) return NextResponse.json({ ok: false, reason: verified.reason }, { status: 400 })
  if (verified.result.status !== "active") {
    return NextResponse.json({ ok: false, reason: `token-${verified.result.status}` }, { status: 400 })
  }

  const zones = await listZones(token)
  if (!zones.ok) return NextResponse.json({ ok: false, reason: zones.reason }, { status: 400 })
  if (zones.result.length === 0) {
    // Токен жив, но не видит ни одной зоны — чаще всего ему не выдали прав на
    // зону. Это отдельная беда с отдельным лечением, и назвать её надо отдельно.
    return NextResponse.json({ ok: false, reason: "no-zones" }, { status: 400 })
  }

  putEnv(KEY_NAME, token)
  process.env[KEY_NAME] = token

  return NextResponse.json({
    ok: true,
    keyTail: token.slice(-4),
    zones: zones.result.map((z) => ({ name: z.name, status: z.status })),
  })
}
