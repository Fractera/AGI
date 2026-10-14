# nodePassport — the element cards of the node passport

**Type:** Page material. The working part of the core page «Passport» (step 478-1).

**Decision of the owner, 2026-10-14:** «для каждого элемента покажи его название, и … описание которое отображает первые несколько
строк, чтобы оно раскрывалось как аккордеон не более одной вкладки на странице … если описание ещё не существует внутри
раскрывающегося списка … красную кнопку сгенерировать описание … на самой карточке слева отрисовать красную точку». The button leads to
the generation that already works (owner's choice the same day: «Вести в генерацию»).

How it works: the page is prerendered, so the island asks `GET /api/node/passport` (architect, admin) once when opened — no polling.
Cards come from `lib/agi-items/node-passport.ts` on top of `projectRows`: «described» means the registry holds `described` (set only by
«Take into the core», step 325); the full text and «what it provides» come from the registry, the start of the description before that —
from the element's passport or the meta of its home page. The red button opens the element's terminal with the describe task
(`terminalLink`, the same link as in the element settings). Reputation — two roles, weight of likes and weight of dislikes, never
combined — shows «—» until the Lagrix network exists.
