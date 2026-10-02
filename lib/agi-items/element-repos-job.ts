import "server-only"
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { createAllElementRepos, type RepoResult } from "@/lib/agi-items/element-github"
import { saveNodeMap, type NodeMapResult } from "@/lib/agi-items/node-map"

// «КЛЮЧ ВПИСАН — РЕПОЗИТОРИИ СОЗДАЮТСЯ САМИ» (шаг 374-2). Слово владельца 2026-10-02: «как только вёл сразу же в его репозитории
// создаются классические репозитории под каждой AGI ITEMS». Работа длится минуты (дотянуть историю обязательных элементов с
// Fractera, выгрузить каждый), поэтому идёт в процессе ядра без ожидания ответа, а ход — в `data/node/github/repos.json`.
// 🔒 Действие — только в ответ на человека (сохранение ключа или кнопка «Создать репозитории»): таймеров и повторов нет.

const FILE = join(process.cwd(), "data", "node", "github", "repos.json")
export type ReposJob = { running: boolean; startedAt?: string; finishedAt?: string; results?: RepoResult[]; map?: NodeMapResult }

export function readReposJob(): ReposJob {
  try { return JSON.parse(readFileSync(FILE, "utf8")) as ReposJob } catch { return { running: false } }
}

function write(job: ReposJob) {
  mkdirSync(join(process.cwd(), "data", "node", "github"), { recursive: true })
  const tmp = `${FILE}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmp, JSON.stringify(job, null, 2) + "\n", "utf8")
  renameSync(tmp, FILE)
}

const g = globalThis as unknown as { __agiReposJob?: Promise<void> | null }

/** Запустить создание репозиториев, если оно не идёт. Возвращает сразу. */
export function startReposJob(): ReposJob {
  if (g.__agiReposJob) return readReposJob()
  const startedAt = new Date().toISOString()
  write({ running: true, startedAt })
  g.__agiReposJob = (async () => {
    try {
      const r = await createAllElementRepos()
      write({ running: false, startedAt, finishedAt: new Date().toISOString(), results: r.results, map: saveNodeMap() })
    } catch {
      write({ running: false, startedAt, finishedAt: new Date().toISOString(), results: [] })
    } finally {
      g.__agiReposJob = null
    }
  })()
  return readReposJob()
}
