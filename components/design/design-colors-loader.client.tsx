"use client"

import { useEffect, useState } from "react"
import { DesignColors } from "./design-colors.client"
import type { DesignUi } from "./design.i18n"

// ЦВЕТА САЙТА, СПРОШЕННЫЕ В БРАУЗЕРЕ (280-6).
//
// 🔒 ПОЧЕМУ ЗАГРУЗЧИК, А НЕ ЗНАЧЕНИЯ С СЕРВЕРА. Страница слоя архитектора предрендерена, а цвета —
// настройка САЙТА, которую меняют без пересборки ядра: прочитанные на сборке, они застыли бы в HTML
// и показывали бы прошлый выбор. Поэтому островок спрашивает дверь ядра, а та — дверь сайта.
//
// 🛑 ТРИ СОСТОЯНИЯ, И «САЙТ НЕ ОТВЕТИЛ» — НЕ «ЦВЕТОВ НЕТ». Нарисовать пустую палитру при отказе
// значило бы предложить человеку сохранить её поверх настоящей.

type Colors = { light: Record<string, string>; dark: Record<string, string> }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function DesignColorsLoader({ ui, loading, unavailable }: { ui: DesignUi["colors"]; loading: string; unavailable: string }) {
  const [state, setState] = useState<{ colors: Colors } | "loading" | "failed">("loading")

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/architect/design-config`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { config?: { colors?: Partial<Colors> } }) => {
        if (!alive) return
        const c = d.config?.colors ?? {}
        setState({ colors: { light: c.light ?? {}, dark: c.dark ?? {} } })
      })
      .catch(() => alive && setState("failed"))
    return () => {
      alive = false
    }
  }, [])

  if (state === "loading") return <p className="text-muted-foreground text-sm">{loading}</p>
  if (state === "failed") return <p className="text-muted-foreground text-sm" data-design-unavailable>{unavailable}</p>
  return <DesignColors initial={state.colors} ui={ui} />
}
