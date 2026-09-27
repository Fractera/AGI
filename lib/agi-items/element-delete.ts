import "server-only"
import { execFile, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { rename, rm } from "node:fs/promises"
import { join } from "node:path"
import paths from "@/lib/agi-items/paths.cjs"
import { deleteDraft } from "@/lib/agi-items/drafts"
import { accountOfZone, deleteDnsRecords, getIngress, listZones, setIngress } from "@/lib/domain/cloudflare"

// УДАЛЕНИЕ РОЖДЁННОГО AGI ЭЛЕМЕНТА НАСОВСЕМ (узел, шаг 325-5). Решение владельца 2026-09-27: «Удалить насовсем».
//
// 🔒 ТОЛЬКО РОЖДЁННЫЙ (`born` в реестре, `kind: user`). Встроенные службы узла (вход, данные, сайт…) этой дверью не удаляются
// никогда: у них нет черновика и у них свой путь замены.
// 🔒 ПОРЯДОК — ОТ ЖИВОГО К МЁРТВОМУ: процесс (pm2) → адрес в интернете (маршрут туннеля и DNS) → запись реестра → черновик →
// данные элемента (ключ GitHub, состояние) → журналы рождения → папка с кодом. Сначала останавливается то, что держит файлы и
// отвечает людям, иначе Windows не отдаст папку (EBUSY), а поддомен вёл бы в пустоту.
// 🔒 КАЖДЫЙ ЭТАП — В ОТВЕТЕ. Сбой этапа называется; то, что уже снято, молча не возвращается. Репозиторий владельца на GitHub
// не трогается: удаляется копия на узле.
// 🛑 ВТОРАЯ КОПИЯ ЧТЕНИЯ КЛЮЧА CLOUDFLARE И `logs/domain.json` — в двери `/api/node/reach` (289). Названа вслух; вынести в
// общий модуль — отдельная правка.
// 🛑 НИ ОДНОЙ БЛОКИРУЮЩЕЙ ОПЕРАЦИИ ДОЛЬШЕ МГНОВЕНИЯ (325-6). Дверь работает внутри сервера ядра: `spawnSync` pm2 и `rmSync`
// папки с `node_modules` (десятки тысяч файлов) останавливали ВЕСЬ сайт — кнопка висела на «Удаляю…» ~20 с, а у dso94 стирание
// шло дольше 90 с, сторож ядра счёл сайт мёртвым и перезапустил его посреди удаления: папка осталась стёртой наполовину.
// Поэтому pm2 — асинхронно, папка — ПЕРЕИМЕНОВАНИЕМ в `AGI-ITEMS/.trash/` (мгновенно: элемента больше нет), а стирание корзины
// идёт без ожидания и без блокировки (`fs/promises`, пул потоков). Корзина стирается целиком — так дочищаются и остатки
// прерванных прежде удалений. Корзина вне git и вне проверки типов (вся `AGI-ITEMS` исключена).

const ROOT = process.cwd()
const IS_WIN = process.platform === "win32"

type Step = { step: string; ok: boolean; detail?: string }

const TRASH_DIR = join(paths.ITEMS_DIR, ".trash")
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Значение из `.env.local`/`.env` узла (ключ Cloudflare и т. п.); 324 зовёт его отсюда же. */
export function envValue(name: string): string | null {
  for (const file of [".env.local", ".env"]) {
    const p = join(ROOT, file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
      if (m && m[1] === name && m[2].trim()) return m[2].trim()
    }
  }
  return process.env[name]?.trim() || null
}

type Registry = { services: Array<{ id: string; kind?: string; born?: unknown; port?: number }> }
const readRegistry = (): Registry => JSON.parse(readFileSync(paths.REGISTRY_FILE, "utf8")) as Registry

/** Рождённый ли это элемент — только такие удаляются. */
export function isBornElement(id: string): boolean {
  try {
    const e = readRegistry().services.find((s) => s.id === id)
    return !!e && e.kind === "user" && !!e.born
  } catch { return false }
}

function git(dir: string, args: string[]) {
  const r = spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", windowsHide: true, timeout: 10_000 })
  return { rc: r.status ?? 1, out: (r.stdout ?? "").trim() }
}

/** Что потеряется: коммиты, которых нет в GitHub (null — связь не подключена, выгрузок не было). */
export function deletionRisk(id: string): { commits: number; unexported: number | null } {
  const dir = paths.itemDir(id, "user")
  const commits = Number(git(dir, ["rev-list", "--count", "HEAD"]).out) || 0
  let last: string | null = null
  try { last = (JSON.parse(readFileSync(join(ROOT, "data", "services", id, "github", "state.json"), "utf8")) as { lastCommit?: string }).lastCommit ?? null } catch { /* нет */ }
  if (!last) return { commits, unexported: null }
  const ahead = git(dir, ["rev-list", "--count", `${last}..HEAD`])
  return { commits, unexported: ahead.rc === 0 ? Number(ahead.out) || 0 : commits }
}

export async function deleteElement(id: string): Promise<{ ok: boolean; steps: Step[] }> {
  const steps: Step[] = []
  const pm2 = (args: string[]) => new Promise<boolean>((resolve) => {
    execFile(IS_WIN ? "pm2.cmd" : "pm2", args, { cwd: ROOT, shell: IS_WIN, windowsHide: true, timeout: 30_000 }, (err) => resolve(!err))
  })

  // 1. Процесс и сторож.
  for (const name of [`fractera-svc-${id}`, `fractera-svc-${id}-watch`]) await pm2(["delete", name])
  await pm2(["save"])
  steps.push({ step: "pm2", ok: true })

  // 2. Адрес в интернете (если узел на своём домене).
  let domain: { zone?: string; tunnelId?: string } | null = null
  try { domain = JSON.parse(readFileSync(join(ROOT, "logs", "domain.json"), "utf8")) } catch { /* узел без домена */ }
  const key = envValue("CLOUDFLARE_API_TOKEN")
  if (domain?.zone && domain.tunnelId && key) {
    const hostname = `${id}.${domain.zone}`
    const zones = await listZones(key)
    const zone = zones.ok ? zones.result.find((z) => z.name === domain!.zone) : null
    const account = zone ? await accountOfZone(key, zone.id) : null
    if (!zone || !account?.ok) {
      steps.push({ step: "tunnel", ok: false, detail: "cloudflare-unreachable" })
    } else {
      const rules = await getIngress(key, account.result, domain.tunnelId)
      if (rules.ok && rules.result.some((r) => r.hostname === hostname)) {
        const put = await setIngress(key, account.result, domain.tunnelId, rules.result.filter((r) => r.hostname !== hostname))
        steps.push({ step: "tunnel", ok: put.ok, detail: put.ok ? hostname : put.reason })
      } else {
        steps.push({ step: "tunnel", ok: rules.ok, detail: rules.ok ? "no-route" : rules.reason })
      }
      const dns = await deleteDnsRecords(key, zone.id, hostname)
      steps.push({ step: "dns", ok: dns.ok, detail: dns.ok ? `removed:${dns.result}` : dns.reason })
    }
  } else {
    steps.push({ step: "tunnel", ok: true, detail: "no-domain" })
  }

  // 3. Запись реестра (рабочий файл узла).
  try {
    const reg = readRegistry()
    reg.services = reg.services.filter((s) => s.id !== id)
    writeFileSync(paths.REGISTRY_FILE, JSON.stringify(reg, null, 2) + "\n", "utf8")
    steps.push({ step: "registry", ok: true })
  } catch (e) {
    steps.push({ step: "registry", ok: false, detail: String(e) })
  }

  // 4. Черновик, 5. данные элемента, 6. журналы рождения.
  steps.push({ step: "draft", ok: deleteDraft(id) })
  rmSync(join(ROOT, "data", "services", id), { recursive: true, force: true })
  steps.push({ step: "data", ok: !existsSync(join(ROOT, "data", "services", id)) })
  // Журналы рождения и журналы процесса элемента (pm2 закрыл их на этапе 1).
  for (const f of [`birth-${id}.log`, `birth-${id}.json`, `svc-${id}-out.log`, `svc-${id}-err.log`, `svc-${id}-watch.log`]) {
    try { rmSync(join(ROOT, "logs", f), { force: true }) } catch { /* занят — останется строкой журнала */ }
  }
  steps.push({ step: "logs", ok: true })

  // 7. Папка с кодом — переименованием в корзину (Windows может держать файлы остановленного процесса мгновение — повторы).
  const dir = paths.itemDir(id, "user")
  for (let i = 0; i < 10 && existsSync(dir); i++) {
    try {
      mkdirSync(TRASH_DIR, { recursive: true })
      await rename(dir, join(TRASH_DIR, `${id}-${Date.now()}`))
    } catch { await pause(500) }
  }
  steps.push({ step: "folder", ok: !existsSync(dir), detail: existsSync(dir) ? "busy" : undefined })
  void rm(TRASH_DIR, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 }).catch(() => { /* дочистится следующим удалением */ })

  return { ok: steps.every((s) => s.ok), steps }
}
