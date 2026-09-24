"use client"

import { useEffect, useState } from "react"
import { DesignColors } from "./design-colors.client"
import { DesignFonts } from "./design-fonts.client"
import { DesignType } from "./design-type.client"
import { DesignShape } from "./design-shape.client"
import type { DesignUi } from "./design.i18n"

// ОФОРМЛЕНИЕ САЙТА, СПРОШЕННОЕ В БРАУЗЕРЕ (280-6).
//
// 🔒 ПОЧЕМУ ЗАГРУЗЧИК, А НЕ ЗНАЧЕНИЯ С СЕРВЕРА. Страница слоя архитектора предрендерена, а оформление —
// настройка САЙТА (элемента root), которую меняют без пересборки ядра: прочитанное на сборке застыло бы
// в HTML и показывало бы прошлый выбор. Поэтому островок спрашивает дверь ядра, а та — дверь сайта.
// Четыре островка перенесены из fractera-next-starter; начальные значения собираются так же, как там
// собирала их страница (`architect/design/page.tsx` стартера), только из ответа двери.
//
// 🛑 ТРИ СОСТОЯНИЯ, И «САЙТ НЕ ОТВЕТИЛ» — НЕ «НАСТРОЕК НЕТ». Нарисовать пустой редактор при отказе
// значило бы предложить человеку сохранить пустоту поверх настоящих настроек.

export type DesignSection = "colors" | "fonts" | "type" | "shape"

type Raw = {
  colors?: { light?: Record<string, string>; dark?: Record<string, string> }
  fonts?: Record<string, { family: string; import?: string }>
  type?: { scale?: number; leading?: number }
  shape?: { radius?: string; borderWidth?: string; spaceScale?: number; appWidth?: string }
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export function DesignSectionLoader({
  section,
  ui,
  loading,
  unavailable,
}: {
  section: DesignSection
  ui: DesignUi
  loading: string
  unavailable: string
}) {
  const [state, setState] = useState<{ config: Raw } | "loading" | "failed">("loading")

  useEffect(() => {
    let alive = true
    fetch(`${BASE}/api/architect/design-config`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { config?: Raw }) => alive && setState({ config: d.config ?? {} }))
      .catch(() => alive && setState("failed"))
    return () => {
      alive = false
    }
  }, [])

  if (state === "loading") return <p className="text-muted-foreground text-sm">{loading}</p>
  if (state === "failed") return <p className="text-muted-foreground text-sm" data-design-unavailable>{unavailable}</p>

  const c = state.config
  if (section === "colors") return <DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} />
  if (section === "fonts") return <DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} />
  if (section === "type") return <DesignType initial={c.type ?? {}} ui={ui.type} />
  return <DesignShape initial={c.shape ?? {}} ui={ui.shape} />
}
