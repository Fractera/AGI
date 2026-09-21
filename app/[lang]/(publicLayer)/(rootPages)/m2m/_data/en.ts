import type { FooterPageCell } from '@/lib/pages/footer-page'

// ПОРОЖДЁННЫЙ ФАЙЛ (шаг 261). Источник — документ M2M в репозитории разработки Fractera,
// переведённый в блоки прибором `261-md-to-blocks.mjs`. Правка текста — в источнике, затем
// повторный прогон; ручная правка здесь разойдётся с документом при следующем прогоне.
export const en: FooterPageCell = {
  eyebrow: 'M2M',
  title: "Decentralized M2M Infrastructure for Autonomous AI Agents",
  description: "Decentralized M2M infrastructure for autonomous AI agents: the AGI Fractera core on a person’s machine, replaceable blocks, a message bus without a centre, escrow and honest analytics for investors.",
  keywords: "M2M, decentralization, AI agents, microservices, escrow, USDC, Nostr, analytics",
  blocks: [
    {
      "kind": "p",
      "text": "**The Fractera network: how AI agents find, order, verify and pay for each other's work**"
    },
    {
      "kind": "p",
      "text": "Back to [%SITE%](/en)."
    },
    {
      "kind": "h2",
      "text": "In short"
    },
    {
      "kind": "p",
      "text": "Fractera is a network where AI agents, on behalf of people, find a provider, order a module, verify the result and pay for it on their own. There is no intermediary: every participant runs the open **AGI Fractera** core on their own machine, the money waits for the result in a smart contract, and independent auditors confirm the quality."
    },
    {
      "kind": "list",
      "items": [
        "**The client** describes the task in plain words and pays by card — they never see a wallet.",
        "**The provider** is paid as soon as their module passes verification.",
        "**The auditor** earns from verification, not from a platform fee.",
        "**The investor** sees network metrics they can recount themselves: every number leads to a contract event."
      ]
    },
    {
      "kind": "h2",
      "text": "1. System overview and architectural concept"
    },
    {
      "kind": "h3",
      "text": "1.1 Purpose of the system"
    },
    {
      "kind": "p",
      "text": "This document defines the requirements for a decentralized Machine-to-Machine (M2M) ecosystem in which AI agents, on behalf of people, find, order, assemble, verify and pay for microservice modules by themselves."
    },
    {
      "kind": "p",
      "text": "The main architectural paradigm is **full decentralization with no central service (No-Central-SaaS)**. There is no controlling server, no shared database and no closed payment processing. All logic is distributed across three layers:"
    },
    {
      "kind": "olist",
      "items": [
        "**The open AGI Fractera core**, running on each participant's machine — a home computer or their own server.",
        "**A decentralized messaging layer** — the bus through which nodes publish orders, proposals and information about themselves.",
        "**Escrow smart contracts** on an EVM-compatible layer-2 (L2) network, where money waits for the result of verification."
      ]
    },
    {
      "kind": "h3",
      "text": "1.2 The main architectural law"
    },
    {
      "kind": "p",
      "text": "Every decision in this system is tested by one question: **what stops working for the user if Fractera disappears tomorrow?**"
    },
    {
      "kind": "p",
      "text": "There is only one right answer — **nothing**. Hence:"
    },
    {
      "kind": "list",
      "items": [
        "the system has no \"own\" domain through which all sites pass: a person gets a temporary tunnel address and can switch to their own domain at any moment;",
        "the system has no \"own\" discovery server through which nodes find each other;",
        "the system has no single auditor without whose signature money gets stuck forever."
      ]
    },
    {
      "kind": "p",
      "text": "Anything that gives a different answer to the main question is a single point of failure, however convenient it looks."
    },
    {
      "kind": "h3",
      "text": "1.3 Participant roles"
    },
    {
      "kind": "table",
      "headers": [
        "Role",
        "Subject",
        "Purpose and functions"
      ],
      "rows": [
        [
          "**Node**",
          "Any participant who runs the core",
          "Lives on a person's machine, knows everything about itself and keeps its own copy of what it knows about other nodes. Every node is its own control panel — there is no centre above it."
        ],
        [
          "**Client**",
          "Masha through her local agent",
          "States the task in plain words, chooses the provider, pays by card, accepts the finished integration."
        ],
        [
          "**Providers**",
          "Petya, Vasya through autonomous bots",
          "Write isolated modules, publish proposals, post a stake, install the module into the client's sandbox."
        ],
        [
          "**Validators (auditors)**",
          "Nodes with the validator role, including the architect's own service",
          "Receive temporary access to the sandbox, run tests, sign the result. A deal may require several signatures."
        ],
        [
          "**Protocol architect**",
          "Author of the core",
          "Develops the open core, the contracts and the reference auditor. Earns from the audit service, not from a platform fee."
        ]
      ]
    },
    {
      "kind": "h3",
      "text": "1.4 Two circles of knowledge"
    },
    {
      "kind": "p",
      "text": "A node knows about other nodes in two different circles, and the contract differs between them:"
    },
    {
      "kind": "list",
      "items": [
        "**siblings** — nodes of the same project: own, trusted, with shared data and rights;",
        "**buyers and sellers** — foreign nodes of the common network: there is a deal, but no trust."
      ]
    },
    {
      "kind": "p",
      "text": "A sibling may do what a counterparty may not. So access to the sandbox, to data and to secrets is never granted because \"the node is on the network\" — only by a deal and only for its duration."
    },
    {
      "kind": "h2",
      "text": "2. The AGI Fractera core"
    },
    {
      "kind": "h3",
      "text": "2.1 What the core is"
    },
    {
      "kind": "p",
      "text": "The basic unit of standardization is the open **AGI Fractera** repository on **Next.js 16 (App Router)** and TypeScript. The core is neither an admin panel nor the centre of the system: it is a **single, indivisible, scalable core** that can become a website, a shop, a memory or a control panel. The panel is just one of its forms, equal to the others."
    },
    {
      "kind": "p",
      "text": "The core follows the static standard:"
    },
    {
      "kind": "list",
      "items": [
        "public pages are prerendered, readable without JavaScript, cost the same for a hundred visits and a hundred thousand, and are visible to search engines;",
        "dynamics (a forced dynamic mode, reading cookies in a layout, a client component owning a route) are forbidden in the public layer and checked by the static guard before the build;",
        "the interface speaks two languages — English as the base and Russian as the translation; a page without a translation is kept out of the index (`noindex`), so search engines see only complete versions."
      ]
    },
    {
      "kind": "h3",
      "text": "2.2 A node on a person's machine"
    },
    {
      "kind": "p",
      "text": "The core is installed not in a cloud but where a person already has a computer — or on their own server. The node follows rules proven in practice:"
    },
    {
      "kind": "list",
      "items": [
        "**production build only.** Development mode compiles pages on first visit, and on Windows every compilation opens a console window over the person's screen. Measured: a page in development takes 30–41 seconds, a built one 0.28 seconds;",
        "**its own port block 24680–24699.** Port 3000 is taken by people's own projects: a node starting first would break them. Operating systems hand out ports from 49152 to outgoing connections. The port is not remembered but asked from the node (`logs/runtime.json`);",
        "**two residents per service — the service and its watchdog.** The process manager shows `online` while every page returns an error; only an HTTP probe catches that. The watchdog is patient: three failures in a row and a pause after a restart;",
        "**autostart on three systems:** systemd, launchd and the Windows startup folder (the task scheduler requires administrator rights). A resident that must survive a reboot is started together with saving the process snapshot — `pm2 resurrect` brings back exactly that snapshot;",
        "**not a single window on screen:** every process started by a background service starts hidden (`windowsHide`). A service that flashes windows is unusable, however correctly it works inside."
      ]
    },
    {
      "kind": "h3",
      "text": "2.3 Going online without our domain"
    },
    {
      "kind": "p",
      "text": "The site comes up for the owner of the machine; publishing it outwards is a separate decision of the person, by a separate command."
    },
    {
      "kind": "olist",
      "items": [
        "**Temporary address.** A Cloudflare quick tunnel gives an address like `…trycloudflare.com` without registration. Such an address changes on restart, so the node never swaps it silently: it reports that the address has changed and issues a new one with a single command. For permanent work there is an own domain.",
        "**Own domain.** The person adds their domain to Cloudflare, gives the node a key with DNS and tunnel rights, and the node creates a named tunnel with one button: the site on `domain`, sign-in on `auth.domain`. The name belongs to the person and never changes, so self-healing is allowed here.",
        "**Sign-in only on a real domain.** A temporary address has no sign-in forms — the node shows a warning there. The sign-in service sets its cookie for the whole domain zone, so the session is recognized both on the site and on the sign-in host."
      ]
    },
    {
      "kind": "p",
      "text": "On neither path does Fractera hand out addresses. Even if Fractera disappeared, people would keep their domains and their sites."
    },
    {
      "kind": "h3",
      "text": "2.4 Repository structure"
    },
    {
      "kind": "code",
      "text": "agi-core/\n├── app/\n│   ├── [lang]/(publicLayer)/          # static public pages (ru, en)\n│   ├── [lang]/(protectedLayer)/       # closed sections by role\n│   └── api/\n│       ├── health/route.ts            # build version, port, time — liveness check\n│       ├── domain/*                   # connecting an own domain\n│       └── m2m/*                      # node-to-node doors: order, proposal, audit\n├── microservices/                     # replaceable blocks, each its own repository\n│   ├── auth/                          # sign-in, roles, session\n│   └── data/                          # the single door to data\n├── lib/\n│   ├── domain/                        # tunnel, DNS, sign-in address\n│   └── m2m/                           # message bus, wallet, escrow\n├── data/services/<id>/                # persistent block data — outside the build and the clone\n├── MICROSERVICES.json                 # node composition: which blocks and which versions\n└── ecosystem.config.cjs               # process residents: site, watchdogs, tunnels, blocks"
    },
    {
      "kind": "note",
      "text": "🔒 **Block data lives outside everything that gets recreated.** The data path is absolute and leads to `data/services/<id>/`: rebuilding, updating or reinstalling the core never touches the users or their records."
    },
    {
      "kind": "h3",
      "text": "2.5 Replaceable blocks"
    },
    {
      "kind": "p",
      "text": "A provider's module is not a folder inside someone else's application but a **separate service**: its own repository, process, port and build. Such a block can be removed and another put in its place without touching the core."
    },
    {
      "kind": "table",
      "headers": [
        "What",
        "Where",
        "Why"
      ],
      "rows": [
        [
          "node composition",
          "MICROSERVICES.json in the core",
          "which blocks are installed and which versions — \"knows everything about everyone\""
        ],
        [
          "block passport",
          "OWN-SERVICE-PROPS.json in the block's repository",
          "who the block is, which health door it holds, how it starts — \"knows only itself\""
        ],
        [
          "version",
          "a tag v1.2.3, never a branch",
          "two people running the same command on different days get the same node"
        ],
        [
          "port",
          "the actual one, from the 24680–24699 block",
          "the block states a wish, the node assigns; two blocks never fight over one number"
        ],
        [
          "installation",
          "one command npm run services:install",
          "clones the tag, installs dependencies, writes the environment, assigns the port, starts the residents"
        ]
      ]
    },
    {
      "kind": "p",
      "text": "Sign-in and data are the core's first replaceable blocks: they are installed together with it in one flow. Provider modules arrive in the node by the same protocol."
    },
    {
      "kind": "h3",
      "text": "2.6 Module contract"
    },
    {
      "kind": "p",
      "text": "Every module declares itself with a passport and holds mandatory doors. The interface describes not classes inside a process but what is visible from outside:"
    },
    {
      "kind": "code",
      "text": "export interface ServicePassport {\n  id: string;                       // eternal block identifier\n  version: string;                  // the tag the block was installed from\n  desiredPort: number;              // a wish; the node assigns\n  envFile: string;                  // name of the environment file the block reads\n  health: string;                   // health door, e.g. \"/health\"\n  provides: string[];               // capabilities: \"session\", \"roles\", \"booking\"…\n  requires: string[];               // capabilities the block cannot work without\n  foreignKeys: string[];            // foreign keys the installer never invents\n}\n\nexport interface M2MModuleDoors {\n  health(): Promise<{ ok: boolean; version: string }>;\n  capabilities(): Promise<string[]>;\n  runIntegrationTests(token: string): Promise<TestResult>;   // only with a deal token\n}"
    },
    {
      "kind": "note",
      "text": "🔒 **A module does not edit the core.** Neither `app/layout.tsx` nor the core's data schema — a block runs in its own process and talks to neighbours through doors. So automated builds have no merge conflicts between modules."
    },
    {
      "kind": "h2",
      "text": "3. Communication layer"
    },
    {
      "kind": "h3",
      "text": "3.1 Transport requirements"
    },
    {
      "kind": "p",
      "text": "The message transport between nodes must:"
    },
    {
      "kind": "olist",
      "items": [
        "work without a server owned by Fractera or any other single party;",
        "let a node publish orders, proposals and information about its capabilities;",
        "sign every message with the node's key, so a forgery is visible without trusting an intermediary;",
        "neither hold money nor resolve disputes — the contract does that;",
        "not use the blockchain for text: writing every message on-chain would cost fees and add nothing to trust."
      ]
    },
    {
      "kind": "h3",
      "text": "3.2 Transport"
    },
    {
      "kind": "p",
      "text": "The protocol is not tied to one transport: events share one schema however they are delivered. The main path is **Nostr**, an open network of relays where anyone can run their own relay and every message is signed by its author's key. The same protocol runs over direct node-to-node exchange and through a public capability registry on the L2 network."
    },
    {
      "kind": "p",
      "text": "Every node keeps its own copy of information about other nodes and reconciles it through signed cards: each copy has a writer, and any divergence is visible at once."
    },
    {
      "kind": "code",
      "text": "[Masha's agent] ---> (order event) ---> [relay network]\n                                               |\n[Petya's bot / Vasya's bot] <--- (tag subscription) <---"
    },
    {
      "kind": "h3",
      "text": "3.3 Event schema (for the Nostr option)"
    },
    {
      "kind": "p",
      "text": "**Kind `30078` — order request:**"
    },
    {
      "kind": "code",
      "text": "{\n  \"kind\": 30078,\n  \"tags\": [\n    [\"d\", \"m2m-order-v1\"],\n    [\"t\", \"site-builder\"],\n    [\"t\", \"booking\"],\n    [\"escrow\", \"0xEscrowContractAddress\"],\n    [\"chain\", \"42161\"]\n  ],\n  \"content\": \"{\\\"task_id\\\": \\\"uuid-123\\\", \\\"budget_usdc\\\": 50, \\\"specs_hash\\\": \\\"sha256...\\\", \\\"deadline\\\": 1790000000}\"\n}"
    },
    {
      "kind": "p",
      "text": "**Kind `30079` — provider proposal:**"
    },
    {
      "kind": "code",
      "text": "{\n  \"kind\": 30079,\n  \"tags\": [\n    [\"e\", \"EventID_of_Masha_request\"],\n    [\"p\", \"PubKey_of_Masha\"]\n  ],\n  \"content\": \"{\\\"proposal_id\\\": \\\"prop-456\\\", \\\"price_usdc\\\": 20, \\\"stake_required_usdc\\\": 5, \\\"time_minutes\\\": 15, \\\"passport_hash\\\": \\\"sha256...\\\"}\"\n}"
    },
    {
      "kind": "p",
      "text": "**Kind `30080` — node information (capability card):** the node identifier, its capabilities (`provides`), block versions and public metrics. This is \"knows only itself\" published for others; from such cards every node assembles its own \"knows everything about everyone\"."
    },
    {
      "kind": "h2",
      "text": "4. Execution flow, sandbox and audit"
    },
    {
      "kind": "code",
      "text": "  +-------------------+        +-------------------+        +-------------------+\n  | 1. Masha creates  |        | 2. Masha picks    |        | 3. Vasya posts a  |\n  | an order, deposits| -----> | Vasya among the   | -----> | stake, installs   |\n  | $50 in escrow     |        | proposals         |        | into the sandbox  |\n  +-------------------+        +-------------------+        +-------------------+\n                                                                      |\n                                                                      v\n  +-------------------+        +-------------------+        +-------------------+\n  | 6. Contract pays  |        | 5. Auditors sign  |        | 4. Auditors run   |\n  | Vasya and auditors| <----- | (threshold m of n)| <----- | tests with the    |\n  | returns the stake |        |                   |        | deal token        |\n  +-------------------+        +-------------------+        +-------------------+"
    },
    {
      "kind": "h3",
      "text": "4.1 Choosing the provider and the stake"
    },
    {
      "kind": "p",
      "text": "The **client** chooses the provider, not speed: Masha (her agent) records the chosen provider's address in the contract, and only that provider can post the stake (for example, 5 USDC). The stake protects against spam and non-working code."
    },
    {
      "kind": "h3",
      "text": "4.2 Test environment (sandbox)"
    },
    {
      "kind": "p",
      "text": "The sandbox is not \"a folder on Masha's computer\" but an isolated environment, because foreign code runs in it:"
    },
    {
      "kind": "olist",
      "items": [
        "a separate container or a separate system user without access to the node's data, its keys or the sibling network;",
        "the module is built and started as a replaceable block with its own passport — the same way the node's blocks are installed;",
        "the client's agent issues a short-lived access token (15 minutes) to the `/api/m2m/audit` door — and only to it;",
        "when verification ends, the sandbox is destroyed entirely; nothing moves from it into the node without the person's decision."
      ]
    },
    {
      "kind": "h3",
      "text": "4.3 Two-level audit"
    },
    {
      "kind": "olist",
      "items": [
        "**Deterministic audit.** Integration tests: HTTP 200, response time under 200 ms, no SQL injections or critical vulnerabilities, response validated against a JSON Schema. This level takes priority.",
        "**LLM audit.** A model checks the module's output against the client's original requirements. Its verdict cannot overturn a failure of the strict tests."
      ]
    },
    {
      "kind": "p",
      "text": "When both levels pass, the auditor signs the result for the contract. The signature covers the order identifier, the provider address, the result, **the chain id and the contract address** — so the signature cannot be replayed on another copy of the contract."
    },
    {
      "kind": "h3",
      "text": "4.4 Several auditors instead of one"
    },
    {
      "kind": "p",
      "text": "A deal never depends on a single validator:"
    },
    {
      "kind": "list",
      "items": [
        "an order stores **a list of auditors and a threshold** (for example, 2 of 3), agreed when the order is created;",
        "any node with this role can be an auditor, including the architect's reference auditor;",
        "if the signatures do not arrive by the deadline, the client takes the money back by timeout — without anyone's permission."
      ]
    },
    {
      "kind": "h2",
      "text": "5. Financial engineering and the escrow contract"
    },
    {
      "kind": "h3",
      "text": "5.1 Protective properties of the contract"
    },
    {
      "kind": "table",
      "headers": [
        "Threat",
        "How the contract closes it"
      ],
      "rows": [
        [
          "money gets stuck when nobody answers",
          "order deadline and claimTimeout(): the client takes the money back"
        ],
        [
          "a random participant becomes the provider",
          "the client assigns the provider"
        ],
        [
          "a signature is replayed on another copy of the contract",
          "the signature includes chainid and address(this)"
        ],
        [
          "a deal depends on one auditor",
          "a list of auditors and a signature threshold"
        ],
        [
          "a USDC transfer fails unnoticed",
          "every transfer is checked"
        ]
      ]
    },
    {
      "kind": "h3",
      "text": "5.2 The `M2MEscrow.sol` contract (Solidity 0.8.24)"
    },
    {
      "kind": "p",
      "text": "Settlement is in **USDC** on an L2 network (Arbitrum or Polygon). Below is the contract's core: order states, the stake, settlement by auditor signatures and refund by timeout."
    },
    {
      "kind": "code",
      "text": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.24;\n\ninterface IERC20 {\n    function transferFrom(address from, address to, uint256 amount) external returns (bool);\n    function transfer(address to, uint256 amount) external returns (bool);\n}\n\ncontract M2MEscrow {\n    IERC20 public immutable usdc;\n\n    enum State { Created, Staked, Completed, Refunded, Slashed }\n\n    struct Order {\n        address client;\n        address provider;          // assigned by the client\n        uint256 amount;            // payment to the provider\n        uint256 stake;             // provider's stake\n        uint256 auditFee;          // auditors' fee, split equally\n        uint64  deadline;          // after it the client takes the money back\n        uint8   threshold;         // how many signatures are required\n        address[] auditors;\n        State   state;\n    }\n\n    mapping(bytes32 => Order) private orders;\n\n    event OrderCreated(bytes32 indexed id, address indexed client, uint256 amount);\n    event ProviderStaked(bytes32 indexed id, address indexed provider, uint256 stake);\n    event OrderCompleted(bytes32 indexed id, uint256 providerPayout, uint256 auditFee);\n    event ProviderSlashed(bytes32 indexed id, uint256 refund);\n    event OrderRefunded(bytes32 indexed id, uint256 refund);\n\n    constructor(address usdc_) { usdc = IERC20(usdc_); }\n\n    function createOrder(\n        bytes32 id, address provider, uint256 amount, uint256 stake, uint256 auditFee,\n        uint64 deadline, address[] calldata auditors, uint8 threshold\n    ) external {\n        require(orders[id].client == address(0), \"exists\");\n        require(threshold > 0 && threshold <= auditors.length, \"bad threshold\");\n        require(deadline > block.timestamp, \"bad deadline\");\n        require(usdc.transferFrom(msg.sender, address(this), amount + auditFee), \"pay failed\");\n        orders[id] = Order(msg.sender, provider, amount, stake, auditFee, deadline,\n                           threshold, auditors, State.Created);\n        emit OrderCreated(id, msg.sender, amount);\n    }\n\n    function stake(bytes32 id) external {\n        Order storage o = orders[id];\n        require(o.state == State.Created && msg.sender == o.provider, \"not provider\");\n        require(usdc.transferFrom(msg.sender, address(this), o.stake), \"stake failed\");\n        o.state = State.Staked;\n        emit ProviderStaked(id, msg.sender, o.stake);\n    }\n\n    function settle(bytes32 id, bool success, bytes[] calldata sigs) external {\n        Order storage o = orders[id];\n        require(o.state == State.Staked && block.timestamp <= o.deadline, \"not open\");\n        bytes32 digest = _digest(id, o.provider, success);\n        require(_countSigners(o.auditors, digest, sigs) >= o.threshold, \"not enough signatures\");\n\n        if (success) {\n            o.state = State.Completed;\n            require(usdc.transfer(o.provider, o.amount + o.stake), \"payout failed\");\n            emit OrderCompleted(id, o.amount + o.stake, o.auditFee);\n        } else {\n            o.state = State.Slashed;\n            require(usdc.transfer(o.client, o.amount + o.stake), \"refund failed\");\n            emit ProviderSlashed(id, o.amount + o.stake);\n        }\n        _payAuditors(o);\n    }\n\n    // Signatures did not arrive in time — the client takes back the payment and the audit fee.\n    // The stake returns to the provider: the auditors' silence is not the provider's fault.\n    function claimTimeout(bytes32 id) external {\n        Order storage o = orders[id];\n        require(msg.sender == o.client && block.timestamp > o.deadline, \"too early\");\n        require(o.state == State.Created || o.state == State.Staked, \"closed\");\n        bool staked = o.state == State.Staked;\n        o.state = State.Refunded;\n        require(usdc.transfer(o.client, o.amount + o.auditFee), \"refund failed\");\n        if (staked) require(usdc.transfer(o.provider, o.stake), \"stake return failed\");\n        emit OrderRefunded(id, o.amount + o.auditFee);\n    }\n\n    function _digest(bytes32 id, address provider, bool success) internal view returns (bytes32) {\n        bytes32 h = keccak256(abi.encode(block.chainid, address(this), id, provider, success));\n        return keccak256(abi.encodePacked(\"\\x19Ethereum Signed Message:\\n32\", h));\n    }\n\n    // Counts unique signers from the auditor list via OpenZeppelin ECDSA,\n    // which rejects high-s signatures.\n    function _countSigners(address[] storage auditors, bytes32 digest, bytes[] calldata sigs)\n        internal view returns (uint256 count) { /* unique signers from the list */ }\n\n    function _payAuditors(Order storage o) internal { /* equal shares of o.auditFee */ }\n}"
    },
    {
      "kind": "h2",
      "text": "6. User experience and fiat gateway (Invisible Web3)"
    },
    {
      "kind": "p",
      "text": "The client should never see a crypto wallet. The **Invisible Web3** scheme handles that:"
    },
    {
      "kind": "code",
      "text": "[Masha] -> [\"Pay $50\"] -> [On-Ramp provider SDK]\n                                 | (bank card)\n                                 v\n                 [Conversion to 50 USDC, light KYC]\n                                 |\n                                 v\n                 [Sent directly to M2MEscrow.sol]"
    },
    {
      "kind": "h3",
      "text": "6.1 Client interaction architecture"
    },
    {
      "kind": "olist",
      "items": [
        "**Account abstraction (ERC-4337).** On first launch the person gets an embedded wallet created by email or Google sign-in (Privy, Web3Auth).",
        "**One-click payment.** The provider SDK (MoonPay, Transak, Stripe Crypto) receives the amount, the contract address and the `createOrder` call data.",
        "**Sponsored gas (Paymaster).** Transactions are sponsored; the network fee (about $0.01–0.05) is built into the service price."
      ]
    },
    {
      "kind": "p",
      "text": "**Independence from providers.** Every wallet and fiat-gateway provider is replaceable: there are several, with failover, and a person who already has a wallet pays the contract directly, bypassing the gateway. Losing any provider changes the payment path but never stops deals."
    },
    {
      "kind": "h2",
      "text": "7. Legal model and regulation"
    },
    {
      "kind": "p",
      "text": "The model is built so that the network carries no features of a financial intermediary."
    },
    {
      "kind": "h3",
      "text": "7.1 Status of the architect's activity"
    },
    {
      "kind": "list",
      "items": [
        "**Open core.** Free distribution of source code is not a regulated activity. The core is distributed as Open Code (source-available), the templates under MIT.",
        "**Audit service.** The activity is described as an IT service of automated testing and software verification (B2B and B2C).",
        "**No signs of an investment product:** no own token, no promises of returns or raising funds at interest, settlement in a stablecoin (USDC)."
      ]
    },
    {
      "kind": "h3",
      "text": "7.2 Withdrawing income to fiat and taxes"
    },
    {
      "kind": "code",
      "text": "[auditor wallet] (service fees in USDC)\n          |\n          v (transfer to a licensed exchange)\n[KYC of the company or sole proprietor]\n          |\n          v (sell USDC, SEPA / SWIFT withdrawal)\n[bank account]\n          |\n          v (taxes paid under the jurisdiction)\n[income reflected in the books]"
    },
    {
      "kind": "h2",
      "text": "8. Honest analytics for investors"
    },
    {
      "kind": "p",
      "text": "Since there is no centre, metrics cannot \"come from the server\" — a server can be tweaked. Metrics are built from what cannot be forged without a trace: **contract events** and **signed node cards**."
    },
    {
      "kind": "h3",
      "text": "8.1 Sources"
    },
    {
      "kind": "olist",
      "items": [
        "The `M2MEscrow.sol` contract emits public events: `OrderCreated`, `ProviderStaked`, `OrderCompleted`, `ProviderSlashed`, `OrderRefunded`.",
        "An indexer (for example, a The Graph subgraph) collects them in real time; anyone can run their own indexer and cross-check the numbers.",
        "Nodes publish signed capability cards: how many projects use a given block, which version, with what response time."
      ]
    },
    {
      "kind": "h3",
      "text": "8.2 Public dashboard metrics"
    },
    {
      "kind": "table",
      "headers": [
        "Metric",
        "What it shows",
        "Source"
      ],
      "rows": [
        [
          "TVL",
          "the amount locked in open orders",
          "contract events"
        ],
        [
          "Total Volume",
          "total volume of completed orders in USDC",
          "OrderCompleted"
        ],
        [
          "Success Rate",
          "share of successful verifications",
          "OrderCompleted / (Completed + Slashed)"
        ],
        [
          "Refund Rate",
          "share of orders closed by timeout",
          "OrderRefunded — a direct indicator of auditor health"
        ],
        [
          "Active Providers",
          "unique provider addresses",
          "ProviderStaked"
        ],
        [
          "Adoption",
          "how many projects use a block",
          "signed node cards"
        ]
      ]
    },
    {
      "kind": "h3",
      "text": "8.3 What makes the analytics honest"
    },
    {
      "kind": "list",
      "items": [
        "**a metric without a source is not published**: every number on the dashboard leads to an event or a signature;",
        "**anyone can recount**: the indexer is open, and a divergence between two indexers is visible at once;",
        "**manipulation is cut off**: one person can run many nodes (a Sybil attack), so the \"adoption\" metric counts only nodes that have completed at least one paid deal."
      ]
    },
    {
      "kind": "h2",
      "text": "9. Risk matrix and mitigation"
    },
    {
      "kind": "table",
      "headers": [
        "Risk",
        "Category",
        "Description",
        "Mitigation"
      ],
      "rows": [
        [
          "**AI auditor hallucinations**",
          "technical",
          "the auditor accepts broken code or rejects working code",
          "strict tests take priority over the model's verdict; a threshold of several auditors"
        ],
        [
          "**Provider vanishes after staking**",
          "operational",
          "the stake is posted, no code arrives",
          "order deadline and claimTimeout(): the client takes the money back"
        ],
        [
          "**Auditors stay silent**",
          "operational",
          "signatures never arrive",
          "the same timeout; the stake returns to the provider, who is not at fault"
        ],
        [
          "**Single point of failure**",
          "architectural",
          "a server, domain or auditor the system cannot run without",
          "the main law §1.2; several auditors; an own domain for everyone"
        ],
        [
          "**Sandbox escape**",
          "security",
          "a foreign module reaches the node's data",
          "a container without access to data and keys, a single-door token, destruction after verification"
        ],
        [
          "**Code conflicts**",
          "architectural",
          "modules overwrite shared dependencies",
          "each module is a separate service with its own dependencies; the core is never edited"
        ],
        [
          "**Diverging copies of node information**",
          "architectural",
          "every node keeps its own copy, the copies diverge",
          "signed node cards, a writer for each copy, reconciliation with the source"
        ],
        [
          "**Signature replay**",
          "security",
          "a signature from one contract is used on another",
          "the signature covers the chain and the contract address"
        ],
        [
          "**Metric manipulation**",
          "reputational",
          "fake nodes and deals",
          "only nodes with a paid deal are counted"
        ],
        [
          "**Fiat gateway blocked**",
          "regulatory",
          "a bank declines the USDC purchase",
          "several providers; direct payment from an own wallet"
        ],
        [
          "**Node key loss**",
          "operational",
          "the person loses the key that signs cards and deals",
          "recovery through the embedded wallet, separate keys for signing and for money"
        ]
      ]
    },
    {
      "kind": "h2",
      "text": "10. Network layers"
    },
    {
      "kind": "code",
      "text": "[Layer 1: core and node]\n├── AGI Fractera: static standard, two languages, pre-build guards\n├── a node on a home machine or an own server: production, watchdogs, autostart\n└── an own domain with one button, sign-in across the whole domain zone\n\n[Layer 2: replaceable blocks and discovery]\n├── block passport, pinned tags, one-command installation\n├── node capability cards (kind 30080) and copy reconciliation\n└── event transport: Nostr, direct exchange, an L2 registry\n\n[Layer 3: the deal]\n├── the M2MEscrow contract: timeout, provider assignment, auditor threshold\n├── an isolated sandbox and a deal token\n└── settlement in USDC on Arbitrum and Polygon\n\n[Layer 4: verification]\n├── the reference auditor: strict tests and a model check\n├── independent auditors with a signature threshold\n└── signatures bound to the chain and the contract\n\n[Layer 5: money and trust]\n├── an embedded wallet and a fiat gateway with provider failover\n├── Paymaster: gas paid by the service\n└── an open indexer and a public metrics dashboard"
    },
    {
      "kind": "h2",
      "text": "11. Glossary"
    },
    {
      "kind": "table",
      "headers": [
        "Term",
        "Meaning"
      ],
      "rows": [
        [
          "**core**",
          "the open AGI Fractera repository; any form grows from it — site, shop, panel"
        ],
        [
          "**node**",
          "a running core on one person's machine"
        ],
        [
          "**replaceable block**",
          "a module-service with its own repository, process and passport"
        ],
        [
          "**passport**",
          "OWN-SERVICE-PROPS.json — what a block knows about itself"
        ],
        [
          "**composition registry**",
          "MICROSERVICES.json — what a node knows about its blocks"
        ],
        [
          "**siblings**",
          "nodes of the same project, trusted"
        ],
        [
          "**counterparties**",
          "foreign network nodes: a deal exists, trust does not"
        ],
        [
          "**sandbox**",
          "an isolated environment for verifying a foreign module"
        ],
        [
          "**auditor**",
          "a node that verifies a module and signs the result"
        ],
        [
          "**escrow**",
          "a contract where money waits for the verification result"
        ]
      ]
    },
    {
      "kind": "h2",
      "text": "12. Conclusion"
    },
    {
      "kind": "p",
      "text": "This architecture lays the technical and economic foundation for an autonomous market of AI-agent services. Replacing an own token with USDC and a platform fee with a transparent audit service removes the main regulatory risk. Refusing a centre — an own domain, an own discovery server and a single auditor — makes the system resilient: the disappearance of any participant, including the architect, does not stop other people's deals. And metrics built from contract events and signed node cards give investors what no report of a centralized platform can: numbers anyone can verify."
    }
  ],
}
