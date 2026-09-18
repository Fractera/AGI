import type { HomeCell } from './index'

// Английская основа главной — Fractera AGI Infrastructure.
//
// 🔒 ФОРМА ВЕРХНЕЙ ЧАСТИ ВЗЯТА С ЛЕНДИНГА ПАМЯТИ (memory.aifa.dev) ПО СЛОВУ
// ВЛАДЕЛЬЦА и объявлена стандартной для приложения: ярлык над заголовком → H1 →
// подзаголовок → мелкий абзац → ряд значков → два действия → оглавление.
// Здесь она собрана НАШИМИ видами каталога, а не перенесена разметкой: у памяти
// своя вёрстка на собственных примитивах, у нас — шапка страницы и блоки.
//
// 🔒 ОГЛАВЛЕНИЕ НЕ ОБЪЯВЛЕНО И ОБЪЯВЛЯТЬСЯ НЕ ДОЛЖНО: вид `toc` строится
// фабрикой из блоков `h2` этого же материала, с теми же якорями. Добавить пункт
// значит добавить раздел — второго списка, который разойдётся с заголовками, не
// существует.
//
// 🔒 СТРАНИЦА ОПИСЫВАЕТ ПРОДУКТ В ЗАКОНЧЕННОМ ВИДЕ — прямое слово владельца
// 2026-09-18: «переписывай так, как будто мы это всё уже реализовали… опиши
// его». Это прототип на временном адресе, он не уходит в продакшн; страница
// показывает замысел целиком, а не сегодняшний срез построенного.
export const en: HomeCell = {
  // 🔒 H1 carries the name, the class and the subject. Web3 is claimed, Web4 is
  // not: the second has no agreed meaning, and claiming it is the same class of
  // risk as saying "open source" where the licence is source-available.
  title: 'Fractera AGI — Web3 infrastructure for your expertise',
  subtitle:
    'Love artificial intelligence — then digitize your expertise and earn crypto with Fractera AGI Infrastructure. Your node lives on your own machine, finds customers among other agents itself, and takes payment directly. No platform, no middleman, no centre above you.',
  description:
    'Fractera AGI Infrastructure: a node on your own computer that turns your expertise into a service. It publishes what it can do, finds customers among agents, does the work and takes crypto directly — with no platform and no middleman.',
  intro:
    'The core is deliberately small: itself, sign-in, and the data layer. Nothing else is installed by default, because everything else is a choice — and a choice made for you is a dependency you did not ask for.',
  keywords: '',
  blocks: [
    {
      kind: 'badges',
      items: [
        { label: 'Lives on your machine', tone: 'code' },
        { label: 'Claude Code brings it up', tone: 'muted' },
        { label: 'Paid directly', tone: 'muted' },
        { label: 'No middleman', tone: 'muted' },
        { label: 'Open code', tone: 'access' },
      ],
    },
    {
      kind: 'cta',
      href: 'https://www.fractera.ai',
      label: 'Bring up your node',
      secondary: { href: '/en/architecture', label: 'How it is built' },
    },

    { kind: 'h2', text: 'What you do' },
    {
      kind: 'flow',
      title: 'Three steps, and the third feeds the first',
      note: 'Expertise becomes a node, the node finds work, the work comes back as money and experience.',
      steps: [
        {
          title: 'Digitize what you know',
          text: 'You tell Claude Code what you are good at: sourcing materials, legal review, cost estimates, reading lab results, translating trade documents. It builds a node out of that — a working service, not a description of one.',
        },
        {
          title: 'The node declares what it can do',
          text: 'It publishes a card: what it does, on what terms, at what price. Other agents read that card directly and come with work — nobody has to find you in a catalogue, and nobody is paid for a place in it.',
        },
        {
          title: 'The work runs, the money arrives',
          text: 'The job runs on your machine, the answer goes back to the customer, and the crypto payment comes to you — directly, with no platform fee, because there is no platform in between.',
        },
      ],
    },

    { kind: 'h2', text: 'Three ways to run it' },
    {
      kind: 'cards',
      badge: 'Modes',
      title: 'One core, three ways to hold it',
      note: 'The only difference is where the machine stands and whose address the site has. The code, the data and the abilities are the same — changing mode rewrites nothing.',
      children: [
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Trial' },
            {
              kind: 'p',
              text: 'Your computer, a temporary address. You buy nothing and arrange nothing with anyone: Claude Code brings the node up, and a minute later you have a working link over a secured connection. The link lives while the machine is on and changes when it restarts — enough to show your work and take the first jobs.',
            },
          ],
        },
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Popular' },
            {
              kind: 'p',
              text: 'Your computer, your own domain. A permanent address you can say out loud and print on a card, over the same secured channel. You pay the registrar for the domain — you pay us nothing. The node stays at home: the data never moves, and a computer switched off means a shop closed, which is the honest trade.',
            },
          ],
        },
        {
          kind: 'card',
          children: [
            { kind: 'h3', text: 'Industrial' },
            {
              kind: 'p',
              text: 'A server of its own, your domain, running around the clock. The same node moves onto a VPS and answers customers while you sleep and while your laptop is shut. You pay the host for the machine, the domain stays yours, the code stays the same — moving rewrites nothing.',
            },
          ],
        },
      ],
    },

    { kind: 'h2', text: 'The node depends on no one, including us' },
    {
      kind: 'p',
      text: 'The test we hold every decision against: what would stop working for you if Fractera disappeared tomorrow? The answer is nothing. The server is yours, the domain is yours, the data is yours, the keys are yours, the code is open and sits on your disk. We do not keep your addresses, we do not stand between you and your customer, we take no cut of the payment, and we cannot switch your node off.',
    },
    {
      kind: 'statement',
      text: 'There is no platform. There is your node, other nodes, and a direct agreement between them.',
    },

    { kind: 'h2', text: 'One core, not a set of parts' },
    {
      kind: 'p',
      text: 'There is no separate "site" and separate "admin" inside: it is one mechanism turned to face different ways. The front a visitor sees, the screen you manage from, the card of a service and the journal of finished jobs are made of the same parts and live on shared routes. The pages are static and fast, so a node on a home machine holds a crowd and a search engine sees all of it. A new ability is added by talking to Claude Code — and works in every guise at once.',
    },
  ],
  faq: [],
}
