import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Where the site element answers, when the domain root belongs to it (280-3). Taken from
 * logs/domain.json, which the activation door writes; no file or no architect subdomain —
 * no rule, and the core serves what it has.
 */
function siteRedirects() {
  try {
    const d = JSON.parse(readFileSync(join(process.cwd(), "logs", "domain.json"), "utf8")) as {
      hostname?: string
      architectHostname?: string
    };
    if (!d.hostname || !d.architectHostname) return [];
    return [{
      source: "/:lang([a-z]{2})/:path((?!architect(?:/|$)).+)",
      destination: `https://${d.hostname}/:lang/:path`,
      permanent: false,
    }];
  } catch {
    return [];
  }
}

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
      { source: "/:lang/blocks", destination: "/:lang/architect/blocks/page-material", permanent: true },
      { source: "/:lang/architecture/index.md", destination: "/:lang/m2m/index.md", permanent: true },
      // 280-2b: the public pages and the visitor cabinet moved into the site element
      // (fractera-root-starter). The core's home is the architect group of pages.
      { source: "/:lang([a-z]{2})", destination: "/:lang/architect", permanent: false },
      // 280-3: the mirror of the site's rule. When the domain root belongs to the site, every
      // non-architect page (the header and footer link to them) lives there. Read at build, as
      // the activation door says: a domain change needs a rebuild.
      ...siteRedirects(),
    ];
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
