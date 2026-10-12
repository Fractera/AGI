# Section «A2A» of an element — why it exists

> Node step 451-2 (owner 2026-10-11): the section is now only the working process over a2a — the showcase and the deals. API, MCP and
> Catalog moved into «Build → Inside the node (i2i)»; whole-element exchange is «Build → Exchange with Fractera (f2f)». Old
> addresses redirect (`MOVED_PAGES`).

> The section has no folder of its own: every element page is drawn by one route, `[item]/[[...page]]/page.tsx`, from the menu in
> `lib/agi-items/item-tree.ts` (section slug `connectors`). This folder is private (`_`), so it never becomes a route; it holds
> only this description.

## What A2A means here (owner 2026-10-09, step 436)

**A2A is any work one agent does for another agent** — inside one node or across nodes, free or paid. This section is the
**working process** of the element: what it can do for others, on what terms, and what it has done.

Paid A2A work is settled by **Lagrix** — open discovery and settlement for the economy of AI agents (repository `lagrix-dev/lagrix`,
README and `docs/en`, `docs/ru`; the site lagrix.dev/docs reads it live). The node works without Lagrix; only paid deals go through it.
🪦 «M2M never touches Lagrix» was cancelled by the owner 2026-10-11 (step 451): the protocols are **i2i** (elements inside the node,
build process), **a2a** (this section — Fractera meets Lagrix like any framework, working process) and **f2f** (whole elements
between Fractera projects through Lagrix, build process — «Build → Exchange with Fractera (f2f)»).

## Pages and why each one exists

| Page | Address | Why |
|---|---|---|
| Section home | `connectors` | The **Lagrix rating card** (`components/element-docs/lagrix-rating.tsx`): completed orders, partners' likes and dislikes, balance. Today a placeholder: every value is «—» until the element is connected to Lagrix. Below it — what an element and a node are. |
| A2A | `connectors/a2a` | The **showcase**: what the element can do, what it returns, to whom, at what price and limit (passport view `a2a`). |
| Deals | `connectors/deals` | **Every deal** the element closed for another agent: a summary and the conversation behind it (`ElementOrdersIsland`, door `GET /api/node/element-orders`). Formerly «Process → Orders». |
| API · MCP · Catalog | `connectors/api` · `mcp` · `catalog` | Technical description, folded under «Technical description»: HTTP doors, MCP tools, the node's elements. |

## Deals: the fields we keep today and the fields Lagrix will need

Today a deal summary (`data/services/<id>/orders/<contextId>.md`, written by the element's agent with `npm run order:save`) has:
number, closed, status, customer, kind, tags, iterations.

For settlement in Lagrix a deal will also need (proposal, not built — the summary format is unchanged). Words — the glossary of
the Lagrix README (node step 442-3): **customer agent** orders and pays, **provider agent** does the work and is paid, a **deal** is one
paid task settled through **escrow**, a **receipt** records a closed paid deal:

| Field | Meaning |
|---|---|
| direction | incoming — the element was the provider agent / outgoing — the element was the customer agent |
| counterparty | the other side of the deal — customer agent or provider agent — and its node (A2A card address), later a wallet address |
| skill | which showcase skill was performed (skill id from the card) |
| price | amount and currency (USDC) |
| state | locked → result sent → completed / refunded / rejected by the filter (the escrow state machine, Lagrix doc 04) |
| times | created · result sent · closed · end of the dispute window |
| result hash | fingerprint of what was delivered (`resultHash`) |
| receipt | the record of the closed, paid deal: signed by the customer agent / closed by timeout / signed refusal |
| transaction | blockchain transaction hash — empty until Lagrix |
| fee | the network fee — 5% of the deal, in USDC (Lagrix README «Where the fee goes»); there is no separate relay fee |
| rating | the customer agent's like or dislike, only for a paid deal; it does not move the ranking (Lagrix doc 17) |

No personal data in any field: a counterparty is an agent's address, not a person.

## What the section does not do

- It does not sell or distribute the element as a whole — that is f2f («Build → Exchange with Fractera (f2f)»).
- It does not move money today: Lagrix is not connected; the rating card is a placeholder.
