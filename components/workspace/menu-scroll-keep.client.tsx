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

    // 445-1 (слово владельца 2026-10-11): «если я открываю кнопка в левом меню раскрывается список то левый список должен
    // плавно прокрутиться до того момента пока самый нижний элемент этого списка не окажется в фокусе». Группы — серверные
    // `<details>`; раскрытая внизу группа падала за нижний край меню, и казалось, что ничего не произошло. Двигается только
    // само меню. 🛑 Плавная прокрутка в браузере владельца бывает инертной (замер 264-4) — нет сдвига за 150 мс, довозим сразу.
    const onToggle = (e: Event) => {
      const group = e.target
      if (!(group instanceof HTMLDetailsElement) || !group.open || !nav.contains(group)) return
      const items = group.querySelectorAll<HTMLElement>("a, summary")
      const last = items[items.length - 1]
      if (!last) return
      const over = last.getBoundingClientRect().bottom - nav.getBoundingClientRect().bottom
      if (over <= 0) return
      const to = nav.scrollTop + over + 8
      const before = nav.scrollTop
      nav.scrollTo({ top: to, behavior: "smooth" })
      window.setTimeout(() => {
        if (Math.abs(nav.scrollTop - before) < 2) nav.scrollTop = to
      }, 150)
    }
    // `toggle` не всплывает — ловим на погружении.
    nav.addEventListener("toggle", onToggle, true)

    // 445-2 (слово владельца 2026-10-11, выбор «Всегда к контейнеру»): страница с меню встаёт так, что верхний край правого
    // контейнера (`[data-workspace]`) — сразу под закреплённой шапкой сайта, а не у заголовка страницы. Адрес с `#якорем`
    // главнее: ссылка на раздел страницы ведёт к разделу.
    const align = () => {
      if (window.location.hash) return
      const box = document.querySelector<HTMLElement>("[data-workspace]")
      if (!box) return
      const header = document.querySelector<HTMLElement>("header")
      const offset = header && getComputedStyle(header).position === "sticky" ? header.getBoundingClientRect().bottom : 0
      const top = Math.max(0, Math.round(box.getBoundingClientRect().top + window.scrollY - offset))
      if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top, behavior: "auto" })
    }
    // Next после перехода сам прокручивает к новому содержимому — наше выравнивание идёт после него.
    const frame = requestAnimationFrame(() => requestAnimationFrame(align))
    const late = window.setTimeout(align, 300)

    return () => {
      nav.removeEventListener("scroll", onScroll)
      nav.removeEventListener("toggle", onToggle, true)
      cancelAnimationFrame(frame)
      window.clearTimeout(late)
    }
  }, [])

  return null
}
