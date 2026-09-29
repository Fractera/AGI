# `/architect/dashboard/projects` — every AGI ITEM of the node (step 339)

One block: `projectsBoard` (`sections/blocks/projects-board.server.tsx` → island `components/dashboard/projects-board.client.tsx`).
The page is prerendered, so rows are asked in the browser from `GET /api/node/projects` (architect/admin only), built by
`lib/agi-items/dashboard-rows.ts`. Nothing about the machine is baked into the build.

Columns (owner's list): № · service address (`<address>.<zone>`) · meta title · meta description · own domain · for sale in
web3 · last commit · status (running / stopped / building) · date of the last commit · number of commits · link (the site) ·
open (the element's page in the core) · users online.

- **native / custom** — the same split as the left menu: custom = drafts (`data/agi-drafts.json`), native = the rest of the registry.
- **status** is measured, not remembered: `building` = deploy lock, preview build or birth running for this id; otherwise the
  element's port answers → `running`, does not → `stopped`; a draft that was never born → `not born`.
- **meta title / description** — read from the element's own home page (`/<lang>`, then `/`), 3 s timeout; no answer → «—».
- **for sale in web3** and **users online** have no source in the node yet — shown as «—» (owner 2026-09-30: «Колонки с «—»»).
  Counting online would be new system behaviour (pages signalling the node) and needs its own word from the owner.
