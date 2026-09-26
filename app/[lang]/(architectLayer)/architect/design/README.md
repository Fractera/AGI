# `/architect/design` — the Design element's section

Step 309 (owner, 2026-09-26): the design editor left the core. The look of the project is now the node element **Design**
(`AGI-ITEMS/core/design`, repository `fractera-design-starter`): colours of the light and dark theme, fonts, text scale,
shapes and spacing, block settings. A save there sends a signal, and every service of the node re-styles itself in seconds,
without a rebuild. This section is shaped like «Blocks» and «Config».

🪦 The pages `colors`, `fonts`, `type`, `shape` (the core's own editor that patched every element's `DESIGN-CONFIG`
through `/api/architect/design-config` and needed a rebuild) were removed on 2026-09-26. The editor components
(`components/design/*`) and the door stay as the catalogue kind `designSection`; nothing in the core menu leads to them.

## What is here

| Path | Role |
|---|---|
| `page.tsx`, `_data/` | the menu item «Design»: title, lead, `order`, icon |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'design'`: port on the machine and address on the internet |
| `preview/` | live preview of `https://design.<zone>`, with «open in a new tab» |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — `npm run agent-kit:add -- design`; never edited by hand |

## Changing it

Words — `_data/<lang>.ts`; the kit — the master in `kits/_agent-kit/`, then `npm run agent-kit:update -- design`.
The design itself is edited in the element: `design.<zone>/<lang>/architect`.
