import type { SectionRenderer } from '@/sections/contract'
import { ResendSetup } from '@/components/auth/resend-setup.client'

// Экран включения входа письмом через Resend (266-2).
//
// 🔒 ВИД БЛОКА, А НЕ ПРАВКА СТРАНИЦЫ — как `authGoogleSetup`: работающая часть
// входит на страницу своим видом каталога, иначе всё, что читает `SECTIONS.json`,
// о ней бы не знало.
//
// 🔒 СЛОВА ПРИХОДЯТ В БЛОКЕ: рисовальщик серверный, словарь остаётся на сервере.
export const authResendSetup: SectionRenderer<'authResendSetup'> = (b, { key: k }) => (
  <ResendSetup key={k} words={b.words} />
)
