"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Lightbulb, Rocket } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
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

/** Слова двух плашек (280-11a) — приходят с сервера, словарь в браузер не грузится. */
export type DeployWords = {
  hint: string
  savedTitle: string
  savedText: string
  savedButton: string
  deployHref: string
}

export function DesignSectionLoader({
  section,
  ui,
  loading,
  unavailable,
  deploy,
}: {
  section: DesignSection
  ui: DesignUi
  loading: string
  unavailable: string
  deploy: DeployWords
}) {
  const [state, setState] = useState<{ config: Raw } | "loading" | "failed">("loading")
  // 🔒 280-11a: «Сохранить» только записывает настройки сайта; применяет их развёртывание. Слово
  // владельца 2026-09-24: не запускать пересборку после каждой правки — изменил шрифт, сохранил,
  // изменил цвет, сохранил, — а развернуть один раз, когда оформление решено.
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const on = () => setSaved(true)
    window.addEventListener("design:saved", on)
    return () => window.removeEventListener("design:saved", on)
  }, [])

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
  const editor =
    section === "colors" ? <DesignColors initial={{ light: c.colors?.light ?? {}, dark: c.colors?.dark ?? {} }} ui={ui.colors} />
    : section === "fonts" ? <DesignFonts initial={c.fonts ?? {}} ui={ui.fonts} />
    : section === "type" ? <DesignType initial={c.type ?? {}} ui={ui.type} />
    : <DesignShape initial={c.shape ?? {}} ui={ui.shape} />

  return (
    <div className="flex flex-col gap-4">
      <p className="flex gap-2 text-muted-foreground text-sm" data-design-hint>
        <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
        {deploy.hint}
      </p>
      {editor}
      {saved && (
        <div className="flex flex-col gap-3 rounded-md border border-warning/50 bg-warning/10 p-4 text-sm" data-design-saved>
          <p className="font-medium text-foreground">{deploy.savedTitle}</p>
          <p className="text-muted-foreground">{deploy.savedText}</p>
          <div>
            <Link href={deploy.deployHref} className={buttonVariants({ variant: "outline" })}>
              <Rocket className="mr-2 size-4" aria-hidden />
              {deploy.savedButton}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
