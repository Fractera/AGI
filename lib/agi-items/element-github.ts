import "server-only"
import { spawnSync } from "node:child_process"
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import paths from "@/lib/agi-items/paths.cjs"
import { checkAccess } from "@/app/[lang]/(architectLayer)/architect/build/github/_github/server/github.cjs"
import { SHAPE } from "@/app/[lang]/(architectLayer)/architect/build/github/_github/server/token.cjs"

// GITHUB РОЖДЁННОГО ЭЛЕМЕНТА (узел, шаг 319-5). Слово владельца 2026-09-27: «пользователь … сохранить его обновлённую версию
// на своем гит хаб … вводить название репозитории и токен … экспортом этого репозитория в свой GitHub» — выгрузка КНОПКОЙ.
//
// 🔒 КИРПИЧИ ЯДРА, А НЕ КОПИЯ: проверка ключа — `checkAccess` (кто вы, виден ли репозиторий, `permissions.push`, срок), форма
// ключа — `SHAPE` из пути GitHub ядра (273). Здесь только то, что у элемента своё: где лежит его ключ и какую папку слать.
// 🔒 КЛЮЧ — В ДАННЫХ УЗЛА (`data/services/<id>/github/.env`, права 0600, вне git), наружу — 4 последних знака. Сохраняется
// ТОЛЬКО при праве записи: ключ, которым нельзя писать, выглядел бы рабочим до первой выгрузки.
// 🔒 ТОКЕН В GIT — ТОЛЬКО РАЗОВЫМ АРГУМЕНТОМ `push <url>`, НИКОГДА В `git remote`: иначе он лёг бы в `.git/config` элемента в
// открытом виде. Вывод git наружу не отдаётся — в нём бывает адрес с ключом; наружу — машинное слово причины.
// 🔒 НЕЗАКОММИЧЕННЫЕ ПРАВКИ (слово владельца: «а and b need both with description in (?)»): по умолчанию выгрузка отказывает
// и называет число правок; коммит «export <дата>» узел делает только по отдельной кнопке человека.

const ROOT = process.cwd()
const dataDir = (id: string) => join(ROOT, "data", "services", id, "github")
const tokenFile = (id: string) => join(dataDir(id), ".env")
const stateFile = (id: string) => join(dataDir(id), "state.json")
const KEY = "GITHUB_TOKEN="

export type ElementGithubState = {
  repo: string | null
  login: string | null
  expires: string | null
  tokenTail: string | null
  lastPushedAt: string | null
  lastCommit: string | null
  dirty: number
  commit: string | null
}

type Stored = { repo?: string; login?: string | null; expires?: string | null; lastPushedAt?: string; lastCommit?: string }

function readStored(id: string): Stored {
  try { return JSON.parse(readFileSync(stateFile(id), "utf8")) as Stored } catch { return {} }
}

function writeStored(id: string, next: Stored) {
  mkdirSync(dataDir(id), { recursive: true })
  writeFileSync(stateFile(id), JSON.stringify(next, null, 2) + "\n", "utf8")
}

function readToken(id: string): string | null {
  try {
    const line = readFileSync(tokenFile(id), "utf8").split(/\r?\n/).find((l) => l.startsWith(KEY))
    return line ? line.slice(KEY.length).trim() || null : null
  } catch { return null }
}

// 🛑 СЛЕД СБОРКИ — НЕ ПРАВКА АГЕНТА (закон 295-1, замерено 319-5): Next при каждой сборке переписывает `tsconfig.json`
// (дописывает .next-a/.next-b) и `next-env.d.ts`. Без этого исключения у каждого рождённого элемента всегда была бы
// «1 незакоммиченная правка», и выгрузка требовала бы автокоммита шума сборки.
const BUILD_OWNED = /(^|\/)(tsconfig\.json|next-env\.d\.ts)$/

/** Незакоммиченные правки, кроме следа сборки. */
function changes(dir: string): string[] {
  return git(dir, ["status", "--porcelain"]).out.split(/\r?\n/).filter(Boolean)
    .map((l) => l.slice(3).trim()).filter((f) => !BUILD_OWNED.test(f))
}

function git(dir: string, args: string[]) {
  // `credential.helper=` и без запроса в терминал: ключ приходит только адресом, а менеджер учётных данных Windows не должен
  // ни подставлять свой, ни открывать окно входа поверх экрана человека.
  const r = spawnSync("git", ["-C", dir, "-c", "credential.helper=", ...args], {
    encoding: "utf8", windowsHide: true, timeout: 120_000, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  })
  return { rc: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` }
}

/** Папка рождённого элемента или null — у черновика и чужого имени её нет. */
export function elementDir(id: string): string | null {
  const dir = paths.itemDir(id, "user")
  return existsSync(join(dir, ".git")) ? dir : null
}

/** `owner/name` из `owner/name`, `https://github.com/owner/name` или `…/name.git`; иначе null. */
export function parseRepo(raw: string): { owner: string; repo: string } | null {
  const s = raw.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "").replace(/\/+$/, "")
  const m = s.match(/^([A-Za-z0-9-]{1,39})\/([A-Za-z0-9._-]{1,100})$/)
  return m ? { owner: m[1], repo: m[2] } : null
}

export function elementGithubState(id: string): ElementGithubState {
  const st = readStored(id)
  const token = readToken(id)
  const dir = elementDir(id)
  const dirty = dir ? changes(dir).length : 0
  const commit = dir ? git(dir, ["rev-parse", "--short", "HEAD"]).out.trim() || null : null
  return {
    repo: st.repo ?? null,
    login: st.login ?? null,
    expires: st.expires ?? null,
    tokenTail: token ? token.slice(-4) : null,
    lastPushedAt: st.lastPushedAt ?? null,
    lastCommit: st.lastCommit ?? null,
    dirty,
    commit,
  }
}

/** Проверить ключ у GitHub и сохранить связь — только при праве записи. */
export async function connectElementGithub(id: string, rawRepo: string, rawToken: string) {
  const where = parseRepo(rawRepo)
  if (!where) return { ok: false as const, error: "bad-repo" }
  const token = rawToken.trim()
  if (!SHAPE.test(token)) return { ok: false as const, error: "bad-token-shape" }
  const access = await checkAccess(token, where.owner, where.repo)
  if (!access.ok) return { ok: false as const, error: access.error ?? "github-refused" }
  if (!access.canRead) return { ok: false as const, error: "repo-not-visible", login: access.login ?? null }
  // 🛑 `permissions.push` ИЗ ОТВЕТА О РЕПОЗИТОРИИ — ПРАВА АККАУНТА, А НЕ КЛЮЧА (замерено 319-5 на ключе владельца: GitHub
  // ответил push: true, а `git push` того же ключа — «Permission … denied, 403»: у тонкого ключа не было Contents: write).
  // Поэтому право записи проверяется НАСТОЯЩЕЙ пробной отправкой `git push --dry-run` — она проходит проверку прав GitHub и
  // ничего не пишет.
  const dir = elementDir(id)
  if (dir) {
    const probe = spawnSync("git", ["-C", dir, "-c", "credential.helper=", "push", "--dry-run", `https://x-access-token:${token}@github.com/${where.owner}/${where.repo}.git`, "HEAD:main"], {
      encoding: "utf8", windowsHide: true, timeout: 60_000, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    })
    if (probe.status !== 0) {
      const out = `${probe.stdout ?? ""}${probe.stderr ?? ""}`
      return { ok: false as const, error: /403|denied/i.test(out) ? "no-write" : /without `?workflow`? scope/i.test(out) ? "needs-workflow" : /non-fast-forward|fetch first/i.test(out) ? "rejected" : "push-failed", login: access.login ?? null }
    }
  }
  mkdirSync(dataDir(id), { recursive: true })
  writeFileSync(tokenFile(id), `${KEY}${token}\n`, { mode: 0o600 })
  try { chmodSync(tokenFile(id), 0o600) } catch { /* Windows: права файла задаёт профиль пользователя */ }
  writeStored(id, { ...readStored(id), repo: `${where.owner}/${where.repo}`, login: access.login ?? null, expires: access.expires ?? null })
  return { ok: true as const }
}

export function forgetElementToken(id: string) {
  rmSync(tokenFile(id), { force: true })
}

/** Выгрузить папку элемента в его репозиторий. `commit` — сначала закоммитить правки (кнопка человека). */
export function pushElement(id: string, commit: boolean) {
  const dir = elementDir(id)
  if (!dir) return { ok: false as const, error: "not-born" }
  const token = readToken(id)
  const repo = readStored(id).repo
  if (!token || !repo) return { ok: false as const, error: "not-connected" }
  const pending = changes(dir)
  const dirty = pending.length
  if (dirty > 0 && !commit) return { ok: false as const, error: "dirty", dirty }
  if (dirty > 0) {
    const ident = ["-c", "user.name=Fractera node", "-c", "user.email=node@fractera.local"]
    // Коммитятся правки, но не след сборки (он остаётся незакоммиченным, как и был). 🛑 `next-env.d.ts` в пути НЕ
    // называть: он в `.gitignore` элемента, и одно его упоминание делает `git add` кодом 1 (замерено 319-5).
    if (git(dir, ["add", "-A", "--", ".", ":(exclude)tsconfig.json"]).rc !== 0) {
      return { ok: false as const, error: "commit-failed" }
    }
    if (git(dir, [...ident, "commit", "--quiet", "-m", `export ${new Date().toISOString()}`]).rc !== 0) {
      return { ok: false as const, error: "commit-failed" }
    }
  }
  const url = `https://x-access-token:${token}@github.com/${repo}.git`
  const r = git(dir, ["push", url, "HEAD:main"])
  if (r.rc !== 0) {
    // Причина — машинным словом; сам вывод остаётся здесь, в нём адрес с ключом.
    // 🛑 `[remote rejected]` — общее слово GitHub для ЛЮБОГО отказа; «другая история» — только non-fast-forward / fetch first
    // (замерено 319-5: пустой репозиторий, отказ из-за файла .github/workflows был ошибочно назван «другой историей»).
    const error = /without `?workflow`? scope/i.test(r.out) ? "needs-workflow"
      : /non-fast-forward|fetch first/i.test(r.out) ? "rejected"
      : /Authentication failed|403|could not read Username/i.test(r.out) ? "auth-failed"
      : /not found/i.test(r.out) ? "repo-not-found" : "push-failed"
    return { ok: false as const, error }
  }
  const head = git(dir, ["rev-parse", "--short", "HEAD"]).out.trim()
  writeStored(id, { ...readStored(id), lastPushedAt: new Date().toISOString(), lastCommit: head })
  return { ok: true as const, commit: head }
}
