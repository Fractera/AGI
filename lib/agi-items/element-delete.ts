import "server-only"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"
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

const ROOT = process.cwd()
const IS_WIN = process.platform === "win32"

type Step = { step: string; ok: boolean; detail?: string }

function envValue(name: string): string | null {
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
  const pm2 = (args: string[]) => spawnSync(IS_WIN ? "pm2.cmd" : "pm2", args, { cwd: ROOT, encoding: "utf8", shell: IS_WIN, windowsHide: true, timeout: 30_000 })

  // 1. Процесс и сторож.
  for (const name of [`fractera-svc-${id}`, `fractera-svc-${id}-watch`]) pm2(["delete", name])
  pm2(["save"])
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
  for (const f of [`birth-${id}.log`, `birth-${id}.json`]) rmSync(join(ROOT, "logs", f), { force: true })
  steps.push({ step: "logs", ok: true })

  // 7. Папка с кодом — после остановки процесса; Windows может держать файлы ещё мгновение.
  const dir = paths.itemDir(id, "user")
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
  } catch { /* проверяется ниже */ }
  steps.push({ step: "folder", ok: !existsSync(dir), detail: existsSync(dir) ? "busy" : undefined })

  return { ok: steps.every((s) => s.ok), steps }
}
