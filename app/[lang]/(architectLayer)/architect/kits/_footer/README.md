# Standard footer — the project's footer pages in every service

Read this whole file before installing, wiring, changing or removing the footer. It is written for an agent.
The card on the «Ready-made kits» tab (`kit.json`) is for a person; this file is for the one who builds.

## What it gives a service

The **whole** footer of the project: the footer pages the architect switched on in the panel (privacy,
terms, cookies, accessibility — and any the owner adds) plus the copyright line. The owner's word
(2026-09-24): «footer means the whole footer, which may also get footer pages if the architect activates
them in the panel … these pages are public, so they must be regulated by law no worse and no better than
an ordinary site».

- footer pages are **off by default** (`footerPages` in the site's `PLATFORM-CONFIG`): then only the
  copyright line is drawn;
- every link is absolute and leads to the **site's** page (`PROJECT_SITE_URL/<lang>/privacy`): the legal
  text lives once, at the site, and a service never keeps a copy of it;
- the site did not answer — only the copyright line, the page does not break.

## Where it lives

```
kits/footer/master/                                   MASTER — the only source; never edit a copy
  next/components/fractera/project-footer.tsx         Next: server component <ProjectFooter lang brand />
  express/project-footer.mjs                          Express: loadProjectFooter · renderProjectFooter · PROJECT_FOOTER_CSS
app/[lang]/(architectLayer)/architect/kits/_footer/
  kit.json                                            the card (en, ru)
  install.mjs                                         npm run footer-kit:add
  README.md                                           this file
```

**Where the list comes from:** the site's static door `GET /api/menu/<lang>`, field `footer`, built by
`lib/menu/site-menu.ts → resolveFooterGroups` in `fractera-root-starter` — the same function draws the
site's own footer. The header kit reads field `top` of the same door (`../_header/README.md`).

## Install

```
npm run footer-kit:add -- <service source folder>             Next
npm run footer-kit:add -- <service source folder> --express   Express
```

🔒 Into the service's **source** (its repository or fork), never into `AGI-ITEMS/<kind>/<id>/`: that folder
is a clone at a tag, and a reinstall resets it. Then: commit in the service, tag, bump the version line in
`AGI-ITEMS-CONFIG/agi-items.json`, deploy.

**Environment** — the same two variables as the header, given by the node installer (kind `derived`):
`PROJECT_MENU_URL` (the site's loopback + `/api/menu`) and `PROJECT_SITE_URL` (where the links lead).

## Wire it

**Next** — in the root layout of `app/[lang]`, last inside `<body>`; give the body a column so the footer
sits at the bottom of short pages:

```tsx
import { ProjectHeader } from "@/components/fractera/project-header"
import { ProjectFooter } from "@/components/fractera/project-footer"

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return (
    <body className="flex min-h-screen flex-col">
      <ProjectHeader lang={lang} brand="My project" />
      <main className="flex-1">{children}</main>
      <ProjectFooter lang={lang} brand="My project" />
    </body>
  )
}
```

A server component, read **at build time** of a static page. With both kits in, the door is asked twice
per page at build (once by each) — cheap, since it is a static file of the site; nothing runs at request time.

**Express:**

```js
import { loadProjectFooter, renderProjectFooter, PROJECT_FOOTER_CSS } from './project-footer.mjs'

app.get('/:lang', async (req, res) => {
  const footer = await loadProjectFooter(req.params.lang)
  res.send(`<!doctype html><html><head><style>${PROJECT_FOOTER_CSS}</style></head>
<body style="display:flex;flex-direction:column;min-height:100vh">…${renderProjectFooter(footer, req.params.lang, 'My project')}</body></html>`)
})
```

The CSS uses the node's tokens (`--background`, `--foreground`, `--border`, `--muted-foreground`,
`--primary`) — the page must define them.

## When it changes

| Change | Reaches a Next service | Reaches an Express service |
|---|---|---|
| footer pages switched on/off or renamed in the site's panel | the **site** is deployed (its door is static), then the **service** is deployed | the site is deployed, then within a minute |
| the master itself | reinstall + commit + deploy of the service | the same |

## Extend it

- **Another legal page** — a page of the site plus an entry in the site's `nav.footer`; every service
  follows. Never add a page to a service's own footer: the law applies to the project, not to one service.
- **Words** — `WORDS` in both masters, `en` is mandatory, `ru` overrides; a missing language falls back to
  `en` (AGI is two languages, step 255).
- **Socials, address, theme and language switchers** (the site's footer has them) — not in the kit yet.
  Socials and address would come as new fields of the site's door, like `footer`; switchers are islands of
  each service. Both land in every service, so both are the owner's decision.
- **Cookie consent** — the footer links to the cookies page only; a consent banner is a separate piece and
  is the site's (`cookieBanner`). A service that sets its own cookies needs its own consent — say so to the
  owner, do not hide it.

## What it does not do

It does not write or check legal text, does not show a cookie banner, and does not know which pages the
law requires in a given country — that is the owner's choice in the panel.

## Remove it

Delete `components/fractera/project-footer.tsx` (or `project-footer.mjs`) and its import in the service.

## Proven (283-3)

`tsc` of the sign-in service with the footer — 0; the same file corrupted — `TS2322`, code 2. Express with
four footer pages switched on — four absolute links to the site plus the copyright; with an unreachable
menu address — only the copyright. The live site door today: `footer` is empty (pages not switched on).
