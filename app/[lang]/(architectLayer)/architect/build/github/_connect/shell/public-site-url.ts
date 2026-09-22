import { readRuntime } from '@/lib/server-port.cjs'

// АДРЕС ЭТОГО УЗЛА СНАРУЖИ (274-2).
//
// 🔒 ЗАМЕНА `@/lib/public-site-url` ПАНЕЛИ: там адрес собирался из настроек слота и домена клиента, здесь
// его знает сам узел — файл состояния `logs/runtime.json` и настройки домена.
// 🛑 АДРЕС СПРАШИВАЕТСЯ, А НЕ ПОМНИТСЯ (закон шага 264): порт и адрес — факты о машине.
export type PublicSite = { url: string | null; temporary: boolean }

export function publicSiteUrl(): PublicSite {
  const r = readRuntime() as { port?: number; publicUrl?: string; tunnel?: unknown } | null
  if (!r) return { url: null, temporary: false }
  // 🛑 Туннель даёт ВРЕМЕННЫЙ адрес — это свойство адреса, и оно называется вслух (закон узла).
  return { url: r.publicUrl ?? (r.port ? `http://localhost:${r.port}` : null), temporary: Boolean(r.tunnel) }
}
