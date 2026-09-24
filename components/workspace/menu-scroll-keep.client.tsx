"use client"

import { useEffect } from "react"

// ЛЕВОЕ МЕНЮ ПОМНИТ СВОЮ ПРОКРУТКУ МЕЖДУ СТРАНИЦАМИ (285-0).
//
// Жалоба владельца 2026-09-24: «был на 25-й кнопке сверху нажал её и снова вижу восемь первых кнопок
// прокручиваю вниз чтобы нажать 26-ю». Ссылки меню — уже `next/link` (253-3); причина не в теге. Меню —
// блок с СОБСТВЕННОЙ прокруткой, и рисует его каждая страница сама, а не общий макет: при переходе блок
// создаётся заново, и его прокрутка — ноль.
//
// 🔒 ОСТРОВОК НИЧЕГО НЕ РИСУЕТ И НЕ ВЛАДЕЕТ МАРШРУТОМ: меню остаётся серверной разметкой и работает без
// JavaScript. Он запоминает `scrollTop` меню на время вкладки (sessionStorage) и возвращает его на новой
// странице; если активный пункт после этого вне видимой части — доводит его в поле зрения.
const KEY = "wsx-menu-scroll"

export function MenuScrollKeep() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-workspace-menu]")
    if (!nav) return

    try {
      const saved = Number(sessionStorage.getItem(KEY))
      if (Number.isFinite(saved) && saved > 0) nav.scrollTop = saved
    } catch {
      /* хранилище недоступно — меню просто начинается сверху */
    }

    const active = nav.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) {
      const a = active.getBoundingClientRect()
      const n = nav.getBoundingClientRect()
      if (a.top < n.top || a.bottom > n.bottom) active.scrollIntoView({ block: "nearest" })
    }

    const onScroll = () => {
      try {
        sessionStorage.setItem(KEY, String(nav.scrollTop))
      } catch {
        /* нет хранилища — нечего запоминать */
      }
    }
    nav.addEventListener("scroll", onScroll, { passive: true })
    return () => nav.removeEventListener("scroll", onScroll)
  }, [])

  return null
}
