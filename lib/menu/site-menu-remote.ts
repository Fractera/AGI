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

// 🔒 ОДИН ЗАПРОС НА ЯЗЫК ЗА ПРОЦЕСС, ПОВТОР И ГРОМКИЙ ОТКАЗ (283-4). ✗ Измерено: ядро, собранное в 283-3,
// нарисовало своё запасное меню (4 кнопки из 9 — одни заглушки), и сборка прошла зелёной — откат был
// молчаливым. Сотни страниц спрашивали сайт каждая сама под нагрузкой сборки. Теперь ответ один на язык,
// неудача повторяется, а окончательный отказ печатается в журнал сборки с причиной.
const memo = new Map<string, Promise<{ top: MenuGroup[]; footer: MenuGroup[] } | null>>()

async function ask(url: string): Promise<Answer> {
  let last: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as Answer
      if (!Array.isArray(data.top)) throw new Error("no top in answer")
      return data
    } catch (err) {
      last = err
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  throw last
}

export function siteMenu(lang: string): Promise<{ top: MenuGroup[]; footer: MenuGroup[] } | null> {
  const hit = memo.get(lang)
  if (hit) return hit
  const local = serviceUrl("root")
  const base = siteBase()
  const job = (async () => {
    if (!local || !base) {
      console.warn(`[site-menu] ${lang}: адрес сайта неизвестен — ядро рисует своё меню`)
      return null
    }
    const url = `${local.replace(/\/+$/, "")}/api/menu/${lang}`
    try {
      const data = await ask(url)
      return { top: absolute(data.top ?? [], base, lang), footer: absolute(data.footer ?? [], base, lang) }
    } catch (err) {
      console.warn(`[site-menu] ${lang}: сайт не ответил (${url}: ${err instanceof Error ? err.message : err}) — ядро рисует своё меню`)
      return null
    }
  })()
  memo.set(lang, job)
  return job
}
