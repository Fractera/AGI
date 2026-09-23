// ЗАМКИ ЭКРАНОВ ВХОДА — ИЗ ИНДИКАТОРА, А НЕ ИЗ СОБСТВЕННОГО ПРИЗНАКА (276-4).
//
// 🔒 ОДНО МЕСТО, КОТОРОЕ ПЕРЕВОДИТ СОСТОЯНИЕ УЗЛА В ЗАМКИ. До 276-4 экран Google решал по «свой домен
// записан в файле», экран Resend — вдобавок по «есть токен Cloudflare». Два признака расходились с
// индикатором молча: файл говорит, как задумано, а индикатор измеряет, отвечает ли домен ЭТИМ узлом.
// Таблица режимов — `development-docs/AUTH-DEBT.md` §2, здесь её единственная исполняемая копия:
//
//   компьютер + временный адрес → заперто      сервер + голый IP   → заперто
//   компьютер + свой домен      → Cloudflare   сервер + свой домен → регистратор
//
// 🛑 «НЕ ЗНАЮ» НЕ ПРЕВРАЩАЕТСЯ В ВЫБОР. Место не объявлено — вход открыт (домен наш, это измерено), но
// ни один способ внести записи DNS не открывается: угадать, кто их вносит, узел не может.

import type { NodeState } from '@/lib/node-state/measure'

export type DnsPath = 'cloudflare' | 'registrar'

export type AuthMode = {
  /** вход через Google и письмом возможен: домен измерен и отвечает этим узлом */
  open: boolean
  /** кто вносит записи DNS; `null` — заперто или место не объявлено */
  dns: DnsPath | null
}

export function authMode(state: NodeState): AuthMode {
  const own = state.reach.kind === 'own-domain' && state.reach.ours === true
  if (!own) return { open: false, dns: null }
  const place = state.place.kind
  return { open: true, dns: place === 'home' ? 'cloudflare' : place === 'server' ? 'registrar' : null }
}
