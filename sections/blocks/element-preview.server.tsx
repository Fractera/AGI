import type { SectionRenderer } from '@/sections/contract'
import { ElementPreview, type ElementPreviewWords } from '@/components/preview/element-preview.client'

// ПРОСМОТР ЭЛЕМЕНТА (страницы Preview разделов Root, «Вход», «Данные» — слово владельца 2026-09-24).
const WORDS: Record<string, ElementPreviewWords> = {
  en: {
    loading: 'Asking the node where this element answers…',
    unavailable: 'The node did not answer, so the preview is not shown.',
    localOnly: 'This element has no public address: the preview opens only on the computer where the node runs.',
    openNew: 'Open in a new tab',
    reload: 'Reload',
    reloading: 'Asking the element to redraw its pages…',
    reloaded: 'The element redrew its pages — the preview shows the current version.',
    reloadUnconfirmed: 'The element did not confirm the redraw (it may not have this door yet) — the preview was reloaded; a text change still appears within five minutes.',
    highlight: 'Highlight',
    highlightOn: 'Highlight is on: point at a block of the page — a frame shows its address; «Copy address» sends it here.',
    highlightNoAnswer: 'The element did not answer: it cannot highlight blocks yet (elements built from the item template can).',
    picked: 'Selected block',
    copy: 'Copy',
    copied: 'Copied',
    toTerminal: 'To the terminal',
    findPlaceholder: 'Paste a block link, e.g. /en/privacy#block=kns6w',
    find: 'Find',
    findHelp: "Paste the link the element's agent gave you after editing a block (or the «Link» line of a copied address) and press Find: the preview opens that page, scrolls to the block and frames it for 3 seconds.",
    findSearching: 'Opening the page and looking for the block…',
    findNotFound: 'This page has no block with that address — check the link or ask the agent for a new one.',
    findNoAnswer: 'The element did not answer: it cannot find blocks yet (elements built from the item template can).',
    findBadLink: 'This is not a block link: it must end with #block=<address>, e.g. /en/privacy#block=kns6w.',
    findForeign: 'This link points to another element: open that element\'s Preview and paste it there.',
  },
  ru: {
    loading: 'Спрашиваю узел, где отвечает этот элемент…',
    unavailable: 'Узел не ответил, поэтому просмотр не показан.',
    localOnly: 'У этого элемента нет публичного адреса: просмотр открывается только на компьютере, где работает узел.',
    openNew: 'Открыть в новой вкладке',
    reload: 'Обновить',
    reloading: 'Прошу элемент перерисовать страницы…',
    reloaded: 'Элемент перерисовал страницы — в просмотре текущая версия.',
    reloadUnconfirmed: 'Элемент не подтвердил перерисовку (возможно, у него ещё нет этой двери) — просмотр перезапущен; правка текста всё равно появится не позже чем через пять минут.',
    highlight: 'Подсветка',
    highlightOn: 'Подсветка включена: наведите на блок страницы — рамка покажет его адрес; «Скопировать адрес» пришлёт его сюда.',
    highlightNoAnswer: 'Элемент не ответил: он ещё не умеет подсвечивать блоки (умеют элементы, собранные из шаблона элемента).',
    picked: 'Выбранный блок',
    copy: 'Скопировать',
    copied: 'Скопировано',
    toTerminal: 'В терминал',
    findPlaceholder: 'Вставьте ссылку на блок, например /ru/privacy#block=kns6w',
    find: 'Найти',
    findHelp: 'Вставьте ссылку, которую агент элемента дал после правки блока (или строку «Ссылка» из скопированного адреса), и нажмите «Найти»: просмотр откроет эту страницу, прокрутит к блоку и обведёт его на 3 секунды.',
    findSearching: 'Открываю страницу и ищу блок…',
    findNotFound: 'На этой странице нет блока с таким адресом — проверьте ссылку или попросите у агента новую.',
    findNoAnswer: 'Элемент не ответил: он ещё не умеет находить блоки (умеют элементы, собранные из шаблона элемента).',
    findBadLink: 'Это не ссылка на блок: в конце должно стоять #block=<адрес>, например /ru/privacy#block=kns6w.',
    findForeign: 'Ссылка ведёт на другой элемент: откройте Preview того элемента и вставьте её там.',
  },
}

export const elementPreview: SectionRenderer<'elementPreview'> = (b, { key: k }) => (
  <ElementPreview key={k} serviceId={b.serviceId} lang={b.lang} words={WORDS[b.lang] ?? WORDS.en} />
)
