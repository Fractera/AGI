// УСТАНОВКА «СТАНДАРТНОГО ФУТЕРА» В СЛУЖБУ (шаг 283-3).
//
//   npm run footer-kit:add -- <папка исходника службы>            служба на Next
//   npm run footer-kit:add -- <папка исходника службы> --express  служба на Express
//
// 🔒 СТАВИТСЯ В ИСХОДНИК СЛУЖБЫ (её репозиторий или форк), А НЕ В AGI-ITEMS/: папка элемента — клон по
// тегу, и переустановка вернула бы её к тегу. Дальше — коммит, тег, строка версии в agi-items.json.
// Мастер один — эта папка; копия в службе руками не правится.

import { cpSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const express = args.includes('--express')

if (!target || !existsSync(target)) {
  console.error('footer-kit: укажите папку исходника службы, которая существует')
  process.exit(1)
}

const variant = express ? 'express' : 'next'
// Мастер лежит в kits/footer/master/ в корне узла — вне дерева страниц ядра (как у хедера, 283-2).
const from = join(here, '..', '..', '..', '..', '..', '..', 'kits', 'footer', 'master', variant)
cpSync(from, resolve(target), { recursive: true })

console.log(`footer-kit: стандартный футер (${variant}) поставлен в ${resolve(target)}`)
if (express) {
  console.log('  подключение: import { loadProjectFooter, renderProjectFooter, PROJECT_FOOTER_CSS } from "./project-footer.mjs"')
} else {
  console.log('  подключение: import { ProjectFooter } from "@/components/fractera/project-footer"')
  console.log('               <ProjectFooter lang={lang} brand="…" /> в корневом макете, последним')
}
console.log('  окружение службы (установщик узла выдаёт сам, род derived): PROJECT_MENU_URL, PROJECT_SITE_URL')
console.log('===FOOTER_KIT_OK===')
