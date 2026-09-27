import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { addressOf } from "@/lib/agi-items/address-file.mjs"

// ПЕРЕАДРЕСАЦИЯ НА ГЛАВНЫЙ АДРЕС ЭЛЕМЕНТА (324-4, 324-5). Выбор владельца по плану — «Ядро отвечает 301»: правила туннеля
// ведут второстепенные имена элемента на порт ядра, а ядро по имени хоста отвечает 301 на главный адрес с тем же путём.
//   главный — домен:   `www.<домен>` и поддомен элемента → `https://<домен>`;
//   главный — поддомен: `<домен>` и `www.<домен>` → `https://<адрес>.<зона>`.
//
// 🔒 ИСТОЧНИК — ЗАПИСЬ ЭЛЕМЕНТА `data/services/<id>/domain.json` (её пишут «Подключить» и «Главный адрес», стирает
// «Отключить»), а не второй список: отключили домен — переадресация исчезла тем же движением. Зона узла — `logs/domain.json`.
// 🛑 Пути с точкой (файлы) до proxy.ts не доходят (matcher ядра), поэтому прямые ссылки на файлы второстепенного имени не
// переадресуются: сами страницы элемента берут файлы относительными путями, на главном адресе они грузятся с него.

function nodeZone(root: string): string | null {
  try {
    const z = (JSON.parse(readFileSync(join(root, "logs", "domain.json"), "utf8")) as { zone?: unknown }).zone
    return typeof z === "string" && z ? z : null
  } catch { return null }
}

/** Главный адрес (имя хоста), на который надо переадресовать этот хост, или `null`. */
export function mirrorTarget(hostHeader: string | null, root = process.cwd()): string | null {
  const host = (hostHeader ?? "").trim().toLowerCase().replace(/:\d+$/, "")
  if (!host.includes(".")) return null
  let ids: string[] = []
  try { ids = readdirSync(join(root, "data", "services")) } catch { return null }
  const zone = nodeZone(root)
  for (const id of ids) {
    let rec: { domain?: unknown; primary?: unknown }
    try { rec = JSON.parse(readFileSync(join(root, "data", "services", id, "domain.json"), "utf8")) } catch { continue }
    const domain = rec.domain
    if (typeof domain !== "string" || !domain) continue
    const subs = zone ? [`${addressOf(id, root)}.${zone}`, `${id}.${zone}`] : []
    if (rec.primary === "subdomain" && subs.length > 0) {
      if (host === domain || host === `www.${domain}`) return subs[0]
    } else {
      if (host === `www.${domain}` || subs.includes(host)) return domain
    }
  }
  return null
}
