"use client"

import { useEffect, useState } from "react"

// PREVIEW В МАСШТАБЕ ЭКРАНА АРХИТЕКТОРА (шаг 334, слово владельца 2026-09-28: «правильно чтобы внутри тоже была ширина 1250
// … применить отрицательное масштабирование … чтобы и шрифты и все уменьшилось пропорционально»; «масштаб всегда, без
// переключателя»).
//
// 🔒 ЗАЧЕМ. Фрейм Preview уже окна ядра: левое меню забирает место, и на экране 1250 фрейм получал 882. Страница элемента
// решает раскладку по СВОЕЙ ширине — лендинг при <1024 прячет чат, — и архитектор видел планшетную версию, принимая её за
// старую. Теперь фрейм получает логическую ширину окна ядра (ту, что страница получила бы в своей вкладке), а готовая
// картинка уменьшается `transform: scale` до места, которое есть. Логическая высота — место по высоте, делённое на масштаб:
// иначе первый экран, считаемый от высоты окна (`100dvh`), выходил бы короче настоящего.
//
// Пересчёт — только на изменение размеров (окно, место под фрейм): это ответ на действие человека, не опрос.

export type ScreenScale = { width: number; height: number; scale: number }

export function useScreenScale<T extends HTMLElement>() {
  // Место под фрейм появляется не сразу (сначала «загрузка»), поэтому мера цепляется ref-функцией, а не эффектом монтирования.
  const [box, boxRef] = useState<T | null>(null)
  const [fit, setFit] = useState<ScreenScale | null>(null)

  useEffect(() => {
    if (!box) return
    const measure = () => {
      const w = box.clientWidth
      const h = box.clientHeight
      if (!w || !h) return
      const width = Math.max(w, window.innerWidth)
      const scale = w / width
      setFit({ width, height: Math.round(h / scale), scale })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [box])

  return { boxRef, fit }
}
