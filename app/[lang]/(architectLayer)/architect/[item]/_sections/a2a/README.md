# Section «Links (A2A)» of an element — why it exists

> The section has no folder of its own: every element page is drawn by one route, `[item]/[[...page]]/page.tsx`, from the menu in
> `lib/agi-items/item-tree.ts` (section slug `connectors`). This folder is private (`_`), so it never becomes a route; it holds
> only this description.

## What A2A means here (owner 2026-10-09, step 436)

**A2A is any work one agent does for another agent** — inside one node or across nodes, free or paid. This section is the
**working process** of the element: what it can do for others, on what terms, and what it has done.

Paid A2A work is settled by **Lagrix** — the external architecture of blockchain settlement between agents (repository
`bolshiyanov/lagrix`, documents in `docs/en` and `docs/ru`). The node works without Lagrix; only paid deals go through it.
M2M is a different section and **never** touches Lagrix — see `../m2m/README.md`.

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

For settlement in Lagrix a deal will also need (proposal, not built — the summary format is unchanged):

| Field | Meaning |
|---|---|
| direction | incoming (the element worked) / outgoing (the element bought work) |
| counterparty | the other agent and its node (A2A card address), later a wallet address |
| skill | which showcase skill was performed (skill id from the card) |
| price | amount and currency (USDC) |
| state | locked → result sent → completed / refunded / rejected by the filter (the escrow state machine, Lagrix doc 04) |
| times | created · result sent · closed · end of the dispute window |
| result hash | fingerprint of what was delivered (`resultHash`) |
| receipt | signed by the customer / closed by timeout / signed refusal |
| transaction | blockchain transaction hash — empty until Lagrix |
| fees | protocol and relay |
| rating | the customer's like or dislike, only for a paid deal |

No personal data in any field: a counterparty is an agent's address, not a person.

## What the section does not do

- It does not sell or distribute the element as a whole — that is M2M («Network (M2M)»).
- It does not move money today: Lagrix is not connected; the rating card is a placeholder.
