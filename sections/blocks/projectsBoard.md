# projectsBoard — the projects table of the node

**Type:** Page material. The working part of «Dashboard → Projects» (step 339).

**Decision of the owner, 2026-09-29:** «После кнопки паспорт в левом меню добавлять кнопку Dashboard … кнопку проекты … нашу
стандартную таблицу которые имеют пагинацию … Вверху будет чекбокс: показывать нативные AGI items, показывать кастомные AGI
ITEMS, также поиск который ищет по адресу сайта по описание». Columns in his order: № · service address · meta title · meta
description · own domain · for sale in web3 · last commit · status (running / stopped / building) · date · number of commits ·
link · open · users online.

**Decision of the owner, 2026-09-30:** «for sale in web3» and «users online» have no source in the node — the columns stay and
show «—». Counting online would be new system behaviour and is not built without his separate word.

How it works: the page is prerendered, so the island asks `GET /api/node/projects` once when opened (no polling — not ordered).
Rows come from `lib/agi-items/dashboard-rows.ts`: native = registry entries that are not drafts, custom = drafts — the same split
as the left menu. The state is **measured**: the element's port answers → running; deploy lock, preview build or birth for this
id → building; a draft never born → not born. Meta title and description are read from the element's own home page.
The table is the standard `TableTools` (search on top, pages below, horizontal scroll) with its optional `toggles` — two checkboxes.
