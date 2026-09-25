# `/architect/blocks` — the main page of the element «Blocks»

The page of the node element **Blocks** (`AGI-ITEMS/user/blocks`, the first AGI ITEM of kind user, step 297) in the
core menu — under «Data», with the globe icon like root, auth and data. It is also a **group**: the 14 section pages
next to it (hero, pricing, dialogs…) are listed under the content as cards — that list is the preview of the blocks.
Text: the owner's draft of 2026-09-25, shortened on his word («лёгким, компактным, хорошо читаемым»).
## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry: names this folder, exports metadata, renders the index |
| `_data/` | the words of THIS page — `meta` (slug, order, icon) + `en` (base) + `ru` — title and lead |
| `_data/body.ts` | the body text, en + ru: metrics, badges, «why», «who», «any design», «how to pick» |
| `_components/` | assembles the body into catalogue blocks (metrics, badges, cards, flow) — no words here |
| `_list.generated.ts` | **generated** — the sections of this group. Never edit |

## Multilingual

`_data/en.ts` is the base and is mandatory; `_data/ru.ts` overrides it. A language
we do not have falls back to `en`, so a missing translation degrades to a readable
page rather than a hole. Every visible string of this page lives in `_data` —
never inline in `page.tsx` or `_components/`, or it is untranslatable and invisible
to `npm run check:i18n`.

Two languages here (`en` + `ru`), not 82: this layer is one closed surface behind
a lock, not a reused part of the product. The reasoning is in the layer README.

## Search engines and AI agents

This page carries the **full** set of signals, because the template is meant to be
reusable in a public layer too — not only behind this lock:

| Signal | Where it comes from | Value here |
|---|---|---|
| `<title>` | `_data/<lang>.ts` → `title` | the page's own name, per language |
| `description` | `_data/<lang>.ts` → `lead` | its own sentence; never inherited, never shared |
| `canonical` | `buildAlternates` | the page's one true address |
| `hreflang` | `buildAlternates` | `x-default`, `en`, `ru` — all pointing at each other |
| `alternate text/markdown` | `buildAlternates` | the machine-readable twin, for agents |
| `og:*` | the metadata factory | title, description, url, site name, locale |
| `robots` | `_lib/collection-visibility.ts` | follows one switch, see below |

🔒 **Two language versions that do not point at each other read as duplicates.**
That is precisely how a site earns the "doorway" label — a set of near-identical
pages with no declared relation. The `hreflang` block is what turns them into one
page in two languages, so it is emitted in **both** visibility modes.

🛑 **One switch decides three things at once** — `ARCHITECT_LAYER_IS_PUBLIC` in
`_lib/collection-visibility.ts`: the `robots` tag, presence in `sitemap.xml`, and
the `robots.txt` rule. They must agree: a page listed in the sitemap that answers
404 to a stranger is worse than an unlisted one — the sitemap stops being
trustworthy as a whole. While the layer is locked, all three say "closed".

🛑 **`canonical` and `hreflang` appear only once the site has an address.** With an
empty `url` in `APP-CONFIG`, `buildAlternates` returns nothing at all — measured,
and true for every page of this project, not just this layer. That is the correct
behaviour rather than a gap: a canonical pointing at a temporary tunnel address
would be a lie the day the tunnel rotates. The address arrives with a real domain
(see `/architect/hosting/domain`).


## Build cost

1. **The body text is baked into the build today** (`_data/body.ts` is code): a text edit costs a core rebuild
   (measured 2026-09-25: ~5 min — compile 3.2 min, TypeScript 114 s). Reading it at run time from the blocks element
   (`'use cache'` + `cacheLife`) is the target once the core is on Cache Components (step 295-3).
2. **One source, the page names only itself.** The section list is generated (`_list.generated.ts`); the blocks of
   each section come from `sections/taxonomy.json` through `_components/type-catalogue.ts`.
3. **Guards of this area run in seconds** — `npm run check:blocks-catalogue`, `build:blocks-map` — run them before
   the build, not inside it.
4. **Rebuild only the core** for this page: `npm run serve:rebuild`. No element is deployed for it.

## Caching (Next 16)

The core is **not yet** on Cache Components (step 295-3): this page is prerendered by the old model and is fully
static (measured: `.next/server/app/ru/architect/blocks.html`). When the core moves:
1. no segment config here — `dynamic`, `revalidate`, `dynamicParams` are forbidden (`check-segment-config`);
2. text and counts taken from the blocks element → a cached function, `cacheLife('minutes')`;
3. no current time or request data in this page — it has none today;
4. proof: `scripts/route-kinds-snapshot.mjs --diff` — the page stays static.

## Adding a section

Create a folder next to this one with `_data/` and a thin `page.tsx`. Nothing else:
the build regenerates `_list.generated.ts`, and the section appears in this index
and in the left menu by itself. See `../../lib/collection/README.md` for the mechanism
and `../README.md` for this layer's skeleton.
