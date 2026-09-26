// ЗАПУСК СЕРВЕРА ЯДРА — оформление проекта из элемента «Дизайн» и подписка на его сигнал (шаг 309). Элемента нет у узла —
// ядро живёт своим DESIGN-CONFIG (его засевает `scripts/sync-site-design.mjs` перед сборкой). Таймеров нет: дальше — только
// по сигналу, то есть в ответ на сохранение человеком.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { hasDesignElement, pullDesign, subscribeToDesign } = await import("./lib/design-follow")
  if (!hasDesignElement()) return
  const r = await pullDesign()
  if (r.ok) console.log(`[design] оформление: ${r.changed ? "получено" : "актуально"}`)
  else console.warn(`[design] оформление не получено: ${r.reason} — работаю по своему DESIGN-CONFIG`)
  const s = await subscribeToDesign("core")
  if (s.ok) console.log(`[design] подписан на сигнал элемента «Дизайн»: ${s.url}`)
  else console.warn(`[design] подписка не удалась: ${s.reason}`)
}
