// ГДЕ СТОИТ УЗЕЛ — ЕДИНСТВЕННОЕ ОБЪЯВЛЕННОЕ СВЕДЕНИЕ ИНДИКАТОРА (276-3).
//
// 🔒 ЭТО НЕ ИЗМЕРЯЕТСЯ НИЧЕМ, И ПРИТВОРЯТЬСЯ ОБРАТНЫМ ЗАПРЕЩЕНО. «Домашний компьютер» и «выделенный
// сервер» — не свойство сети и не свойство машины: тот же Linux, тот же процесс, тот же порт. Угадывать
// по признакам (есть ли монитор, как называется хост, кто провайдер) значит строить прибор, который
// однажды уверенно соврёт. Поэтому узел спрашивает человека и помечает ответ как его слова.
//
// 🔒 ФАЙЛ ЖИВЁТ В `data/`, А НЕ В КОНФИГЕ ПРОДУКТА. Это факт о машине конкретного человека, а не о
// приложении: `data/*` стоит в `.gitignore`, и объявление не уедет ни в репозиторий, ни к гостю.
// Проверено `git check-ignore`: `data/node/place.json` игнорируется правилом `data/*`.
//
// 🛑 ЗНАЧЕНИЕ ПРОВЕРЯЕТСЯ ПРИ ЗАПИСИ И ПРИ ЧТЕНИИ. Файл лежит на диске человека, его можно поправить
// руками; неизвестное слово читается как «не сказано», а не пролезает в индикатор чужим состоянием.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const FILE = path.join(ROOT, 'data', 'node', 'place.json')

/** Где стоит узел. `unknown` — «человек ещё не сказал», а не «нигде». */
export type PlaceKind = 'home' | 'server' | 'unknown'

export type Place = { kind: PlaceKind; source: 'declared' | 'unknown'; changedAt: string | null }

function isKind(value: unknown): value is 'home' | 'server' {
  return value === 'home' || value === 'server'
}

export function readPlace(): Place {
  if (!existsSync(FILE)) return { kind: 'unknown', source: 'unknown', changedAt: null }
  try {
    const raw = JSON.parse(readFileSync(FILE, 'utf8')) as { place?: unknown; changedAt?: unknown }
    if (!isKind(raw.place)) return { kind: 'unknown', source: 'unknown', changedAt: null }
    return { kind: raw.place, source: 'declared', changedAt: typeof raw.changedAt === 'string' ? raw.changedAt : null }
  } catch {
    return { kind: 'unknown', source: 'unknown', changedAt: null }
  }
}

/** Записать объявление. Возвращает `null`, если слово не из списка, — дверь превращает это в отказ. */
export function writePlace(value: unknown): Place | null {
  if (!isKind(value)) return null
  const changedAt = new Date().toISOString()
  mkdirSync(path.dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify({ place: value, changedAt }, null, 2)}\n`)
  return { kind: value, source: 'declared', changedAt }
}
