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
  title: 'Your own server, brought up by Claude Code',
  subtitle:
    'Fractera AGI is the administrative panel of a platform that starts on your own machine. Claude Code installs the server at home; the Claude Code extension and Cloudflare put it on the internet. Everything you add afterwards is a microservice.',
  description:
    'The administrative panel of Fractera AGI: a server on your own computer, brought up by Claude Code and published through Cloudflare. Sign-in and the data layer come with it; everything else is a microservice you build or import.',
  intro:
    "The starter template is deliberately small: the panel itself, sign-in, and the data layer. Nothing else is installed by default, because everything else is a choice — and a choice made for you is a dependency you did not ask for.",
  keywords: '',
  blocks: [
    {
      kind: 'badges',
      items: [
        { label: 'Runs on your machine', tone: 'code' },
        { label: 'Claude Code installs it', tone: 'muted' },
        { label: 'Cloudflare publishes it', tone: 'muted' },
        { label: 'Telegram works it', tone: 'muted' },
        { label: 'Open code', tone: 'access' },
      ],
    },
    {
      kind: 'cta',
      href: 'https://www.fractera.ai',
      label: 'See the platform',
      secondary: { href: '/en/architecture', label: 'How it is built' },
    },

    { kind: 'h2', text: 'What comes up on your machine' },
    {
      kind: 'p',
      text: 'Three things and no more: this administrative panel, the authorization layer, and the data layer. The panel is where microservices are connected and watched; sign-in is shared, so one person is one person everywhere; the data layer is the single door to the data. Claude Code is installed alongside them — not as a feature of the product, but as the tool you will use to extend it.',
    },

    { kind: 'h2', text: 'How it reaches the internet' },
    {
      kind: 'p',
      text: 'The machine under your desk has no public address, and it does not need one. Claude Code brings the server up locally, and the Claude Code extension together with Cloudflare builds the environment through which the applications become reachable from outside. Nothing about your data leaves the machine in the process: what travels is the request and the answer.',
    },

    { kind: 'h2', text: 'Microservices: build one or import one' },
    {
      kind: 'p',
      text: 'A microservice is one solution — memory that remembers what was said to it, or a site for a hairdresser. You add it in two ways: build it with Claude Code from a template, talking to it here or through Telegram, or import a ready one from the Fractera marketplace, already fitted to this infrastructure. The panel treats both the same, because by the time it sees them they are the same thing.',
    },
  ],
  faq: [],
}
