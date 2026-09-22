import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { Block } from '@/lib/content/blocks/types'

// СОДЕРЖИМОЕ ВКЛАДКИ «ГОТОВЫЕ РЕШЕНИЯ» (270; из карточек решений — 271).
//
// 🎯 Слово владельца 2026-09-22: «созданные здесь готовые технические решения позволяют создавать новые
// микросервисы без необходимости программировать базовые инструменты» — аккордеон, открыта одна полоса,
// список не выше 1000 px, подробности — в окне по иконке открытой книги.
//
// 🔒 СПИСОК РЕШЕНИЙ — ЭТО ПАПКИ, А НЕ СЛОВАРЬ (271). Каждое решение живёт в `kits/_<имя>/` и несёт рядом с
// кодом карточку `kit.json` со своими словами. Вкладка обходит папки при сборке: новое решение появляется
// здесь само, удалённое — исчезает само. 🪦 В 270 здесь стоял рукописный словарь `_data/ui.i18n.ts` — второй
// список рядом с кодом и описание вдали от него; закон «What goes on a page» это запрещает.

type KitDetailsSection = { heading: string; text?: string; items?: string[]; table?: { headers: string[]; rows: string[][] } }

type KitWords = {
  summary: string
  intro: string
  embedLabel: string
  command: string
  paramsHeaders: string[]
  params: string[][]
  sample: string
  detailsTitle: string
  details: KitDetailsSection[]
}

type KitCard = { id: string; order: number; words: Record<string, KitWords> }

// 🛑 КОРЕНЬ — `process.cwd()`: страница предрендерена при сборке, а сборка идёт из корня проекта.
const KITS = path.join(process.cwd(), 'app', '[lang]', '(architectLayer)', 'architect', 'kits')

function kitCards(): KitCard[] {
  let names: string[] = []
  try { names = readdirSync(KITS) } catch { return [] }
  return names
    .filter((n) => n.startsWith('_') && existsSync(path.join(KITS, n, 'kit.json')))
    .map((n) => JSON.parse(readFileSync(path.join(KITS, n, 'kit.json'), 'utf8')) as KitCard)
    .sort((a, b) => a.order - b.order)
}

function detailBlocks(sections: KitDetailsSection[]): Block[] {
  return sections.flatMap((s): Block[] => [
    { kind: 'h3', text: s.heading },
    ...(s.text ? [{ kind: 'p', text: s.text } as Block] : []),
    ...(s.items ? [{ kind: 'list', items: s.items } as Block] : []),
    ...(s.table ? [{ kind: 'table', headers: s.table.headers, rows: s.table.rows } as Block] : []),
  ])
}

function kitItem(w: KitWords): Block {
  return {
    kind: 'accordionItem',
    summary: w.summary,
    details: { title: w.detailsTitle, children: detailBlocks(w.details) },
    children: [
      { kind: 'p', text: w.intro },
      { kind: 'p', text: `**${w.embedLabel}**` },
      { kind: 'code', text: w.command },
      { kind: 'table', headers: w.paramsHeaders, rows: w.params },
      { kind: 'p', text: w.sample },
    ],
  }
}

export function content(lang: string): Block[] {
  const items = kitCards().map((k) => kitItem(k.words[lang] ?? k.words.en))
  return items.length ? [{ kind: 'accordion', capped: true, children: items }] : []
}
