// СОСТОЯНИЕ УЗЛА: ГДЕ ОН СТОИТ, КАК ДО НЕГО ДОБИРАЮТСЯ, ЕСТЬ ЛИ СТЕНА (276-1).
//
// 🔒 ИЗМЕРЯЕТСЯ, А НЕ ВСПОМИНАЕТСЯ. Файлы `logs/domain.json` и `logs/tunnel.json` говорят, **как
// задумано**; сеть говорит, **как есть**. Расхождение между ними и есть отказ, который человек должен
// увидеть, — поэтому здесь не читают файл и не печатают его содержимое, а идут по адресу из файла и
// спрашивают у него, кто он. ✗ Оплачено дважды: `serve:status` печатал запомненный адрес, а рядом
// строка «сайт отвечает: 200» относилась к `localhost` и читалась как ответ про интернет.
//
// 🔒 «НАШ ЛИ ЭТО АДРЕС» ПРОВЕРЯЕТСЯ СВЕРКОЙ ЛИЧНОСТИ ПРОЦЕССА, А НЕ КОДОМ 200. Домен, который ведёт
// на чужой работающий сайт, отдаст 200 с той же готовностью, что и наш. Поэтому у адреса спрашивают
// `/api/health` и сверяют `pid` и `startedAt` со своими: совпали — отвечает ЭТОТ процесс.
//
// 🔒 ДВЕ ОСИ, А НЕ ЧЕТЫРЕ РЕЖИМА (решение при планировании 276). «Как добираются» измеряется, «где
// стоит узел» — не измеряется ничем и объявляется человеком. Сочетаний больше четырёх, и список пар
// разошёлся бы с жизнью; пары считает тот, кому они нужны, из двух осей.

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { readPlace, type Place } from '@/lib/node-state/place'

const ROOT = process.cwd()
const TIMEOUT_MS = 4000

/** Откуда взято сведение. `unknown` — не «нет», а «не знаю»: их путать дорого. */
export type Source = 'measured' | 'declared' | 'unknown'

/** Как до узла добираются снаружи. */
export type ReachKind =
  | 'own-domain' // свой домен, и он отвечает этим узлом
  | 'temporary' // быстрый туннель: адрес временный и меняется при каждом перезапуске
  | 'bare-ip' // голый IP без домена — появится вместе с развёртыванием на сервер
  | 'local-only' // снаружи не опубликован: узел виден только на этой машине

export type Reach = {
  kind: ReachKind
  /** Имя, по которому шли. `null`, если идти было некуда. */
  host: string | null
  /** `true` — отвечает ЭТОТ узел; `false` — отвечает кто-то другой; `null` — проверить не удалось. */
  ours: boolean | null
  /** Короткая причина словами — её показывают человеку. */
  detail: string
  source: Source
  checkedAt: string
}


export type IsolationKind = 'none' | 'container'

export type NodeState = {
  reach: Reach
  place: Place
  isolation: { kind: IsolationKind; detail: string; source: Source }
  node: { port: number | null; commit: string | null; startedAt: string | null; pid: number; mode: string }
}

type Health = { ok?: boolean; pid?: number; startedAt?: string | null; commit?: string | null }

/** Прочитать файл состояния узла. Путь — от корня узла, чтобы он читался как адрес, а не как загадка. */
function readJson<T>(...segments: string[]): T | null {
  const full = path.join(ROOT, ...segments)
  if (!existsSync(full)) return null
  try {
    return JSON.parse(readFileSync(full, 'utf8')) as T
  } catch {
    return null
  }
}

/**
 * Спросить адрес, кто он.
 *
 * 🛑 ТРИ ИСХОДА, А НЕ ДВА, И ЭТО НЕ ПЕДАНТИЗМ. «Не ответил» и «ответил, но это не наш узел» ведут к
 * разным словам на экране и к разным действиям человека: в первом случае чинят связь, во втором —
 * запись DNS. Сведя их в одно «нет», индикатор отправил бы человека чинить не то.
 */
async function askHealth(url: string): Promise<{ health: Health | null; reachable: boolean; detail: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/api/health`, {
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    })
    if (!res.ok) return { health: null, reachable: true, detail: `по этому имени отвечают, но кодом ${res.status}` }
    // Чужой сайт по нашему имени ответит чем угодно — HTML, заглушкой хостера, чужим JSON.
    const health = (await res.json().catch(() => null)) as Health | null
    if (!health || typeof health.pid !== 'number') {
      return { health: null, reachable: true, detail: 'по этому имени отвечают, но это не узел Fractera' }
    }
    return { health, reachable: true, detail: 'ответил' }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { health: null, reachable: false, detail: message.includes('abort') ? 'не ответил вовремя' : `не отвечает: ${message}` }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Совпадает ли ответивший с нами. Сверяются ДВА поля: `pid` — тот ли это процесс, `startedAt` — тот
 * ли запуск. Одного `pid` мало: номера процессов переиспользуются операционной системой.
 */
function isUs(health: Health | null): boolean {
  if (!health || typeof health.pid !== 'number') return false
  const ourStart = process.env.AGI_STARTED_AT ?? null
  if (health.pid !== process.pid) return false
  if (ourStart && health.startedAt !== ourStart) return false
  return true
}

/**
 * Есть ли вокруг узла стена. 🛑 Сегодня ответ почти всегда «нет», и это измерение, а не заглушка:
 * признак контейнера у Linux наблюдаемый. На Windows контейнера в нашей установке быть не может —
 * все его механизмы требуют администратора, а наш закон установки этого не допускает.
 */
function measureIsolation(): NodeState['isolation'] {
  if (process.platform !== 'win32' && existsSync('/.dockerenv')) {
    return { kind: 'container', detail: 'узел работает внутри контейнера', source: 'measured' }
  }
  return {
    kind: 'none',
    detail: 'стены вокруг элементов нет: они работают тем же пользователем, что и вы',
    source: 'measured',
  }
}

// 🔒 ОБЪЯВЛЕНИЕ ЧИТАЕТСЯ ОДНИМ МОДУЛЕМ — `lib/node-state/place.ts`, тем же, который его пишет. Второй
// разбор того же файла разошёлся бы с первым молча, и индикатор однажды показал бы не то, что выбрал
// человек на экране.

export async function measureNodeState(): Promise<NodeState> {
  const checkedAt = new Date().toISOString()
  const domain = readJson<{ hostname?: string; zone?: string }>('logs', 'domain.json')
  const tunnel = readJson<{ url?: string; dead?: boolean; reason?: string }>('logs', 'tunnel.json')

  const node = {
    port: Number(process.env.PORT) || null,
    commit: process.env.AGI_COMMIT || process.env.NEXT_PUBLIC_GIT_COMMIT || null,
    startedAt: process.env.AGI_STARTED_AT ?? null,
    pid: process.pid,
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'dev',
  }

  const base = { place: readPlace(), isolation: measureIsolation(), node }

  // 1. Свой домен — первый кандидат: он старше и постояннее туннеля.
  const host = domain?.hostname
  if (host) {
    const { health, reachable, detail } = await askHealth(`https://${host}`)
    if (health && isUs(health)) {
      return { ...base, reach: { kind: 'own-domain', host, ours: true, detail: 'отвечает этот узел', source: 'measured', checkedAt } }
    }
    if (reachable) {
      // 🛑 Отвечает, но не мы. Это НЕ «свой домен»: имя уехало на чужой узел или на чужой сайт.
      return { ...base, reach: { kind: 'own-domain', host, ours: false, detail, source: 'measured', checkedAt } }
    }
    // Домен объявлен и молчит — значит снаружи узла нет, как бы ни выглядел файл.
    const temporary = tunnel?.url && tunnel.dead !== true ? tunnel : null
    if (!temporary) {
      return { ...base, reach: { kind: 'own-domain', host, ours: null, detail, source: 'measured', checkedAt } }
    }
  }

  // 2. Быстрый туннель — адрес временный, и об этом говорится словами.
  const url = tunnel?.url
  if (url && tunnel?.dead !== true) {
    const { health, reachable, detail } = await askHealth(url)
    const tunnelHost = (() => {
      try {
        return new URL(url).hostname
      } catch {
        return url
      }
    })()
    if (health && isUs(health)) {
      return { ...base, reach: { kind: 'temporary', host: tunnelHost, ours: true, detail: 'отвечает этот узел, адрес временный', source: 'measured', checkedAt } }
    }
    return { ...base, reach: { kind: 'temporary', host: tunnelHost, ours: reachable ? false : null, detail, source: 'measured', checkedAt } }
  }

  // 3. Наружу не опубликован.
  // 🛑 `bare-ip` здесь не рождается намеренно: чтобы узнать свой публичный адрес, пришлось бы спросить
  // чужую службу, а это зависимость, которой у продукта быть не должно. Для замков разницы нет —
  // им важно одно: домена, на котором работает вход, нет.
  const why = tunnel?.dead ? `временный адрес умер: ${tunnel.reason ?? 'причина не записана'}` : 'наружу узел не опубликован'
  return { ...base, reach: { kind: 'local-only', host: null, ours: null, detail: why, source: 'measured', checkedAt } }
}
