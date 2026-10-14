# nodePassport — the node passport: the Lagrix rating of the node and of its elements

**Type:** Page material. The working part of the core page «Passport» (step 478-1).

**Decision of the owner, 2026-10-14:** «посмотри вкладку роман, дизайн в блоке а2а … именно такая карточка у нас должна была лежать в
паспорте и описывать аккумулирующий рейтинг по всем элементам а под ним должны были быть все элементы … Кроме root, нативные элементы
должны быть скрыты … то же самый дизайн который будет иметь полное заголовок, первую строчку описание и возможность раскрыть полное
описание а также интерфейс … если нет описания чтобы его заказать», and «сразу сюда добавь четвёртую колонку отменённые заказы».

How it works: the design is the Lagrix rating card of the element A2A home (`components/element-docs/lagrix-rating.tsx`) with a fourth
tile «cancelled orders» (count and sum, the rejection metric of step 482). On top — the card of the whole node; under it — the same card
for root and every custom element (native services are hidden). Each element card: the name (a link to the element), the first line of
its description, the full description and «what it provides» in an accordion — one open on the page. No description (no `described` in
the registry) — a red dot before the name and a red button «Order a description» that opens the element terminal with the describe task
(`terminalLink`, the same as in the element settings). Every number is «—» until the Lagrix network exists. The page is prerendered; the
island asks `GET /api/node/passport` (architect, admin) once when opened — no polling.
