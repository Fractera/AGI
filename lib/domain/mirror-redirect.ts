import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { addressOf } from "@/lib/agi-items/address-file.mjs"

// ПЕРЕАДРЕСАЦИЯ НА ГЛАВНОЕ ЗЕРКАЛО ЭЛЕМЕНТА (324-4). Выбор владельца по плану — «Ядро отвечает 301»: при подключении домена
// правила туннеля ведут `www.<домен>` и прежний поддомен элемента на порт ядра, а ядро по имени хоста отвечает 301 на
// `https://<домен><путь>?<запрос>`. Новые права ключа Cloudflare не нужны.
//
// 🔒 ИСТОЧНИК — ЗАПИСЬ ЭЛЕМЕНТА `data/services/<id>/domain.json` (её пишет «Подключить», стирает «Отключить»), а не второй
// список: отключили домен — переадресация исчезла тем же движением. Зона узла — `logs/domain.json`.
// 🛑 Пути с точкой (файлы) до proxy.ts не доходят (matcher ядра), поэтому прямые ссылки на файлы старого поддомена не
// переадресуются: сами страницы элемента берут файлы относительными путями, на домене они грузятся с домена.

function nodeZone(root: string): string | null {
  try {
    const z = (JSON.parse(readFileSync(join(root, "logs", "domain.json"), "utf8")) as { zone?: unknown }).zone
    return typeof z === "string" && z ? z : null
  } catch { return null }
}

/** Домен, на который надо переадресовать этот хост, или `null`. */
export function mirrorTarget(hostHeader: string | null, root = process.cwd()): string | null {
  const host = (hostHeader ?? "").trim().toLowerCase().replace(/:\d+$/, "")
  if (!host.includes(".")) return null
  let ids: string[] = []
  try { ids = readdirSync(join(root, "data", "services")) } catch { return null }
  const zone = nodeZone(root)
  for (const id of ids) {
    let domain: unknown
    try { domain = (JSON.parse(readFileSync(join(root, "data", "services", id, "domain.json"), "utf8")) as { domain?: unknown }).domain } catch { continue }
    if (typeof domain !== "string" || !domain) continue
    if (host === `www.${domain}`) return domain
    if (zone && (host === `${addressOf(id, root)}.${zone}` || host === `${id}.${zone}`)) return domain
  }
  return null
}
