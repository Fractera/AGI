# `/architect/blocks` — the element «Blocks» in the core

The page of the node element **Blocks** (`AGI-ITEMS/user/blocks`, the first AGI ITEM of kind user, step 297) in the
core menu — under «Data», with the globe icon like root, auth and data. Built like «Authorization» (the owner's word,
2026-09-25: «удалить все страницы которые там существуют а вместо этого, также как на вкладка авторизация поставить
кнопку Preview и секцию из трёх сервисов Claude Code Agent»).

🪦 The 14 catalogue section pages (hero, pricing, dialogs…) and the guard `check-blocks-catalogue` were removed the same
day: the catalogue and its showcase live in the element itself (`blocks.<zone>`). The block specimens the map generator
reads moved to `lib/content/blocks/specimen.ts`.

| Path | Role |
|---|---|
| `page.tsx` | thin entry: the group home — the element's port and public address (`servicePort`, like auth) |
| `_data/` | the words of the home — `meta` (slug, order, icon) + `en` + `ru` |
| `_components/` | the home content: one `servicePort` block |
| `preview/` | the live preview of the element (`elementPreview`) with «Open in a new tab» |
| `claude-code/` `terminal/` `telegram/` `agent-api/` `_agent-kit/` `agent-kit.json` | the agent kit, installed by `npm run agent-kit:add -- blocks`: the agent lives in `AGI-ITEMS/user/blocks`. Never edit the copy: edit the master (`architect/kits/_agent-kit`) and run `agent-kit:update` |
| `_list.generated.ts` | **generated** — the pages of this group. Never edit |
