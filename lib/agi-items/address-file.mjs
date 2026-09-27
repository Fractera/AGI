// АДРЕС AGI ЭЛЕМЕНТА — ОДНО МЕСТО ЧТЕНИЯ (325-8). Адрес живёт у элемента: `data/services/<id>/address.json` (325-3); нет файла —
// адрес равен id. Отсюда его берут все, кто строит имя элемента: страницы и меню ядра, поддомен в интернете (дверь `reach`),
// удаление, Preview и установщик (`services-install.mjs`, голый `node` — поэтому `.mjs`).
//
// 🔒 ПОДДОМЕН ЭЛЕМЕНТА = ЕГО АДРЕС. ✗ Оплачено 2026-09-27: владелец переименовал ещё не подключённый элемент (mzjce → roman),
// меню и адресная строка сменились, а карточка «Адрес в интернете» предлагала подключить `mzjce.<зона>` — поддомен строился из
// id в пяти местах. Прежние элементы без своего адреса не меняются: их адрес и есть id.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isElementAddress } from './dns-label.mjs'

/** Адрес элемента (нет своего — id). `root` — корень узла (по умолчанию каталог запуска). */
export function addressOf(id, root = process.cwd()) {
  try {
    const a = JSON.parse(readFileSync(join(root, 'data', 'services', id, 'address.json'), 'utf8')).address
    return typeof a === 'string' && isElementAddress(a) ? a : id
  } catch {
    return id
  }
}
