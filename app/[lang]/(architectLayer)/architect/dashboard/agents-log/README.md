# `/architect/dashboard/agents-log` — the agents' conversation of the node (step 408)

One block: `a2aFeed` (`sections/blocks/a2a-feed.server.tsx` words → island `components/dashboard/a2a-feed.client.tsx`).
The page is prerendered; the island asks `GET /api/node/a2a-log` (architect/admin or node key) for the last 100 calls, then
`after=<last id>` every 3 s while the tab is visible (owner 2026-10-05: «Опрос раз в 3 с»), and «Show earlier» pages back.

Where the rows come from: an element's A2A endpoint hands every call — refusals too — to the core (`POST /api/node/a2a-log`,
node key; `lib/a2a/conversation-log.ts`), and the core writes it to the data layer (`/a2a-log`, the last 10 000 kept, keys
stripped, bodies ≤ 8 KB). Today only the sample element roman logs (step 406); the template follows after it.

What the page shows: each call as two messages — the caller's question (the skill input or text) and the receiver's answer
(the task result, the refusal or the protocol error) — with the agent's address (owner: name the agent by its address), time, skill, state and milliseconds; the question sits left with the stripe on its right, the answer right with the stripe on its left — the stripe is always on the empty side. The 6 px
stripe is coloured from the agent's address by `lib/a2a/address-hue.ts` (one address — always one hue; separate lightness for
light and dark theme). Toggles: one per agent, «Everyone», «No one» — they change only what is shown. No input field.
