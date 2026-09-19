import { NextRequest } from "next/server"
import { shouldBypassAuth } from "@/lib/auth/auth-bypass"
import { isOwnerAtMachine } from "@/lib/auth/owner-at-machine"
import { isTemporaryPublicAddress } from "@/lib/auth/temporary-address"

export type AppSession = {
  userId: string
  email: string
  roles: string[]
  /**
   * Права выданы не входом, а тем, что человек сидит за этой машиной
   * (2026-09-19). Интерфейс обязан сказать об этом вслух: человек должен
   * понимать, ПОЧЕМУ его пустили без пароля, иначе он решит, что сайт открыт
   * всем подряд.
   */
  viaMachine?: true
}

export async function getSession(req?: NextRequest): Promise<AppSession | null> {
  const agentId = req?.headers.get('x-agent-identity')
  if (agentId) {
    return { userId: `${agentId}@agent`, email: `${agentId}@agent`, roles: ['agent'] }
  }

  if (shouldBypassAuth()) {
    return { userId: 'demo@local', email: 'demo@local', roles: ['architect'] }
  }

  // 🔒 ХОЗЯИН ЗА КЛАВИАТУРОЙ ЭТОЙ МАШИНЫ — решение владельца 2026-09-19. Признак
  // и причина, по которой он безопасен, — в `owner-at-machine.ts`; там же замер,
  // доказавший, что туннель не подменяет `Host`.
  //
  // 🛑 СТОИТ ПОСЛЕ ОБХОДА РАЗРАБОТКИ, НО ДО ЧТЕНИЯ КУКИ — и порядок важен: это
  // не «ещё один способ войти», а ответ на вопрос «кто спрашивает». Человеку с
  // машины кука не нужна; всем остальным она обязательна.
  if (isOwnerAtMachine(req)) {
    return { userId: 'owner@machine', email: 'owner@machine', roles: ['architect'], viaMachine: true }
  }

  // 🔒 ВРЕМЕННЫЙ АДРЕС УЗЛА — ВТОРОЕ МЕСТО ТОГО ЖЕ ПРАВИЛА (243). Решение
  // владельца 2026-09-19: на временном домене защиту игнорируем, иначе человек не
  // может пользоваться собственными вкладками даже для тестирования.
  //
  // ✗ ПОЧЕМУ ОДНИХ ВОРОТ СТРАНИЦ НЕ ХВАТИЛО — УВИДЕНО ГЛАЗАМИ В БРАУЗЕРЕ, А НЕ
  // `curl`: страницы слоя открылись и отдавали 200, а человек всё равно упирался
  // в окно «Эта страница вам недоступна. Требуется одна из этих ролей: architect».
  // Замок там клиентский (`components/auth/access-gate.client.tsx`), он спрашивает
  // `/api/me`, а ответ приходит отсюда: ролей нет — значит отказ. Ровно тот закон
  // проекта, что обход обязан быть двухслойным: страница и дверь решают отдельно,
  // и открытая страница с закрытой дверью выглядит как поломка продукта.
  //
  // 🛑 ЦЕНА ТА ЖЕ, ЧТО У ВОРОТ: пока туннель открыт, всякий, кто знает ссылку,
  // получает роль архитектора этого узла. Это сознательный размен владельца, а не
  // умолчание, и на постоянном домене он не действует.
  if (isTemporaryPublicAddress(req)) {
    return { userId: 'owner@temporary', email: 'owner@temporary', roles: ['architect'], viaMachine: true }
  }

  // 🔒 `||`, А НЕ `??`, И ЭТО НЕ ВКУСОВЩИНА — ОПЛАЧЕНО ПОТЕРЕЙ ВХОДА НА ЖИВОМ
  // САЙТЕ (2026-09-01).
  //
  // `??` заменяет только `null` и `undefined`. `NEXT_PUBLIC_AUTH_URL` в слоте —
  // ПУСТАЯ СТРОКА, и она запекается в бандл при сборке: выражение возвращало
  // `""`, дальше шёл `fetch("/api/session")` — относительный адрес, который на
  // сервере падает молча в `catch`. Наружу это выглядело как честный `401`:
  // человек вошёл, служба сессию признавала, а сайт показывал кнопку «войти».
  //
  // 🛑 ДЕФЕКТ БЫЛ НЕВИДИМ, ПОКА СЕРВЕР РАБОТАЛ ПО IP: там `shouldBypassAuth()`
  // отвечал раньше, и до этой строки дело не доходило. Перевод на домен включил
  // настоящий путь — и сломанным он был всё это время.
  const authUrl =
    process.env.AUTH_SERVICE_URL || process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3001'
  const cookie = req?.headers.get('cookie') ?? ''
  try {
    const res = await fetch(`${authUrl}/api/session`, { headers: { cookie } })
    if (!res.ok) return null
    return res.json() as Promise<AppSession>
  } catch {
    return null
  }
}
