import type { MetadataRoute } from "next";
import { getAppConfig } from "@/config/app-config";
import { SUPPORTED_LANGUAGES } from "@/config/translations/translations.config";

// Static robots (step 131). Config-driven so it stays correct under white-label:
// indexing toggle, disallow paths and sitemap URL come from Site Settings
// (getAppConfig). Architect-only service routes are disallowed here too (they are
// also noindex via the (service) layout metadata).
export const dynamic = "force-static";
export const revalidate = 86_400;

const SERVICE_DISALLOW = [
  "/architecture", "/ai-core", "/ai-draft-settings", "/dashboard", "/debug",
  "/development-steps", "/documents", "/glossary", "/patterns", "/project",
];

// 🪦 КАРТА ТОВАРОВ УДАЛЕНА ВМЕСТЕ С МАГАЗИНОМ (229-3, 2026-09-18). Здесь
// перечислялись порции /products/sitemap/<N>.xml — предмета у них больше нет.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const cfg = getAppConfig();
  const base = cfg.seo?.sitemapUrl ?? `${cfg.url}/sitemap.xml`;
  const sitemapUrl = [base];
  const disallow = [...(cfg.seo?.disallowPaths ?? []), ...SERVICE_DISALLOW];
  const isAllowed = cfg.seo?.indexing !== "disallow";

  if (!isAllowed) {
    return { rules: [{ userAgent: "*", disallow: "/" }], sitemap: base };
  }

  return {
    rules: [
      { userAgent: "Googlebot", allow: "/", disallow },
      { userAgent: "Bingbot", allow: "/", disallow, crawlDelay: 1 },
      { userAgent: "GPTBot", allow: "/", disallow, crawlDelay: 1 },
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
      { userAgent: "ChatGPT-User", allow: "/", disallow },
      { userAgent: "anthropic-ai", allow: "/", disallow, crawlDelay: 1 },
      { userAgent: "ClaudeBot", allow: "/", disallow, crawlDelay: 1 },
      { userAgent: "PerplexityBot", allow: "/", disallow, crawlDelay: 1 },
      { userAgent: "*", allow: "/", disallow, crawlDelay: 1 },
    ],
    sitemap: sitemapUrl,
    host: cfg.url,
  };
}
