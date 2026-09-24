import type { NextConfig } from "next";

// 🪦 `siteRedirects()` (280-3: non-architect paths → the site) removed by 285-6 — the core serves only architect
// pages at its root, and the project shell links to the site by absolute addresses.

// 🔒 ЗДЕСЬ БЫЛА ОБЁРТКА `withWorkflow` — СНЯТА 2026-08-13 (уборка перед
// развёртыванием, вопрос владельца про `app/.well-known`).
//
// Workflow DevKit пришёл в проект шагом 183 ради агентных сценариев: он ставит
// в сборку своё преобразование (директивы «use workflow» / «use step») и
// открывает наружу внутренние адреса `/.well-known/workflow/*`.
//
// К этому дню он не делал ничего. Проверено тремя фактами: в порождённом
// манифесте `"workflows": {}` — пусто, ни одной директивы «use workflow» или
// «use step» во всём коде нет, а сама папка `app/.well-known` не отслеживается
// git (внутри собственный `.gitignore` с `*`), то есть рождается сборкой и
// живёт только на диске.
//
// Итог: преобразование выполнялось в каждой сборке, служебные адреса были
// открыты наружу, и всё это ради подсистемы, которой в продукте нет с шага 500
// вместе с агентами. Пустая обёртка опаснее отсутствующей: следующая сессия
// принимает её за используемую и строит вокруг.
//
// Папку можно удалить с диска — она не вернётся, потому что её больше некому
// порождать.

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],

  // 🔒 261: страница «Архитектура» стала страницей M2M. Старый адрес живёт в
  // чужих закладках и ссылках — он отвечает постоянной переадресацией, а не 404.
  async redirects() {
    return [
      { source: "/:lang/architecture", destination: "/:lang/m2m", permanent: true },
      // 262: каталог секций переехал в слой архитектора по слову владельца.
      { source: "/:lang/blocks", destination: "/:lang/blocks/page-material", permanent: true },
      { source: "/:lang/architecture/index.md", destination: "/:lang/m2m/index.md", permanent: true },
      // 🔒 285-6: THE ARCHITECT PAGES LIVE AT THE ROOT OF THE CORE — owner 2026-09-24: «должно быть так:
      // https://architect.throughsongs.com/ru/». The folder stays `(architectLayer)/architect/` (424 places build
      // their links from it); the address loses `/architect`: an old address answers with a redirect to the clean one,
      // and the clean one is served by the rewrite below. The core has no other pages (280-2b), so every
      // `/<lang>/…` of the core is an architect page — and the proxy's gate guards every such path.
      // 🪦 280-2b `/:lang → /:lang/architect` and 280-3 `siteRedirects()` (non-architect paths → the site) are gone:
      // the header and footer now link to the site by absolute addresses (the project shell, 285-3).
      { source: "/:lang([a-z]{2})/architect", destination: "/:lang", permanent: false },
      { source: "/:lang([a-z]{2})/architect/:path*", destination: "/:lang/:path*", permanent: false },
    ];
  },

  // 285-6: the clean address is served by the architect page. `afterFiles` — only where the file system has no
  // route of its own (`llms.txt`, `manifest.webmanifest` keep theirs).
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/:lang([a-z]{2})", destination: "/:lang/architect" },
        { source: "/:lang([a-z]{2})/:path*", destination: "/:lang/architect/:path*" },
      ],
      fallback: [],
    };
  },

  // 🔒 МОМЕНТ СБОРКИ ВЫЧИСЛЯЕТСЯ ОДИН РАЗ — ЗДЕСЬ, А НЕ НА ЗАПРОС.
  // `next.config.ts` читается сборкой, и всё, что объявлено в `env`, Next
  // подставляет в бандл literal-ом. Поэтому `/api/health` отдаёт МОМЕНТ
  // СБОРКИ, а не момент старта процесса: вычисли его в модуле маршрута —
  // получишь время загрузки модуля, и после `pm2 reload` без пересборки
  // значение обновится, соврав, что сборка новая.
  env: {
    NEXT_PUBLIC_BUILT_AT: new Date().toISOString(),
  },
};

export default nextConfig;
