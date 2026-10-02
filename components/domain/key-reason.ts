import type { DomainLadderWords } from "./domain-ladder.i18n"

// ПРИЧИНА ОТКАЗА ДВЕРИ КЛЮЧА — ЧЕЛОВЕЧЕСКИМИ СЛОВАМИ, ОДНА ФУНКЦИЯ НА ВСЕ ЭКРАНЫ (шаг 372). ✗ Mac 2026-10-02: карточка «Ключ
// узла» показала «Ключ не принят: no-zones» — голый код, хотя слова для него жили в лестнице домена. Лестница, карточка ключа и
// конвейер домена переводят причину здесь. Слова — пропсом (сервер выбрал язык); этот файл словаря не ввозит.
export function keyReasonText(words: DomainLadderWords, reason: string): string {
  if (reason === "empty") return words.reasonEmpty
  if (reason === "no-zones") return words.reasonNoZones
  if (reason === "not-owner") return words.reasonNotOwner
  if (reason === "no-tunnel-permission") return words.reasonNoTunnel
  if (reason === "temporary-address") return words.reasonTemporary
  if (reason.startsWith("network:")) return words.reasonNetwork
  if (reason.startsWith("token-")) return words.reasonToken
  // Слова самого Cloudflare передаются как есть: они точнее нашего пересказа.
  if (reason.startsWith("cloudflare:")) return `${words.keyRejected} ${reason.slice("cloudflare:".length)}`
  return words.keyRejected
}
