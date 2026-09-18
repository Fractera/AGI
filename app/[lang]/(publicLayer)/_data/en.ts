import type { HomeCell } from './index'

// Английская основа главной — стартовый шаблон Fractera AGI (231-1, 2026-09-18).
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
// 🪦 ТЕКСТ ПОКА ЧЕРНОВОЙ (слово владельца: «просто создашь три абзаца для того
// чтобы проверить скролл из секции оглавления»). Детальное описание — позже.
export const en: HomeCell = {
  title: 'Your own node, brought up by Claude Code',
  subtitle:
    'Fractera AGI is one indivisible core that lives on your own machine and becomes whatever you make of it: a site, a shop, a memory, a control screen. Claude Code brings it up at home, Cloudflare puts it on the internet. There is no centre above it — not ours, not anyone else’s.',
  description:
    'Fractera AGI: a node on your own computer, brought up by Claude Code and published through Cloudflare. One core that any application grows out of; sign-in and the data layer come with it, and no middleman stands in between.',
  intro:
    'The core is deliberately small: itself, sign-in, and the data layer. Nothing else is installed by default, because everything else is a choice — and a choice made for you is a dependency you did not ask for.',
  keywords: '',
  blocks: [
    {
      kind: 'badges',
      items: [
        { label: 'Lives on your machine', tone: 'code' },
        { label: 'Claude Code brings it up', tone: 'muted' },
        { label: 'Cloudflare publishes it', tone: 'muted' },
        { label: 'No middleman', tone: 'muted' },
        { label: 'Open code', tone: 'access' },
      ],
    },
    {
      kind: 'cta',
      href: 'https://www.fractera.ai',
      label: 'See the platform',
      secondary: { href: '/en/architecture', label: 'How it is built' },
    },

    { kind: 'h2', text: 'One core, not a set of parts' },
    {
      kind: 'p',
      text: 'There is no separate "site" and separate "admin" inside: it is one mechanism turned to face different ways. The page a visitor sees and the screen you manage from are made of the same parts and live on shared routes. So what is built once works in every guise — as a shop front, a product card, a memory journal, a setting of the node.',
    },

    { kind: 'h2', text: 'What comes up on your machine' },
    {
      kind: 'p',
      text: 'Three things and no more: the core itself, the authorization layer, and the data layer. Sign-in is shared, so one person is one person everywhere; the data layer is the single door to the data, and that door is in your home. Claude Code is installed alongside — not as a feature of the product, but as the tool you will use to extend it.',
    },

    { kind: 'h2', text: 'How it reaches the internet' },
    {
      kind: 'p',
      text: 'The machine under your desk has no public address, and it does not need one: the node opens the connection outwards itself and gets back a working link over a secured channel. You can start without arranging anything with anyone, and when you want a permanent address you connect your own domain — yours, not one handed to you. Your data stays on the machine: what travels is the request and the answer.',
    },

    { kind: 'h2', text: 'The node depends on no one, including us' },
    {
      kind: 'p',
      text: 'The test we hold every decision against is this: what would stop working for you if Fractera disappeared tomorrow? The answer is nothing. The server is yours, the domain is yours, the data is yours, the code is open and sits on your disk. We do not keep your addresses, we do not stand between you and your visitor, and we cannot switch your site off. Hence the shape: every node knows itself and governs itself — and everything is being built towards nodes finding each other and dealing directly.',
    },

    { kind: 'h2', text: 'How the node grows' },
    {
      kind: 'p',
      text: 'A new ability is added by conversation: you tell Claude Code what you need, and it builds it by the rules of this place — static fast pages, shared parts, no foreign layers. A finished solution can also be taken whole: memory that remembers what was said to it, a shop front, an intake form. The node treats both the same, because by the time it sees them they are the same thing.',
    },
  ],
  faq: [],
}
