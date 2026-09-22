// @api tell which repository this node works with and whether its key exists
import { NextRequest, NextResponse } from "next/server"

import { requireRoles } from "@/lib/auth/require-roles"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"
import { binding } from "../../_github/server/binding.cjs"
import { tokenState } from "../../_github/server/token.cjs"
import { flowValue, flowVerified, flowPushed } from "../../_connect/server/launch-flow"

// ПРИВЯЗКА УЗЛА К РЕПОЗИТОРИЮ (273).
//
// 🔒 ДВЕРЬ ЖИВЁТ В МАРШРУТЕ СВОЕЙ СТРАНИЦЫ: удалили вкладку — ушла и дверь (закон 271).
// 🔒 ПРИВЯЗКА ИЗМЕРЯЕТСЯ ПРИ КАЖДОМ ЗАПРОСЕ: страница предрендерена, а `origin` — факт о машине.
// 🛑 КЛЮЧ НАРУЖУ НЕ ВОЗВРАЩАЕТСЯ: только признак «есть» и четыре последних знака.
//
// 🔒 ДВЕ ЗАПИСИ О РЕПОЗИТОРИИ, И ОНИ РАЗНОЙ ПРИРОДЫ (274-5). Первая — `binding()`: с каким
// репозиторием узел работает ПРЯМО СЕЙЧАС; она измеряется у git при каждом запросе. Вторая —
// `connected`: репозиторий, который человек подключил МАСТЕРОМ; это сохранённое значение.
// 🛑 СВОДИТЬ ИХ В ОДНУ ЗАПРЕЩЕНО. Они расходятся законно: узел, запущенный из форка Fractera,
// работает с одним адресом, а человек мастером подключает свой. Показав одно вместо двух, экран
// ответил бы уверенно и неверно на вопрос «куда уедет мой код».
export const dynamic = "force-dynamic"

const ROLES = ["architect", "admin"] as const

export async function GET(req: NextRequest) {
  if (isTemporaryPublicAddress(req)) return NextResponse.json({ ok: false, error: "temporary-address" }, { status: 403 })
  const denied = await requireRoles(req, ROLES)
  if (denied) return denied
  const url = flowValue("repo-url")
  return NextResponse.json(
    {
      ok: true,
      binding: binding(),
      token: tokenState(),
      // Пусто — мастер не проходили; это законное состояние, а не отказ.
      connected: url ? { url, verified: flowVerified(), pushed: flowPushed() } : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}
