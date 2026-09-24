# Page lock — «This page is not available to you»

Read this whole file before embedding, changing or removing the lock. Written for an agent; the card (`kit.json`) is
for a person.

## What it gives

The dialog over a closed group of pages of any node element. The owner's word (2026-09-24): «this dialog is a universal
reusable module … any AGI ITEM always and everywhere uses this logic». It shows the roles the group needs and three
buttons:

- **«I have access — sign in»** — to the node's one sign-in service (`signInRedirectUrl`), asking for the role the page
  needs (`architect` when the group needs it, else `user`) and returning to this very page (`?signed-in=1`);
- **«Home»** — `homeHref`: the **project root**. 🛑 Never a page under the same lock: in the core the home of its own
  address is the architect layer itself, and the button looped back to the lock (the owner hit it, step 294);
- **«Cancel»** — back in history, or «Home» when there is none.

Open without the dialog: the owner at the machine (loopback), the quick tunnel, the showcase address.

## Where it lives

```
components/auth/access-gate.client.tsx   the lock — ONE file, the same in the site (fractera-root-starter) and the core
components/auth/access-gate.i18n.ts      its words (en, ru)
components/dialog/app-dialog.*           the shared dialog it uses
lib/runtime-urls.ts                      signInRedirectUrl, apexFrom (KNOWN_PREFIXES knows `architect` — step 285)
scripts/check-shell-kits.mjs             guard: the core's copy must equal the site's
```

## Embed (the layout of a closed group)

```tsx
<AccessGate roles={ARCHITECT_LAYER_ROLES} lang={lang} ui={accessGateUi(lang)} dialogUi={appDialogUi(lang)}
  homeHref={projectRoot /* e.g. `${coreShellWhere().siteUrl}/${lang}` in the core */}>
  {children}
</AccessGate>
```

🔒 The layout does not read the session (`auth()` / `cookies()` would make the whole group dynamic); the lock asks
`/api/me` after hydration. The real lock is on the doors `/api/*`.

## Extend

- **Change the look or the buttons** — edit the file in the SITE, copy it to the core (`cp`), the guard confirms.
- **Another element on Next** — copy the file with its i18n and the dialog; pass its own `homeHref`.
- **A non-Next element** — cannot run it; it needs its own static lock page (open question).

## Proven (294)

The core passes `homeHref` = the site root; the guard compares the core's copy with the site's.
