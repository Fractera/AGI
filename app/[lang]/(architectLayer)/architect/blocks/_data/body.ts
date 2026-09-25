// СЛОВА ГЛАВНОЙ СТРАНИЦЫ ЭЛЕМЕНТА «БЛОКИ» (шаг 297). Сборка в блоки — `../_components/index.ts`; здесь только текст.
//
// Источник — черновик владельца 2026-09-25 («Блоки представляют из себя готовые решения для быстрого проектирования
// проекта…»), сокращён по его слову: «Оформление должно оставаться лёгким, компактным, хорошо читаемым — ты имеешь
// полное право сократить». Раскладка — по образцу главной корня: ряд мер, ярлыки, карточки, три шага.

export type BlocksHomeWords = {
  metrics: { value: string; label: string }[]
  badges: string[]
  why: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  who: { badge: string; title: string; note: string; items: { title: string; text: string }[] }
  custom: { badge: string; title: string; note: string; block: { title: string; text: string }; widget: { title: string; text: string } }
  choose: { badge: string; title: string; note: string; steps: [{ title: string; text: string }, { title: string; text: string }, { title: string; text: string }] }
}

const en: BlocksHomeWords = {
  metrics: [
    { value: '68', label: 'blocks in the starter kit' },
    { value: '14', label: 'sections by purpose' },
    { value: 'API · MCP', label: 'how any project reaches them' },
  ],
  badges: ['Design system', 'Static pages', 'Search-ready', 'shadcn registry', 'MCP', 'Claude Code Agent', 'Web3 MarketPlace'],
  why: {
    badge: 'Why blocks',
    title: 'One style, fewer tokens',
    note: 'Blocks are ready-made solutions for designing a project quickly — with a sane token budget and one consistent look.',
    items: [
      { title: 'They follow the design system', text: 'Change the theme, the fonts or the spacing in the design system — every block adapts to it.' },
      { title: 'Content without a new deployment', text: 'A page is a list of blocks filled with data. Change the data — the page shows it, no deployment needed.' },
      { title: 'Made for static and search', text: 'Their architecture is built for static pages and maximum search visibility.' },
    ],
  },
  who: {
    badge: 'Who works with them',
    title: 'An agent, other projects, a marketplace',
    note: 'Like every AGI ITEM, blocks answer for themselves.',
    items: [
      { title: 'Claude Code Agent', text: 'Blocks ship with their own agent: change one block or all of them at once.' },
      { title: 'MCP blocks', text: 'Your root site or any other application asks the blocks MCP what a block is for, what types it has and what it requires from data.' },
      { title: 'Web3 MarketPlace', text: 'Create your own blocks and sell them: other projects can reuse them.' },
    ],
  },
  custom: {
    badge: 'Any design',
    title: 'When you need a design of your own',
    note: 'Two ways, and the first one is recommended.',
    block: {
      title: 'A new block',
      text: 'Create a new section and a block with your design — a small badge, a section, or a large page with video graphics. One requirement: the block works as a self-contained React component.',
    },
    widget: {
      title: 'A widget',
      text: 'A block is a unit of atomic design and cannot become a complex tool — a furniture calculator or a video editor. Such functions are built as widgets: they give the widest possibilities an application has.',
    },
  },
  choose: {
    badge: 'How to pick',
    title: 'From a section to a page',
    note: 'The starter kit is split into sections by purpose.',
    steps: [
      { title: 'Open the section', text: 'Hero, pricing, testimonials, dialogs — each section below holds the blocks for one purpose.' },
      { title: 'Read the description', text: 'Every block has a description a model reads through MCP to decide whether the block fits the task.' },
      { title: 'Install it', text: 'One command brings the block and everything it depends on into your project.' },
    ],
  },
}

const ru: BlocksHomeWords = {
  metrics: [
    { value: '68', label: 'блоков в стартовом комплекте' },
    { value: '14', label: 'разделов по назначению' },
    { value: 'API · MCP', label: 'как до них доходит любой проект' },
  ],
  badges: ['Дизайн-система', 'Статические страницы', 'Готовы к поиску', 'Реестр shadcn', 'MCP', 'Claude Code Agent', 'Web3 MarketPlace'],
  why: {
    badge: 'Зачем блоки',
    title: 'Единый стиль, меньше токенов',
    note: 'Блоки — готовые решения для быстрого проектирования проекта: разумный расход токенов и единый стиль оформления.',
    items: [
      { title: 'Подчиняются дизайн-системе', text: 'Поменяли тему, шрифты или отступы в дизайн-системе — все блоки подстроились.' },
      { title: 'Контент без нового развёртывания', text: 'Страница — это список блоков, наполненный данными. Поменялись данные — страница их показывает, развёртывание не нужно.' },
      { title: 'Созданы для статики и поиска', text: 'Их архитектура рассчитана на статические страницы и максимальную видимость в поиске.' },
    ],
  },
  who: {
    badge: 'Кто с ними работает',
    title: 'Агент, другие проекты, маркетплейс',
    note: 'Как любой AGI ITEM, блоки отвечают за себя сами.',
    items: [
      { title: 'Claude Code Agent', text: 'Блоки поставляются со своим агентом: меняйте один блок или все сразу.' },
      { title: 'MCP blocks', text: 'Ваш корневой сайт или любое другое приложение спрашивает MCP блоков, для чего блок, какие у него типы и что он требует от данных.' },
      { title: 'Web3 MarketPlace', text: 'Создавайте свои блоки и продавайте их: другие проекты смогут их переиспользовать.' },
    ],
  },
  custom: {
    badge: 'Любой дизайн',
    title: 'Когда нужен свой дизайн',
    note: 'Два пути, и первый — рекомендуемый.',
    block: {
      title: 'Новый блок',
      text: 'Создайте новый раздел и блок со своим дизайном — маленький бейдж, секцию или большую страницу с видеографикой. Требование одно: блок работает как самостоятельный React-компонент.',
    },
    widget: {
      title: 'Виджет',
      text: 'Блок — единица атомарного дизайна и не превращается в сложный инструмент вроде калькулятора мебели или видеоредактора. Такие функции строятся виджетами: они дают самые широкие возможности приложения.',
    },
  },
  choose: {
    badge: 'Как выбрать',
    title: 'От раздела к странице',
    note: 'Стартовый комплект разделён на разделы по назначению.',
    steps: [
      { title: 'Откройте раздел', text: 'Герой, цены, отзывы, модальные окна — в каждом разделе ниже блоки одного назначения.' },
      { title: 'Прочитайте описание', text: 'У каждого блока есть описание: модель читает его через MCP и решает, подходит ли блок для задачи.' },
      { title: 'Поставьте', text: 'Одна команда приносит в проект блок и всё, от чего он зависит.' },
    ],
  },
}

const WORDS: Record<string, BlocksHomeWords> = { en, ru }

export function blocksHomeWords(lang: string): BlocksHomeWords {
  return WORDS[lang] ?? en
}
