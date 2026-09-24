import "server-only"
import { serviceUrl } from "@/lib/microservices/registry"
import { publicAuth } from "@/lib/domain/public-auth.cjs"
import type { MenuGroup } from "@/lib/menu/group-menus"

// МЕНЮ ПРОЕКТА, ВЗЯТОЕ У САЙТА (283-1).
//
// Слово владельца 2026-09-24: «на всю глубину проекта все сервисы используют одно и то же меню». Меню —
// настройка сайта (элемент root); сайт отдаёт его статической дверью `/api/menu/<язык>`, и ядро рисует его
// у себя. Сервер ядра спрашивает сайт по петле машины, а ссылки делает абсолютными на тот адрес, до
// которого дотянется браузер человека: на своём домене — корень зоны, иначе петля с портом сайта.
//
// 🔒 ЧИТАЕТСЯ НА СБОРКЕ ЯДРА — страницы архитектора предрендерены. Меню меняется вместе с развёртыванием.
// Сайт не ответил — `null`, и шапка ядра рисует своё прежнее меню, а не пустую полосу.

type Answer = { top?: MenuGroup[]; footer?: MenuGroup[] }

function siteBase(): string | null {
  const pub = publicAuth(process.cwd())
  if (pub?.architectHost) return `https://${pub.siteHost}`
  return serviceUrl("root")?.replace("127.0.0.1", "localhost") ?? null
}

function absolute(groups: MenuGroup[], base: string, lang: string): MenuGroup[] {
  return groups.map((g) => {
    if (g.inert) return g
    const own = `${base}/${lang}${g.href ?? `/${g.slug}`}`
    return {
      ...g,
      href: own,
      children: g.children.map((c) => ({ ...c, href: `${base}/${lang}${c.href ?? `${g.href ?? `/${g.slug}`}/${c.slug}`}` })),
    }
  })
}

export async function siteMenu(lang: string): Promise<{ top: MenuGroup[]; footer: MenuGroup[] } | null> {
  const local = serviceUrl("root")
  const base = siteBase()
  if (!local || !base) return null
  try {
    const res = await fetch(`${local.replace(/\/+$/, "")}/api/menu/${lang}`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const data = (await res.json()) as Answer
    if (!Array.isArray(data.top)) return null
    return { top: absolute(data.top, base, lang), footer: absolute(data.footer ?? [], base, lang) }
  } catch {
    return null
  }
}
