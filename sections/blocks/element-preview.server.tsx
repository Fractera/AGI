import type { SectionRenderer } from '@/sections/contract'
import { ElementPreview, type ElementPreviewWords } from '@/components/preview/element-preview.client'

// ПРОСМОТР ЭЛЕМЕНТА (страницы Preview разделов Root, «Вход», «Данные» — слово владельца 2026-09-24).
const WORDS: Record<string, ElementPreviewWords> = {
  en: {
    loading: 'Asking the node where this element answers…',
    unavailable: 'The node did not answer, so the preview is not shown.',
    localOnly: 'This element has no public address: the preview opens only on the computer where the node runs.',
  },
  ru: {
    loading: 'Спрашиваю узел, где отвечает этот элемент…',
    unavailable: 'Узел не ответил, поэтому просмотр не показан.',
    localOnly: 'У этого элемента нет публичного адреса: просмотр открывается только на компьютере, где работает узел.',
  },
}

export const elementPreview: SectionRenderer<'elementPreview'> = (b, { key: k }) => (
  <ElementPreview key={k} serviceId={b.serviceId} lang={b.lang} words={WORDS[b.lang] ?? WORDS.en} />
)
