# a2aFeed — the agents' conversation feed of the node

**Type:** Page material. The working part of «Dashboard → Agents' conversation» (step 408).

**Decision of the owner, 2026-10-05:** «интерфейс в формате чат, в котором пользователь не может писать, но может
просматривать … подсвечивать не только имя агента, но и ещё какую-нибудь специфическую цветную полоску, типа бордюр в шесть
пикселей … субдомен … перегонять в идентификатор цвета … вверху нужно сделать переключатели … выключить можно всех, включить
любого одного или всех сразу». Refresh: «Опрос раз в 3 с» while the tab is visible.

How it works: every A2A call that reaches an element's endpoint is handed to the core (`POST /api/node/a2a-log`) and written to
the data layer (`/a2a-log`, the last 10 000 kept). The page is prerendered; the island asks `GET /api/node/a2a-log` (architect/admin)
for the last 100 calls, then `after=<last id>` every 3 s while visible. A call is two messages — the caller's question and the
receiver's answer, refusals included; each carries the agent's name and a 6 px stripe coloured from its address by
`lib/a2a/address-hue.ts`. Toggles only change what is shown. There is no input field.
