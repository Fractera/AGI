import type { SectionRenderer } from '@/sections/contract'
import { NodePassport, type NodePassportWords } from '@/components/dashboard/node-passport.client'

// КАРТОЧКИ ЭЛЕМЕНТОВ «ПАСПОРТА» УЗЛА (478-1): слова берутся здесь, на сервере, и уходят островку пропсами.
const WORDS: Record<string, NodePassportWords> = {
  en: {
    loading: 'Asking the node about its elements…',
    unavailable: 'The node did not answer, so the elements are not shown.',
    empty: 'The node has no elements yet.',
    noDescription: 'No description yet.',
    generate: 'Generate a description',
    notBorn: 'The element is not born yet — a description can be generated after its birth.',
    provides: 'What it provides',
    reputation: 'Reputation',
    provider: 'As a provider',
    customer: 'As a customer',
    likes: 'Weight of likes',
    dislikes: 'Weight of dislikes',
    reputationNote: 'The two numbers are never combined into one. They appear once the element closes deals paid through the Lagrix network.',
    openElement: 'Open the element',
    missing: 'Elements without a description: {n}. A red dot marks each of them.',
    native: 'native',
    custom: 'custom',
  },
  ru: {
    loading: 'Спрашиваю узел о его элементах…',
    unavailable: 'Узел не ответил, поэтому элементы не показаны.',
    empty: 'В узле пока нет элементов.',
    noDescription: 'Описания пока нет.',
    generate: 'Сгенерировать описание',
    notBorn: 'Элемент ещё не рождён — описание можно сгенерировать после рождения.',
    provides: 'Что он даёт',
    reputation: 'Репутация',
    provider: 'Как исполнитель',
    customer: 'Как заказчик',
    likes: 'Вес лайков',
    dislikes: 'Вес дизлайков',
    reputationNote: 'Два числа никогда не сводятся в одно. Они появятся, когда элемент проведёт сделки, оплаченные через сеть Lagrix.',
    openElement: 'Открыть элемент',
    missing: 'Элементов без описания: {n}. Каждый отмечен красной точкой.',
    native: 'нативный',
    custom: 'кастомный',
  },
}

export const nodePassport: SectionRenderer<'nodePassport'> = (b, { key: k }) => (
  <NodePassport key={k} lang={b.lang} words={WORDS[b.lang] ?? WORDS.en} />
)
