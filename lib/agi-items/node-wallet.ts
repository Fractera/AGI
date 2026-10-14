import "server-only"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

// КОШЕЛЁК УЗЛА (478-3). Слово владельца 2026-10-14: «в паспорте узла … должна быть опция подключить кошелёк, нет кошелька есть
// видимость системе … заказчику будет предоставлено только обнаружение в случае если он оплачивает комиссию за обнаружение».
// Словарь 14.10: кошелёк — регистрация узла в сети и его счёт, один на все элементы узла.
//
// 🔒 ФАЙЛ ВНЕ GIT (`data/*` в .gitignore): адрес — сведение о машине человека, а не код проекта.
// 🛑 ЭТО ЗАПИСЬ АДРЕСА, А НЕ РЕГИСТРАЦИЯ В СЕТИ: сети Lagrix ещё нет, владение адресом подписью не доказывается (вне шага 478).

export type NodeWallet = { address: string; network: "USDC"; connectedAt: string }

const FILE = join(process.cwd(), "data", "node", "wallet.json")
const EVM = /^0x[0-9a-fA-F]{40}$/

export function readWallet(): NodeWallet | null {
  try {
    const w = JSON.parse(readFileSync(FILE, "utf8")) as Partial<NodeWallet>
    return typeof w.address === "string" && EVM.test(w.address) ? (w as NodeWallet) : null
  } catch {
    return null
  }
}

export function isEvmAddress(value: unknown): value is string {
  return typeof value === "string" && EVM.test(value.trim())
}

export function saveWallet(address: string): NodeWallet {
  const w: NodeWallet = { address: address.trim(), network: "USDC", connectedAt: new Date().toISOString() }
  mkdirSync(dirname(FILE), { recursive: true })
  writeFileSync(FILE, `${JSON.stringify(w, null, 2)}\n`)
  return w
}

export function removeWallet(): void {
  if (existsSync(FILE)) rmSync(FILE)
}
