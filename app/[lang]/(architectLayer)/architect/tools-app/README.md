# `/architect/tools-app` — a group page

This folder is a **group**: it has its own words and it lists the sections next to
it. It is not a special kind of object — a group is a page whose folder happens to
have children, which is why depth costs this project nothing.

## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry: names this folder, exports metadata, renders the index |
| `_data/` | the words of THIS page — `meta` (slug, order) + `en` (base) + `ru` |
| `_components/` | the working part; returns `[]` until something is built here |
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


## Adding a section

Create a folder next to this one with `_data/` and a thin `page.tsx`. Nothing else:
the build regenerates `_list.generated.ts`, and the section appears in this index
and in the left menu by itself. See `../../lib/collection/README.md` for the mechanism
and `../README.md` for this layer's skeleton.
