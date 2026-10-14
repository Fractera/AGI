import type { SectionRenderer } from '@/sections/contract'
import { NodePassport, type NodePassportWords } from '@/components/dashboard/node-passport.client'
import { lagrixRatingUi } from '@/app/[lang]/(architectLayer)/_i18n/lagrix-rating.i18n'

// «ПАСПОРТ» УЗЛА (478-1): слова берутся здесь, на сервере, и уходят островку пропсами. Слова карточки рейтинга — те же, что на
// главной A2A элемента (`lagrixRatingUi`), здесь только заголовки и подписи паспорта.
const WORDS: Record<string, Omit<NodePassportWords, 'rating'>> = {
  en: {
    nodeTitle: 'The node rating in Lagrix',
    nodeLead: 'The accumulated rating of all elements of this node: every deal any of them closes in Lagrix adds here.',
    nodeNote: 'The numbers appear when the node is connected to Lagrix.',
    elementNote: 'The numbers appear when the element is connected to Lagrix.',
    root: 'Root element',
    custom: 'Custom element',
    loading: 'Asking the node about its elements…',
    unavailable: 'The node did not answer, so the elements are not shown.',
    empty: 'The node has no elements with a rating yet.',
    noDescription: 'No description yet.',
    generate: 'Order a description',
    notBorn: 'The element is not born yet — a description can be ordered after its birth.',
    fullDescription: 'Full description',
    provides: 'What it provides',
    openElement: 'Open the element',
  },
  ru: {
    nodeTitle: 'Рейтинг узла в Lagrix',
    nodeLead: 'Накопленный рейтинг всех элементов этого узла: каждая сделка, которую любой из них закрывает в Lagrix, добавляется сюда.',
    nodeNote: 'Показатели появятся, когда узел подключится к Lagrix.',
    elementNote: 'Показатели появятся, когда элемент подключится к Lagrix.',
    root: 'Корневой элемент',
    custom: 'Кастомный элемент',
    loading: 'Спрашиваю узел о его элементах…',
    unavailable: 'Узел не ответил, поэтому элементы не показаны.',
    empty: 'В узле пока нет элементов с рейтингом.',
    noDescription: 'Описания пока нет.',
    generate: 'Заказать описание',
    notBorn: 'Элемент ещё не рождён — описание можно заказать после рождения.',
    fullDescription: 'Полное описание',
    provides: 'Что он даёт',
    openElement: 'Открыть элемент',
  },
}

export const nodePassport: SectionRenderer<'nodePassport'> = (b, { key: k }) => (
  <NodePassport key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), rating: lagrixRatingUi(b.lang) }} />
)
