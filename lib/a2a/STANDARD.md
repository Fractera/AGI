# A2A standard of a Fractera node — Google A2A v1.0 plus one Fractera extension

Source of truth: the A2A project, `spec/a2a.proto` (normative) and `docs/specification.md`, v1.0.0
(github.com/a2aproject/A2A). Field names below are copied from `a2a.proto`; JSON uses camelCase (spec: «All JSON
serializations … MUST use camelCase»). Nothing here renames or reshapes an A2A object. What A2A has no field for lives in ONE
extension, the A2A way (`AgentCapabilities.extensions`).

Terms of the node: **A2A** — elements of one node; **M2M** — nodes of the network. Both speak the same AgentCard.
The core is the centre of the node: it holds the registry and tells where a neighbour is; calls go DIRECTLY to the element.
Any element with the node key may call any element. Outside the node only each element's own card is visible. Web3
(Nostr, payments) is not part of the strategy.

## Where things live

| What | Where |
|---|---|
| the element's AgentCard (source) | `OWN-SERVICE-PROPS.json` → `a2a.card` |
| the published AgentCard | `GET /.well-known/agent-card.json` of the element (spec discovery path) |
| node registry entry (level 1) | derived from the card: name, description, skill ids and tags, fingerprint, card URL |

## AgentCard fields used (from `a2a.proto`)

Required by A2A: `name`, `description`, `supportedInterfaces` (`url`, `protocolBinding`, `protocolVersion`), `version`,
`capabilities`, `defaultInputModes`, `defaultOutputModes`, `skills`. Optional used: `provider`, `documentationUrl`, `iconUrl`.
`supportedInterfaces` is filled when the element is served (its address is known only then) and lists ONLY A2A endpoints the
element really implements. Until an element has an A2A endpoint (`message/send` …) the list is empty and the guard warns —
we never announce an interface that does not answer.

AgentSkill: `id`, `name`, `description`, `tags` (required), `examples`, `inputModes`, `outputModes` (media types).
**inputModes / outputModes = «what I accept / what I return»**; `examples` = what a caller would ask in words.

## The Fractera extension — `https://fractera.ai/a2a/ext/node/v1`

Declared in `capabilities.extensions[]` as `{ uri, description, required: false, params }`. `params`:

| Key | Meaning |
|---|---|
| `visibility` | `node` (neighbours only) or `network` (may be announced to other nodes) |
| `doors` | concrete doors per skill: `{ skill, protocol: http|mcp, method, path, key, input, output, errors, callers }` — input/output are JSON examples |
| `consumes` | what the element needs from neighbours: `{ skill, from, why }` — «what I need for this» |
| `process` | what it does by itself: `{ kind: signal|schedule|subscription, what }` |
| `catalog` | `null` or `{ find, get, contribute }` doors of its catalog (levels 3–4) |
| `private` | doors that exist in code and are not offered (health, callbacks) |

Levels of the node and the operations find · get · contribute are described in the step plan; contribute writes into another
element's catalog and the receiver checks it, records origin and version, and answers accepted · pending · refused.

## Guard — `node scripts/check-passport.mjs <element dir>`

A2A required fields of the card and of every skill; extension shape; every door's skill exists; output example on every
door, input on writing doors; door paths appear in code; every Next `app/api/**/route.ts` is a door or `private`; the
registry entry fits 1500 characters; warning while `supportedInterfaces` is empty.
