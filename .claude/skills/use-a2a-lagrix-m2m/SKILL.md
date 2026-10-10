---
name: use-a2a-lagrix-m2m
description: >
  Where a task about agents, deals, prices, ratings, the network or selling an element belongs: «Links (A2A)», Lagrix or
  «Network (M2M)». Load it before touching the element menu sections `connectors` or `web3-store`, the Deals page, the Lagrix
  rating card, a deal summary format, or anything that mentions payment between agents, a token, escrow, a wallet or reputation;
  and whenever a person asks «where does this go?». The rule that changes behaviour: a result of an element's work is A2A (paid —
  settled by Lagrix); the element itself changing hands is M2M, and M2M never calls Lagrix. Preliminary skill (step 436).
---

# use-a2a-lagrix-m2m

> Informational, not binding. **Know a better way for the case in front of you — do it your way and say so.** You are trusted
> with the creative work on this project. Preliminary: written 2026-10-09 before any Lagrix code exists.

## Three words, one question

| Word | What it is | Where it lives in the node |
|---|---|---|
| **A2A** | any work one agent does for another agent — inside the node or across nodes, free or paid | element menu «Links (A2A)»: showcase `connectors/a2a`, **Deals** `connectors/deals`, Lagrix rating card on `connectors` |
| **Lagrix** | the external architecture that settles **paid** A2A work with blockchain transactions (escrow, receipts, token, reputation) | not in this repository: `bolshiyanov/lagrix`, documents `docs/en`, `docs/ru` |
| **M2M** | relations of nodes and of elements as a whole: find, offer, sell an element | element menu «Network (M2M)»: `web3-store/find`, `web3-store/publish` |

**The question that sorts any task:** is the thing changing hands **the element itself** (code, a copy, the right to run it) or
**a result of its work** (a text, a picture, an answer)? The element → M2M. A result → A2A, and if it is paid → Lagrix settles it.

## Rules that hold

- 🛑 **M2M never calls Lagrix** — no escrow, token or wallet in the «Network (M2M)» pages or their doors. Owner 2026-10-09: M2M is
  solved by the node's own built-in mechanisms, not designed yet.
- **The node works without Lagrix.** Nothing that runs today may depend on Lagrix being reachable; only paid deals go through it.
- **No invented numbers.** Until an element is connected to Lagrix the rating card shows «—» for every value
  (`components/element-docs/lagrix-rating.tsx`, words `_i18n/lagrix-rating.i18n.ts`).
- **No personal data in a deal.** A counterparty is an agent's address, never a person's name, e-mail or phone.
- **Core change = question first.** The menu (`lib/agi-items/item-tree.ts`) is shared by every element; moving or renaming a page
  there changes all of them — name it to the person before the edit.

## Where to read more

- Section descriptions: `app/[lang]/(architectLayer)/architect/[item]/_sections/a2a/README.md` and `…/_sections/m2m/README.md`
  (the A2A one lists the deal fields Lagrix will need).
- Instruction: `CLAUDE.md`, «Lagrix, A2A and M2M».
- Lagrix itself: `https://github.com/bolshiyanov/lagrix` — escrow (doc 04), API (12), reputation (17).
