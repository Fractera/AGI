// ЯЗЫКИ СБОРКИ ЭЛЕМЕНТА — ОДНО МЕСТО ВЫБОРКИ (шаг 341-1). Читают установщик (`scripts/services-install.mjs`, кнопка
// «Развернуть») и предпросмотр (`scripts/element-preview.mjs`): две копии выборки разошлись бы молча, и предпросмотр
// показал бы не тот набор, что уедет на сайт. Голый `node` — поэтому `.mjs`.
//
// 🔒 ИСТОЧНИК ТОТ ЖЕ, ЧТО У САМОГО ЭЛЕМЕНТА ВО ВРЕМЯ РАБОТЫ. Элемент, подключённый к CONFIG (`data/services/<id>/links.json`
// без `config: false`), кладёт последнюю копию настроек проекта (`data/services/<id>/project-settings.json`, `patches.app`)
// поверх своего APP-CONFIG (`lib/project-settings.ts` шаблона). ✗ До 341 сборка брала языки только из своего APP-CONFIG:
// набор и «языки для поисковиков», выбранные в CONFIG, до сборки не доходили вовсе. Связь выключена или копии нет —
// только свой APP-CONFIG, как прежде.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')) } catch { return null } }
const LANG = /^[a-z]{2,3}(-[a-z0-9]+)?$/i

/** Заплата CONFIG для `languages`, если элемент подключён к CONFIG и копия есть; иначе `null`. */
function configLanguages(id, root) {
  const data = join(root, 'data', 'services', id)
  const links = readJson(join(data, 'links.json'))
  if (isObj(links) && links.config === false) return null
  const copy = readJson(join(data, 'project-settings.json'))
  const l = isObj(copy) && isObj(copy.patches) && isObj(copy.patches.app) ? copy.patches.app.languages : undefined
  return isObj(l) ? l : null
}

/**
 * Языки, с которыми элемент собирается: `{ supported, default, indexed, from }` или `null` — записи нет нигде
 * (тогда остаётся прежний `.env.local`). `indexed` — `null`, если записи нет; `from` — `config` или `own`.
 */
export function elementLanguages(dir, id, root = process.cwd()) {
  const own = readJson(join(dir, 'APP-CONFIG', 'app-config.json'))?.languages
  const cfg = configLanguages(id, root)
  const l = { ...(isObj(own) ? own : {}), ...(cfg ?? {}) }
  const supported = Array.isArray(l.supported) ? l.supported.filter((x) => typeof x === 'string' && LANG.test(x)) : []
  if (supported.length === 0) return null
  const indexed = Array.isArray(l.indexed) ? l.indexed.filter((x) => typeof x === 'string' && supported.includes(x)) : null
  return {
    supported,
    default: supported.includes(l.default) ? l.default : supported[0],
    indexed,
    from: cfg ? 'config' : 'own',
  }
}
