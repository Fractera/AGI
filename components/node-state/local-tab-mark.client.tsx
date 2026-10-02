"use client"

import { useEffect } from "react"
import { isLoopbackHostname } from "@/lib/auth/owner-at-machine"

// ВКЛАДКА ПУЛЬТА НА ЭТОМ КОМПЬЮТЕРЕ ОТЛИЧАЕТСЯ ОТ ВКЛАДКИ В ИНТЕРНЕТЕ (шаг 372). Слово владельца 2026-10-02: «хотелось бы видеть
// чтобы на вкладках браузера отличалась версия которая открыта на локально хосте. Можно было бы сделать мой Фавикон зелёный?
// А в надписи написать терминал Def Mod?» — на петле машины (localhost/127.0.0.1/::1) значок перекрашивается в зелёный ИЗ СВОЕГО
// ЖЕ (силуэт сохраняется: заливка поверх непрозрачных пикселей), к названию — приставка «Этот компьютер ·» (было «Dev mode ·»). Только в браузере, после
// загрузки: страница остаётся статической. Next меняет `<title>` при переходах — наблюдатель возвращает приставку.

// 373 (владелец 2026-10-02, «y to do it» на «Этот компьютер ·»): «Dev mode» читалось как «элементы в режиме разработки», а они
// работают собранными — метка говорит, ГДЕ открыт пульт. Язык — первый сегмент адреса (`/<язык>/…`).
const PREFIXES: Record<string, string> = { en: "This computer · ", ru: "Этот компьютер · " }
const GREEN = "#16a34a"

function greenIcon(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const size = 64
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(null)
      ctx.drawImage(img, 0, 0, size, size)
      ctx.globalCompositeOperation = "source-atop"
      ctx.fillStyle = GREEN
      ctx.fillRect(0, 0, size, size)
      try { resolve(canvas.toDataURL("image/png")) } catch { resolve(null) }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export function LocalTabMark() {
  useEffect(() => {
    if (!isLoopbackHostname(window.location.hostname)) return
    const PREFIX = PREFIXES[window.location.pathname.split("/")[1] ?? ""] ?? PREFIXES.en

    const mark = () => {
      if (!document.title.startsWith(PREFIX)) document.title = PREFIX + document.title
    }
    mark()
    const titleEl = document.querySelector("title")
    const watcher = new MutationObserver(mark)
    if (titleEl) watcher.observe(titleEl, { childList: true, characterData: true, subtree: true })

    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (link?.href) {
      void greenIcon(link.href).then((data) => {
        if (!data) return
        for (const l of document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')) l.href = data
      })
    }
    return () => watcher.disconnect()
  }, [])
  return null
}
