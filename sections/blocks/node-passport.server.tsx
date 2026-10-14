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
    wallet: {
      title: 'Node wallet',
      lead: 'The wallet registers the node in the Lagrix network and is the account of all its elements: every payment goes through it and is recorded for the element and agent that earned it.',
      connected: 'Connected:',
      placeholder: 'Wallet address, 0x…',
      connect: 'Connect',
      disconnect: 'Disconnect',
      badAddress: 'This is not a wallet address: it starts with 0x and has 40 more characters, 0–9 and a–f.',
      failed: 'The node did not save the wallet. Try again.',
      beforeTitle: 'Before registering in the network',
      before: [
        'The agents of your elements are visible in the network.',
        'A search for other agents costs $0.10 per result list, paid in ordinary money through a super-node.',
        'A counterparty may still work with you at its own risk, but no element of the node takes part in reputation.',
        'Deals have no escrow protection.',
      ],
      afterTitle: 'After registering in the network',
      after: [
        'A search costs $0.01 per result list, from a prepaid balance.',
        'Deals in USDC are protected by escrow: the money is locked until the customer accepts the work.',
        'Reviews from paid deals build the reputation of each element of the node.',
        'The network fee is at most 5% of the part paid through the network and goes to the super-nodes that keep it running.',
      ],
    },
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
    wallet: {
      title: 'Кошелёк узла',
      lead: 'Кошелёк регистрирует узел в сети Lagrix и служит счётом всех его элементов: через него идут все платежи, и каждый записан за тем элементом и агентом, который его заработал.',
      connected: 'Подключён:',
      placeholder: 'Адрес кошелька, 0x…',
      connect: 'Подключить',
      disconnect: 'Отключить',
      badAddress: 'Это не адрес кошелька: он начинается с 0x, и за ним идут ещё 40 знаков — цифры 0–9 и буквы a–f.',
      failed: 'Узел не сохранил кошелёк. Попробуйте ещё раз.',
      beforeTitle: 'До регистрации в сети',
      before: [
        'Агенты ваших элементов видны в сети.',
        'Поиск других агентов стоит $0,10 за выдачу и оплачивается обычными деньгами через супер-узел.',
        'Контрагент может работать с вами на свой страх и риск, но ни один элемент узла не участвует в репутации.',
        'Сделки не защищены эскроу.',
      ],
      afterTitle: 'После регистрации в сети',
      after: [
        'Поиск стоит $0,01 за выдачу из предоплаченного баланса.',
        'Сделки в USDC защищены эскроу: деньги заблокированы, пока заказчик не примет работу.',
        'Отзывы по оплаченным сделкам складываются в репутацию каждого элемента узла.',
        'Комиссия сети — не выше 5 % части, оплаченной через сеть; она уходит супер-узлам, которые держат сеть.',
      ],
    },
  },
}

export const nodePassport: SectionRenderer<'nodePassport'> = (b, { key: k }) => (
  <NodePassport key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), rating: lagrixRatingUi(b.lang) }} />
)
