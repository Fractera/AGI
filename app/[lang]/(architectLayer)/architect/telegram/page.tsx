import { permanentRedirect } from "next/navigation"
import { getAppConfig } from "@/config/app-config"
import { chatUrlFromSite } from "@/lib/site-urls"

// СТРАНИЦА БОТА ПЕРЕЕХАЛА НА ПОРТ 3600 (шаг 137, 2026-09-05).
//
// 🎯 ЦЕЛЬ ВЛАДЕЛЬЦА, ДОСЛОВНО: «если пользователь, которому не нужен сайт,
// придёт только на чат-бот, то ему будет достаточно всей информации». Работа
// бота изолирована на своей службе: там её описание, логи, настройки и паспорт.
// Здесь остаётся только дорога туда.
//
// 🔒 ПЕРЕАДРЕСАЦИЯ, А НЕ УДАЛЕНИЕ — РЕШЕНИЕ ВЛАДЕЛЬЦА. Адрес прожил месяц, он
// лежит в закладках и в переписке; маршрут, снесённый молча, отвечает 404, и
// человек решает, что способность пропала, а не переехала.
//
// 🔒 АДРЕС СТРОИТСЯ, А НЕ ЗАПИСАН. `chatUrlFromSite` выводит его из адреса
// сайта: домен → `chat.<апекс>`, голый IP → `<ip>:3600`. Записанный адрес был бы
// правдой ровно про одну машину — про нашу, — а этот файл уезжает каждому
// клиенту.
//
// 🛑 ПУСТОЙ АДРЕС — ЗАКОННЫЙ ИСХОД СВЕЖЕГО СЕРВЕРА, где настройки ещё не
// сохраняли. Переадресовать некуда, и вместо молчаливого падения страница
// говорит словами, куда идти. Ровно тот же исход обрабатывает ссылка в подвале.
//
// 🪦 СОДЕРЖИМОЕ СТРАНИЦЫ — 296 строк, четыре раздела и их компоненты — удалено
// этой же правкой и восстанавливается из git:
//   git log --diff-filter=D --format=%H -1 -- '<путь>'  →  git show <хэш>^:<путь>

export default async function TelegramMovedPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const chat = chatUrlFromSite(getAppConfig().url)

  if (chat) {
    permanentRedirect(`${chat}/${lang}/settings`)
  }

  return (
    <main className="min-h-screen bg-background">
      <div data-app-column className="px-6 py-[var(--page-py-work)]">
        <p className="text-muted-foreground text-sm">
          {lang === "ru"
            ? "Страница Telegram-бота переехала в службу чата этого сервера, порт 3600. Адрес сайта ещё не сохранён в настройках проекта — задайте его, и ссылка появится здесь и в подвале."
            : "The Telegram bot page has moved to this server's chat service, port 3600. The site address is not saved in the project settings yet — set it, and the link will appear here and in the footer."}
        </p>
      </div>
    </main>
  )
}
