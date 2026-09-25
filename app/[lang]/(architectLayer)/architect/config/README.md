# `/architect/config` — the CONFIG element's section

The node element CONFIG (`AGI-ITEMS/core/config`, project settings every service reads)
as seen from the architect layer. Built as a clone of `/architect/data` by the owner's
word of 2026-09-25: same shape, only the element id differs.

## What is here

| Path | Role |
|---|---|
| `page.tsx` | thin entry; the menu item "Config" |
| `_data/` | `meta.ts` (slug `config`, `order` 24.5 — right under "Data"), `en.ts`, `ru.ts` |
| `_components/index.ts` | one block `servicePort` with `serviceId: 'config'`: port on the machine and address on the internet |
| `preview/` | live preview (`elementPreview`), opens `https://config.<zone>` in a new tab too |
| `claude-code/`, `terminal/`, `telegram/`, `agent-api/`, `_agent-kit/`, `agent-kit.json` | the agent kit — written by `npm run agent-kit:add -- config`, never edited by hand; the agent works in `AGI-ITEMS/core/config` |

## Changing it

- Words — `_data/<lang>.ts` and `preview/_data/<lang>.ts`; `en` is mandatory, `ru` overrides.
- The agent kit — edit the master in `kits/_agent-kit/`, then `npm run agent-kit:update -- config`.
- The service's own settings screens live in CONFIG itself (`config.<zone>/<lang>/architect`),
  not here: this section only shows where the element lives and gives it an agent.

Mechanism: `../../lib/collection/README.md`. Layer skeleton: `../README.md`.
