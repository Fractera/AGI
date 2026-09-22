import type { NextRequest } from 'next/server'
import { requireRoles } from '@/lib/auth/require-roles'

// ЗАМОК ДВЕРЕЙ ПУТИ В НАШЕМ СЛОЕ (274-2).
//
// 🔒 ЗАМЕНА `@/lib/require-auth` ПАНЕЛИ. Там дверь получала строку `cookie` и сама ходила к слою входа;
// здесь замок узла умеет это сам — `requireRoles(req, ...)` отвечает отказом или `null`.
// 🛑 РОЛЬ ТА ЖЕ, ЧТО У ОСТАЛЬНЫХ ДВЕРЕЙ СЛОЯ: путь запуска правит репозиторий и ключи, а это архитектор.
const ROLES = ['architect', 'admin'] as const

/** `true` — можно, `false` — нельзя. Форма ответа сохранена, чтобы перенесённые двери не правились. */
export async function requireAuth(req: NextRequest): Promise<boolean> {
  return (await requireRoles(req, ROLES)) === null
}
