import "server-only"
import { serviceUrl } from "@/lib/microservices/registry"
import { publicAuth } from "@/lib/domain/public-auth.cjs"

// ГДЕ ЯДРО БЕРЁТ ОБОЛОЧКУ ПРОЕКТА (285-3). Службам адреса выдаёт установщик (`PROJECT_SHELL_URL`,
// `PROJECT_SITE_URL`); ядро знает их само: сервер ядра спрашивает сайт по петле машины, а ссылки ведут туда,
// до чего дотянется браузер человека — на своём домене корень зоны, иначе петля с портом сайта.
// Заменяет `lib/menu/site-menu-remote.ts` (283-1): меню теперь часть оболочки, а не отдельная дверь.
export function coreShellWhere(): { shellUrl: string | null; siteUrl: string | null } {
  const local = serviceUrl("root")
  const pub = publicAuth(process.cwd())
  const siteUrl = pub?.architectHost ? `https://${pub.siteHost}` : local?.replace("127.0.0.1", "localhost") ?? null
  return { shellUrl: local ? `${local.replace(/\/+$/, "")}/api/shell` : null, siteUrl }
}
