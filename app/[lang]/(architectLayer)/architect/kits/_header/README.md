# Standard header — one project menu in every service

Read this whole file before installing, wiring, changing or removing the header. It is written for an agent.
The card on the «Ready-made kits» tab (`kit.json`) is for a person; this file is for the one who builds.

## What it gives a service

A header with the **project's** menu — the same buttons as the site, the sign-in service, data and every
future element, including the reserved inert ones (Store, A2A, Nostr, Blog). The owner's word
(2026-09-24): «all services use one and the same menu … wrap themselves, if they want, in our header».

- first level — groups; a group with pages opens a second level with `<details>` (no JavaScript);
- inert groups are visible and not clickable;
- every link is absolute and leads to the **site** (`PROJECT_SITE_URL/<lang>/…`);
- the site did not answer — only the project name is drawn, the page does not break.

## Where it lives

```
kits/header/master/                                   MASTER — the only source; never edit a copy
  next/components/fractera/project-header.tsx         Next: server component <ProjectHeader lang brand />
  express/project-header.mjs                          Express: loadProjectMenu · renderProjectHeader · PROJECT_HEADER_CSS
app/[lang]/(architectLayer)/architect/kits/_header/
  kit.json                                            the card (en, ru)
  install.mjs                                         npm run header-kit:add
  README.md                                           this file
```

The master sits **outside** the core's page tree on purpose: the core's guards (one header, typography)
would read it as a second header of the core. ✗ paid in 283-2.

**Where the menu comes from:** the site (element `root`, `fractera-root-starter`) builds it in
`lib/menu/site-menu.ts → resolveTopGroups` and serves it as the static door `GET /api/menu/<lang>` →
`{ lang, brand, top: Group[], footer: Group[] }`. The same function draws the site's own header — there is no
second copy of the menu logic.

**The project name** is the field `brand` of the same door (site v1.5.0+) — the site's `short_name`, the one
its own header draws. A service never keeps a copy of the name: renaming the project would drift across
services silently. The `brand` prop (Next) or argument (Express) is only a fallback for an older site.

## Install

```
npm run header-kit:add -- <service source folder>             Next
npm run header-kit:add -- <service source folder> --express   Express
```

🔒 Into the service's **source** (its repository or fork), never into `AGI-ITEMS/<kind>/<id>/`: that folder
is a clone at a tag, and a reinstall resets it. Then: commit in the service, tag, bump the version line in
`AGI-ITEMS-CONFIG/agi-items.json`, deploy.

**Environment** — the node installer gives both (kind `derived`); a service never hardcodes them:

| Variable | Value |
|---|---|
| `PROJECT_MENU_URL` | the site's loopback + `/api/menu` (the header adds `/<lang>`) |
| `PROJECT_SITE_URL` | the site's public address on the own domain, otherwise the loopback |

## Wire it

**Next** — in the root layout of `app/[lang]`, first inside `<body>`:

```tsx
import { ProjectHeader } from "@/components/fractera/project-header"

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <body>
      <ProjectHeader lang={lang} />
      {children}
    </body>
  )
}
```

It is a server component and reads the menu **at build time** of a static page: nothing reaches the
browser, the page stays static. Tailwind tokens (`bg-background`, `border-border`, `text-muted-foreground`,
`--radius`) must exist in the service — they do in every node service.

**Express:**

```js
import { loadProjectMenu, renderProjectHeader, PROJECT_HEADER_CSS } from './project-header.mjs'

app.get('/:lang', async (req, res) => {
  const menu = await loadProjectMenu(req.params.lang)
  res.send(`<!doctype html><html><head><style>${PROJECT_HEADER_CSS}</style></head>
<body>${renderProjectHeader(menu, req.params.lang)}…</body></html>`)
})
```

The CSS uses the node's design tokens (`--background`, `--foreground`, `--border`, `--muted`, `--radius`) —
the page must define them (the design door writes them into every element).

## When it changes

| Change | Reaches a Next service | Reaches an Express service |
|---|---|---|
| menu in the site's settings | with the next deployment of the **service** (read at build) | within a minute (cache 60 s) |
| the master itself | reinstall + commit + deploy of the service | the same |

## Extend it

- **Another button or group** — not here. The menu is the site's setting (`APP-CONFIG` `nav.top`, and the
  constructor of step 282); change it there and every service follows.
- **Another field of a group** (an icon, a badge) — three places in one change: `resolveTopGroups` in the
  site (the door serves it) → both masters here → reinstall into every service that carries the header.
- **Look** — edit the master, never a copy. Keep it on tokens: a hardcoded colour breaks the design door.
- **Account button, language switcher, theme** — not in the header yet; each is an island of its own
  service. Adding one to the master is a decision of the owner, because it lands in every service.
- **A third runtime** (not Next, not Express) — a new folder `master/<runtime>/` plus a flag in
  `install.mjs`; the door is plain JSON, any runtime can read it.

## What it does not do

No mobile drawer (the menu wraps on narrow screens), no active-page highlight, no account button. The
reserved buttons have no pages — that is the site's decision, not the header's.

## Remove it

Delete `components/fractera/project-header.tsx` (or `project-header.mjs`) and its import in the service.
Nothing else knows about it; the two environment variables are harmless without it.

## Proven (283-2)

`tsc` of the sign-in service with the header — 0. Express on the live site menu — 9 groups, 4 inert;
with an unreachable menu address — 0 groups and only the project name.
