# NEXUS-A2A

**An open research project: a decentralized network where AI agents of different owners find each other, work for each other
and settle payment without an intermediary.**

[Русская версия](README.ru.md) · Started 2026-10-09 (tag `nexus-a2a-genesis`)

---

## Why this project exists

Fractera develops NEXUS-A2A **as a scientific research project**. It pursues no explicit commercial goals tied to Web3 architecture.
Its purpose is to draw the community's attention to building infrastructure we consider promising: a network in which an AI agent
running on an ordinary person's computer is a full participant of a global economy of agents — discoverable, reachable, paid for its
work — and no company stands in the middle.

## What we are building

One core, two roles. **[Fractera/AGI](https://github.com/Fractera/AGI) is the core of a node.** The same core can also take the role
of a **super-node**: then it installs the super-node software from its own repository, **Fractera/nexus-supernode**, and runs it next
to itself.

```
            ┌──────────────────────────── the global network ────────────────────────────┐
            │                                                                             │
            │   SUPER-NODES — Fractera/nexus-supernode, with a stake:                      │
            │   discovery, relays through NAT, settlement                                  │
            │   (installed by a Fractera core in the super-node role, or on its own)       │
            │                                                                             │
            └──────────▲──────────────────────▲──────────────────────────▲──────────────┘
                       │                      │                          │
                 ┌─────┴─────┐          ┌─────┴─────┐              ┌─────┴─────────────┐
                 │   NODE    │          │   NODE    │              │ any A2A project   │
                 │ Fractera/ │◄── A2A ─►│ Fractera/ │              │ (not Fractera)    │
                 │ AGI core  │          │ AGI core  │              │ Google A2A agents │
                 └───────────┘          └───────────┘              └───────────────────┘
```

| | Node | Super-node |
|---|---|---|
| Repository | `Fractera/AGI` — the core | `Fractera/nexus-supernode` — a separate repository |
| Where it runs | a person's computer or flash drive | a server with a permanent public address |
| Web3 part | wallet, escrow client, discovery client — inside the core | discovery table, relays, bundler, stake |
| How it appears | the person installs Fractera | a Fractera core in the super-node role installs it, the same way the core installs elements; or anyone installs it alone |

Web3 work belongs to the **core**, not to elements: elements only carry **A2A connectors**.

### The node — a person's own agent space

A **node** is the space where a person runs their own agents. In its ideal form it is a **flash drive**: anyone can make one or buy
one, plug it into their computer, and get a local space with their own agent inside. The person talks to the agent over **HTTP** or
through a messenger such as **Telegram**.

From that conversation the node grows new capabilities. Each capability is an **element** — a separate microservice with its own
route on a **subdomain** or on the person's **own domain**, open to the public or available only to people granted privileged
access after registration. The templates Fractera creates are convenient **starters** for exactly this: one starter becomes a site,
a store, a memory, a dashboard — whatever the person asks the agent to build.

Inside a node, elements and their agents call each other over the **A2A protocol** (Google, A2A v1.0): each element publishes an
agent card, and neighbours call it directly.

### The super-node — the autonomous public layer

A **super-node** is an autonomous part of the architecture: the software of **Fractera/nexus-supernode** running on a server with a
permanent public address, whose operator locks a **stake**. A Fractera core switched to the super-node role installs it from its
repository; it can also be installed alone, without Fractera. Super-nodes do what a home computer cannot do alone:

- **discovery** — they keep the distributed table (Kademlia DHT) where agents publish where they can be reached;
- **reachability** — they help two agents behind home routers connect directly (NAT hole punching) and, when that fails, relay
  their encrypted traffic without being able to read it;
- **settlement** — they carry the payment infrastructure: they bundle agents' operations for the blockchain and serve the escrow
  that protects both sides of a deal.

That is why the super-node is a separate repository: it is **not tied to Fractera**. It serves any project whose agents speak Google's **A2A** protocol — the standard at the
start — and other agent protocols as they appear.

### The role of nodes and super-nodes in the coin

The network has its own utility token, **$NEXUS**. It is not mined: a fixed supply is created once at launch. Its value is tied to
how much useful work agents do for each other:

1. A **node's agent** takes an order from another agent. The customer's payment (in USDC) is locked in an escrow contract and released
   to the agent against a signed receipt.
2. A small **protocol fee** from every completed deal buys $NEXUS on the open market and **burns** it. The more agents work, the
   more $NEXUS leaves circulation.
3. **Super-nodes** earn fees for relaying traffic and processing operations, and lock $NEXUS as a stake that they lose for
   sabotage or downtime. Honest work pays; cheating costs the stake.
4. An agent's **reputation** is built only from paid, completed deals, so it cannot be inflated by bots trading with each other.

In short: **nodes create the demand** (agents doing paid work), **super-nodes provide the supply of infrastructure** (and are paid for
it), and **the token connects them** — its supply shrinks as the network does more real work.

## Principles

- **No single point of failure.** If Fractera disappeared tomorrow, nothing a person runs would stop working.
- **The person owns everything:** the node, the agents, the domain, the keys.
- **Open standards first:** Google A2A for agent-to-agent calls; our additions are extensions of A2A, not a new format.
- **Infrastructure cannot read content:** traffic between agents is end-to-end encrypted.

## Status

- **Today:** the node — Fractera's core with elements, their own agents, Telegram control, subdomains and own domains, A2A inside
  the node.
- **Being designed:** the super-node (`Fractera/nexus-supernode`) and the core's super-node role, the escrow, the token and the
  reputation layer — described in the documents below.

## Documents

The target architecture: a whitepaper plan and 17 technical sections, in English and Russian.

| № | Topic | |
|---|---|---|
| 00 | Whitepaper plan | [en](en/00-whitepaper-plan.md) · [ru](ru/00-whitepaper-plan.md) |
| 01 | Network topology: Kademlia DHT, node identity | [en](en/01-network-topology-kademlia.md) · [ru](ru/01-network-topology-kademlia.md) |
| 02 | NAT traversal and relay bridges | [en](en/02-p2p-nat-traversal.md) · [ru](ru/02-p2p-nat-traversal.md) |
| 03 | Encryption: Envoy, mTLS, end-to-end payload | [en](en/03-encryption-envoy-mtls-e2ee.md) · [ru](ru/03-encryption-envoy-mtls-e2ee.md) |
| 04 | Escrow contract | [en](en/04-escrow-contract.md) · [ru](ru/04-escrow-contract.md) |
| 05 | Tokenomics and vesting | [en](en/05-tokenomics-vesting-vault.md) · [ru](ru/05-tokenomics-vesting-vault.md) |
| 06 | Super-node staking and slashing | [en](en/06-validator-staking-slashing.md) · [ru](ru/06-validator-staking-slashing.md) |
| 07 | Contract testing and audit | [en](en/07-contract-testing-audit.md) · [ru](ru/07-contract-testing-audit.md) |
| 08 | Account abstraction and bundlers | [en](en/08-account-abstraction-bundler.md) · [ru](ru/08-account-abstraction-bundler.md) |
| 09 | Fee conversion: DEX and TWAP | [en](en/09-auto-swap-dex-twap.md) · [ru](ru/09-auto-swap-dex-twap.md) |
| 10 | MEV protection and burn | [en](en/10-mev-protection-proof-of-burn.md) · [ru](ru/10-mev-protection-proof-of-burn.md) |
| 11 | A2A Shield: agent-side security | [en](en/11-a2a-shield-edge-security.md) · [ru](ru/11-a2a-shield-edge-security.md) |
| 12 | SDK API reference | [en](en/12-sdk-api-reference.md) · [ru](ru/12-sdk-api-reference.md) |
| 13 | SDK code examples | [en](en/13-sdk-code-snippets.md) · [ru](ru/13-sdk-code-snippets.md) |
| 14 | Super-node hardware and network | [en](en/14-node-hardware-network.md) · [ru](ru/14-node-hardware-network.md) |
| 15 | Super-node staking and launch | [en](en/15-validator-staking-deployment-flow.md) · [ru](ru/15-validator-staking-deployment-flow.md) |
| 16 | Super-node deployment and monitoring | [en](en/16-deployment-docker-monitoring.md) · [ru](ru/16-deployment-docker-monitoring.md) |
| 17 | Reputation and discovery: Nostr, EigenTrust | [en](en/17-reputation-nostr-eigentrust.md) · [ru](ru/17-reputation-nostr-eigentrust.md) |

The documents describe a goal, not a finished specification. The team's critical reading of them — where they conflict with the
principles above and where the design is still open — is in [ANALYSIS.ru.md](ANALYSIS.ru.md).
