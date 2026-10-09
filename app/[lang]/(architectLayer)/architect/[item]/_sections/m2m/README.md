# Section «Network (M2M)» of an element — why it exists

> The section has no folder of its own: every element page is drawn by one route, `[item]/[[...page]]/page.tsx`, from the menu in
> `lib/agi-items/item-tree.ts` (section slug `web3-store`, title «Network (M2M)»). This folder is private (`_`), so it never becomes
> a route; it holds only this description.

## What M2M means here (owner 2026-10-09, step 436)

**M2M is the relations of nodes and of elements as a whole**: find a ready element on other people's nodes before building your own,
offer this element to others — free or for money. It is the **build process**: it is about the element as a thing (code, design,
whole product), not about the work it does while running.

🛑 **M2M has nothing to do with AIFA and never will.** Owner's words: «m2m транзакции вообще никакого отношения не имеют и никогда
иметь не будут к aifa так как всегда будут решаться через встроенные архитектурные решения». Those built-in mechanisms of the node
are not designed yet; nothing in this section may call AIFA, its escrow or its token.

Paid work of a running element (an article, an image, a reply) is A2A and lives in «Links (A2A)» — see `../a2a/README.md`.

## Pages and why each one exists

| Page | Address | Why |
|---|---|---|
| Section home | `web3-store` | What the network is and the two reasons people come here. |
| Find in the network | `web3-store/find` | Look for a ready element on other nodes before building your own (passport view `find`). |
| Offer to the network | `web3-store/publish` | Offer this whole element: share it free or sell it; here is the price of the element itself, not of its skills (passport view `publish`). |

## How to tell M2M from A2A in one question

**Is the thing changing hands the element itself, or a result of its work?** The element itself (its code, a copy, the right to run
it) — M2M. A result of its work (a text, a picture, an answer to a call) — A2A, and if paid, settled by AIFA.
