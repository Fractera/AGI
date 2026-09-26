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
  },
}

export const elementPreview: SectionRenderer<'elementPreview'> = (b, { key: k }) => (
  <ElementPreview key={k} serviceId={b.serviceId} lang={b.lang} words={WORDS[b.lang] ?? WORDS.en} />
)
