// УСТАНОВКА «СТАНДАРТНОГО ХЕДЕРА» В СЛУЖБУ (шаг 283-2).
//
//   npm run header-kit:add -- <папка исходника службы>            служба на Next
//   npm run header-kit:add -- <папка исходника службы> --express  служба на Express
//
// 🔒 СТАВИТСЯ В ИСХОДНИК СЛУЖБЫ (её репозиторий или форк), А НЕ В AGI-ITEMS/: папка элемента — клон по
// тегу, и переустановка вернула бы её к тегу. Дальше — коммит, тег, строка версии в agi-items.json.
// Мастер один — эта папка; копия в службе руками не правится.

import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const target = args.find((a) => !a.startsWith('--'))
const express = args.includes('--express')

if (!target || !existsSync(target)) {
  console.error('header-kit: укажите папку исходника службы, которая существует')
  process.exit(1)
}

const variant = express ? 'express' : 'next'
const from = join(here, 'master', variant)
cpSync(from, resolve(target), { recursive: true })

console.log(`header-kit: стандартный хедер (${variant}) поставлен в ${resolve(target)}`)
if (express) {
  console.log('  подключение: import { loadProjectMenu, renderProjectHeader, PROJECT_HEADER_CSS } from "./project-header.mjs"')
} else {
  console.log('  подключение: import { ProjectHeader } from "@/components/fractera/project-header"')
  console.log('               <ProjectHeader lang={lang} brand="…" /> в корневом макете')
}
console.log('  окружение службы (установщик узла выдаёт сам, род derived): PROJECT_MENU_URL, PROJECT_SITE_URL')
console.log('===HEADER_KIT_OK===')
