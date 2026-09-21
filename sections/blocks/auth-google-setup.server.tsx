import type { SectionRenderer } from '@/sections/contract'
import { GoogleSetup } from '@/components/auth/google-setup.client'

// Экран включения входа через Google (265-2).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ. Страницы коллекции собираются из блоков
// каталога; работающая часть входит туда своим видом, как `domainLadder` или
// `servicePort`. Вставь мы островок мимо каталога — появился бы второй способ
// класть на страницу живое, и всё, что читает `SECTIONS.json`, о нём бы не знало.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ: рисовальщик серверный, язык известен странице, и
// словарь остаётся на сервере целиком.
export const authGoogleSetup: SectionRenderer<'authGoogleSetup'> = (b, { key: k }) => (
  <GoogleSetup key={k} words={b.words} />
)
