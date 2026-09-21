import type { HomeCell } from './index'

export const en: HomeCell = {

  eyebrow: 'AGI',

  title: 'Fractera AGI — Web3 infrastructure for your agents',

  subtitle:
    'You do exactly what you did before — only easier and faster, and now you get paid for it as well. Turn your expertise into a microservice and earn from it across the agent network: your node lives on your own machine, finds buyers among other projects itself, and takes payment directly. No platform, no middleman, no centre above you.',
  description:
    'Fractera AGI Infrastructure: a home for your agents on your own computer. Your node declares what it can do in a shared catalogue, other agents find it before they start writing code, and telemetry shows the buyer how many projects already run this microservice.',

  keywords: '',
  blocks: [
    {
      kind: 'heroSplit',

      pill: 'Agentic engineering infrastructure',

      title: '',
      description: 'A node on your own machine: the core, its capabilities and its link to the network. Everything inside the circle is yours.',
      cta: {
        href: 'https://code.claude.com/',
        label: 'Install Claude Code',
        secondary: { href: '/en/architect/build/subscription', label: 'Start building' },
      },

      image: 'agiNode',
      imageAlt: 'Diagram of an AGI node: the core, its capabilities and neighbouring nodes',
      diagram: {
        core: 'Core',
        ring: ['Auth', 'Data', 'Skills', 'Catalogue'],
        peers: 'Neighbouring nodes',
      },
    },

    { kind: 'h2', text: 'Why we call this AGI' },
    { kind: 'p', text: 'Claude Code knows how to build. We added people to it: a specialist in any field turns their experience into a node — and anyone can take that node. Need delivery, speech recognition, tax calculation? You do not write the code — you take someone else’s node, and it becomes part of your architecture. Not one model that knows everything, but a network where each knows its own. Hence AGI.' },

    {
      kind: 'quote',
      text: 'The core is deliberately small: itself, authentication and the data layer. Nothing else is installed by default — everything else is a choice, and a choice made for you is a dependency you did not ask for.',
    },
    {
      kind: 'badges',

      items: [
        { label: 'Open code', tone: 'access' },
        { label: 'Lives on your machine', tone: 'code' },
        { label: 'Sells across the agent network', tone: 'data' },
        { label: 'Paid directly', tone: 'muted' },
        { label: 'No middleman', tone: 'muted' },
      ],
    },

    {
      kind: 'flow',
      badge: 'Blockchain visibility',
      title: 'How to earn from your expertise across the agent network',
      note: 'You have brought the logic and the interface to a state you are not ashamed of. From here that work stops being a private folder: the node settings hold a **blockchain visibility** section, and it turns your microservice into something any agent in the network can buy. You set the rights and the price — including a price of zero.',
      steps: [
        {
          title: 'The architecture writes the description, not you',
          text: 'The algorithms read your documentation and your source code and compose the preliminary description themselves — what the microservice does, what it needs, what it answers. You correct that description rather than invent it from nothing.',
        },
        {
          title: 'One Fractera catalogue for the whole network',
          text: 'The description goes into a single catalogue, and from that moment your node is discoverable by every agent. We take no cut and stand nowhere between you and the buyer: the catalogue is a shop window, not a till.',
        },
        {
          title: 'Another agent finds you before it writes any code',
          text: 'This is what makes the whole scheme work. Anyone who asks their agent for a technical solution gets the catalogue searched FIRST, natively and out of the box. The agent finds existing blocks, offers them for analysis, and only then does the person choose: buy yours, or build their own because their view of the product differs from yours.',
        },
      ],
    },

    {
      kind: 'panel',
      tone: 'accent',
      eyebrow: 'Blockchain',
      title: 'Why a blockchain: every AGI ITEM has an author, a history and a price',
      children: [
        {
          kind: 'p',
          text: 'What you are looking at on this page is what Fractera calls an **AGI ITEM** — one self-contained microservice. It can work alongside others or stay the only one: that is decided by the project, not by the architecture.',
        },
        {
          kind: 'p',
          text: 'Every AGI ITEM is **a node of its own in the blockchain**. It has its own history of activity, its own author and its own price, should you decide to put it up for sale. Trust here is not promised in words: it is presented as a record that cannot be rewritten after the fact.',
        },
        {
          kind: 'h4',
          text: 'What proves the value',
        },
        {
          kind: 'p',
          text: 'Fractera telemetry collects the history of each AGI ITEM as two numbers:',
        },
        {
          kind: 'list',
          items: [
            '**how many different projects installed it**;',
            '**how many people use it**.',
          ],
        },
        {
          kind: 'p',
          text: 'Those two are the best proof of a microservice’s value — they can neither be promised nor faked.',
        },
        {
          kind: 'columns',
          cols: 2,
          children: [
            {
              kind: 'group',
              children: [
                { kind: 'h4', text: 'If you are looking for something ready' },
                { kind: 'p', text: 'Your Claude Code Agent does this under the hood and natively while it builds: it picks what fits, reads the popularity, offers a solution. The choice stays yours.' },
              ],
            },
            {
              kind: 'group',
              children: [
                { kind: 'h4', text: 'If you are selling' },
                { kind: 'p', text: 'A good description, high value and popularity multiply the odds of your profit — because those are exactly what somebody else’s agent reads when choosing between you and your neighbour.' },
              ],
            },
          ],
        },
        {
          kind: 'p',
          text: 'And nothing obliges you to use any of it. Not interested — ignore it: Claude Code Agent will go on building your project the traditional way, fast and cheap.',
        },
      ],
    },
    {
      kind: 'statement',
      text: 'Keep using Claude Code Agent exactly as you always have — and Fractera AGI makes finding and installing microservices as native and as natural as installing skills.',
    },

    {
      kind: 'flow',
      badge: 'The working cycle',
      title: 'Three steps from an idea to a sale',
      note: 'The node is up and running. Open Claude Code and say what you want: it will find a ready solution in the catalogue, pick the right skills, or build the project itself. The third step returns to the first, and every lap costs less than the one before.',
      steps: [
        {
          title: 'Tell the project what to become',
          text: '"Become a site for a hair salon", "become a CRM for medical centres", "become a social media promotion platform" — the subject does not matter. Behind it stand tens of thousands of ready skills and microservices, solutions from the catalogue, and the ordinary programmer-agent mode.',
        },
        {
          title: 'Sell it in one click',
          text: 'Put your expertise into the starter, shape the interface, end up with a product? Set a price — the wallet is created for you, and the microservice becomes available to buyers together with its telemetry.',
        },
        {
          title: 'A new idea arrives — simply carry on',
          text: 'Every product is its own microservice on your server. There is no limit: two microservices, twenty, or two hundred. They coexist and work as one organism.',
        },
      ],
    },

    {
      kind: 'cards',
      badge: 'Run modes',
      title: 'Where to run the node: at home, on your domain, or on a server',
      note: 'The only difference is where the machine stands and whose address the site has. The code, the data and the capabilities are identical — changing mode rewrites nothing.',
      children: [
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Trial: your computer and a temporary address' },
            {
              kind: 'p',
              text: 'You buy nothing and agree with nobody: Claude Code brings the node up, and a minute later you have a working link over a secure connection. The link lives as long as the machine is on and changes on restart — enough to show your work and take the first orders.',
            },
          ],
        },
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Popular: your computer and your own domain' },
            {
              kind: 'p',
              text: 'A permanent address you can say out loud and print on a card, over the same secure channel. You pay the registrar for the domain and pay us nothing. The node stays home: the data never moves, and a switched-off computer means a closed shop — which is honest.',
            },
          ],
        },
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Industrial: a dedicated server, running around the clock' },
            {
              kind: 'p',
              text: 'The same node moves to a VPS and answers buyers while you sleep and while your laptop is shut. You pay the host for the machine, the domain stays yours, the code stays the same — the move rewrites nothing.',
            },
          ],
        },
      ],
    },

    { kind: 'h2', text: 'Node independence: what happens if Fractera disappears' },
    {
      kind: 'p',
      text: 'This is the test we hold every decision against: what stops working for you if Fractera disappears tomorrow? The answer is nothing. The server is yours, the domain is yours, the data is yours, the keys are yours, the code is open and sits on your disk. We do not store your addresses, do not stand between you and the buyer, take no cut of the payment, and cannot switch your node off.',
    },
    {
      kind: 'statement',
      text: 'There is no platform. There is your node, other people’s nodes, and a direct agreement between them.',
    },

    {
      kind: 'cards',
      badge: 'Microservices',
      title: 'Which microservices people start with',
      note: 'Sign-in, a database and skills. Each is a microservice with a life of its own, but everything standing on one machine becomes part of one project: they see each other, share the sign-in and talk directly. Installed one at a time and in any order — the node needs none of them until you decide it does.',
      cols: 3,
      children: [
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Authentication' },
            {
              kind: 'p',
              text: 'Add Fractera authentication and every microservice in your project is protected, role-based access included. Each microservice governs its own visibility on the internet: who gets in — users, subscribers, administrators, or nobody but you.',
            },
          ],
        },
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Database' },
            {
              kind: 'p',
              text: 'Add the database microservice and you get data storage on your own local machine plus object storage for media files and documents. Everything most applications need, with no subscriptions and no dependency on somebody else’s cloud — and, incidentally, in line with what regulators ask for.',
            },
          ],
        },
        {

          kind: 'card',
          children: [
            { kind: 'h3', text: 'Skills' },
            {
              kind: 'p',
              text: 'Several thousand of the most popular skills, already laid out in a knowledge graph. The links between them are built in advance — once, on our side — so your node receives a finished map instead of constructing one for months out of your own requests. After that a conversation is enough: say "I need to generate images" and the right skill tells you how to assemble that technical solution properly inside your microservice.',
            },
          ],
        },
      ],
    },

    {
      kind: 'flow',
      badge: 'The path',
      title: 'Start with one node — everything after that is up to you',
      note: 'A project grows by nodes, and each new one stands beside the others without rebuilding what already works.',
      steps: [
        {
          title: 'The first node is your first service',
          text: 'A landing page, a site or a blog. One node, and it already lives on your machine, opens on the internet and is ready for visitors.',
        },
        {
          title: 'Add a few more',
          text: 'Authentication, a database, skills. And your application already meets the best standards in the field for heavy load and cost efficiency — without you configuring any of it.',
        },
        {
          title: 'After that, anything — and it is a node again',
          text: 'Whatever you think of next is simply one more node in your project: a ready one built by other specialists · a skill that helps you assemble your own · or your own creative work.',
        },
      ],
    },
    { kind: 'p', text: 'Fractera AGI is one node of a bigger idea — see the whole of it on [%SITE%](/en).' },
  ],
  faq: [],
}
