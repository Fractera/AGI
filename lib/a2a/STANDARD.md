# A2A standard — how an AGI ITEM describes itself and how others find and use it

One standard for every element of a node, native or custom, whatever it is built with (Next, Express, no pages).
A2A = elements of ONE node; M2M = nodes of the network. The same shape serves both.

## Levels and operations

| Level | What | find (query → short list) | get (address → full) |
|---|---|---|---|
| 0 · network (M2M) | not found in the node ≠ does not exist | cards of other nodes' elements | link to their passport |
| 1 · node registry | one small **card** per element | ≤ 10 cards | link to the full passport |
| 2 · full passport | everything about the element, in sections | — | the whole passport |
| 3 · element catalog | a tree of any depth: sections, sub-sections, units | ≤ N units | the full unit |
| 4 · answer tools | describe · show · give (copy, install, call) · **contribute** | — | — |

**contribute** writes into another element's state: an element hands a unit to the catalog of the element that accepts
contributions. The receiver checks it (schema, example, block addresses), records origin and version, never overwrites
silently, and answers `accepted` · `pending` (waits for a person's yes) · `refused` with the reason.

## The unit — one shape on every level

```json
{
  "address": "blocks/pricing",
  "kind": "element | block | section | page | variant | …",
  "title": "Pricing",
  "words": "One or two plain sentences: what it is and what it is for.",
  "tags": ["pricing", "section"],
  "parent": "blocks",
  "hasChildren": false,
  "schema": { "in": {}, "out": {} },
  "preview": "/path-or-url",
  "obtain": { "how": "install | copy | call", "door": "/catalog/get" }
}
```

## The passport — `OWN-SERVICE-PROPS.json` → `a2a`

```json
"a2a": {
  "version": 1,
  "summary": "1–2 plain sentences for the card.",
  "visibility": "node | network",
  "capabilities": [ { "name": "table-rows", "words": "store and read rows of tables", "tags": ["data", "storage"] } ],
  "doors": [
    {
      "capability": "table-rows", "protocol": "http | mcp", "method": "GET", "path": "/db/tables/:table",
      "key": "none | session | X-Data-Secret | X-Settings-Key | node-key",
      "input": { }, "output": { "rows": [] }, "errors": { "401": "no or wrong key" },
      "callers": ["*"]
    }
  ],
  "consumes": [ { "capability": "settings", "from": "config", "why": "project name and languages" } ],
  "process": [ { "kind": "signal | schedule | subscription", "what": "re-renders pages when the design changes" } ],
  "catalog": { "find": "/catalog/find", "get": "/catalog/get", "contribute": "/catalog/contribute" },
  "private": ["/api/health"],
  "intent": "optional: what the element should become"
}
```

- `doors[].output` is required; `input` is required for writing methods (POST, PUT, PATCH, DELETE).
- `callers`: `["*"]` = every element of the node with the node key; or a list of element ids.
- `catalog`: `null` when the element offers no catalog.
- `private`: doors that exist in code and are deliberately not offered to neighbours (health, internal callbacks).

## Derived, never written by hand

- **card** (level 1, `lib/a2a/passport.mjs` → `cardOf`): address = element id, title, words = summary, tags = capability
  names and tags, `hasChildren` = has a catalog, fingerprint of the passport, link to the passport. At most 1500 characters.
- **Nostr tags** (M2M): capability names and tags. **LightRAG text** (M2M): summary + capability words. Described only;
  nothing is sent to the network yet.

## Who does what

- The element's `CLAUDE.md` says WHEN to describe itself (first session; the task «describe yourself»; a change that alters
  what it can do). Skills say HOW. The node guards and writes the registry. No timers.
- Guard: `node scripts/check-passport.mjs <element dir>` — form; every door path appears in the element's code; every
  `app/api/**/route.ts` of a Next element is a door or listed in `private`; the card fits its limit.
