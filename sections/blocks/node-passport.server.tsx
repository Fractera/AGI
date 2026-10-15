import type { SectionRenderer } from '@/sections/contract'
import { NodePassport, type NodePassportWords } from '@/components/dashboard/node-passport.client'
import { lagrixRatingUi } from '@/app/[lang]/(architectLayer)/_i18n/lagrix-rating.i18n'

// «ПАСПОРТ» УЗЛА (478-1): слова берутся здесь, на сервере, и уходят островку пропсами. Слова карточки рейтинга — те же, что на
// главной A2A элемента (`lagrixRatingUi`), здесь только заголовки и подписи паспорта.
const WORDS: Record<string, Omit<NodePassportWords, 'rating'>> = {
  en: {
    nodeTitle: 'The node in Lagrix: reputation of its elements',
    nodeLead: 'A summary of the indicators of all elements of this node: every deal any of them pays through the network adds here.',
    nodeNote: 'The numbers appear when the node is connected to Lagrix.',
    elementNote: 'The numbers appear when the element is connected to Lagrix.',
    root: 'Root element',
    custom: 'Custom element',
    loading: 'Asking the node about its elements…',
    unavailable: 'The node did not answer, so the elements are not shown.',
    empty: 'The node has no elements with reputation yet.',
    noDescription: 'No description yet.',
    generate: 'Order a description',
    notBorn: 'The element is not born yet — a description can be ordered after its birth.',
    fullDescription: 'Full description',
    provides: 'What it provides',
    openElement: 'Open the element',
    wallet: {
      title: 'Node wallet',
      lead: "The wallet is the node's key and account in one: it is created free in any Ethereum wallet app, with no sign-up anywhere, and its address is the node's name in the network. Every payment of the node's elements goes through it and is recorded for the element and agent that earned it.",
      connected: 'Connected:',
      placeholder: 'Wallet address, 0x…',
      connect: 'Connect',
      disconnect: 'Disconnect',
      badAddress: 'This is not a wallet address: it starts with 0x and has 40 more characters, 0–9 and a–f.',
      failed: 'The node did not save the wallet. Try again.',
      beforeTitle: 'Without a wallet',
      before: [
        "The node works on your computer, but it is not in the Lagrix network: its agents cannot be found and do not search through super-nodes.",
        'A wallet costs nothing: any Ethereum wallet app creates one in a minute, and there is no one to register with.',
        "The network's open announcements can be read without a wallet, for free.",
      ],
      afterTitle: 'With a wallet',
      after: [
        "The node is in the network: the wallet's address is its name, and its announcements are signed with it.",
        'A search costs $0.01 per result list from a USDC balance in the contract — one price for everyone.',
        'Deals in USDC are protected by escrow; reviews from paid deals build the reputation of each element of the node.',
        "The node pays the network's stamps itself — in ether or in USDC through a third-party paymaster; $LGX is not needed for that.",
      ],
    },
  },
  ru: {
    nodeTitle: 'Узел в Lagrix: репутация его элементов',
    nodeLead: 'Сводка показателей всех элементов этого узла: каждая сделка любого из них, оплаченная через сеть, добавляется сюда.',
    nodeNote: 'Показатели появятся, когда узел подключится к Lagrix.',
    elementNote: 'Показатели появятся, когда элемент подключится к Lagrix.',
    root: 'Корневой элемент',
    custom: 'Кастомный элемент',
    loading: 'Спрашиваю узел о его элементах…',
    unavailable: 'Узел не ответил, поэтому элементы не показаны.',
    empty: 'В узле пока нет элементов с репутацией.',
    noDescription: 'Описания пока нет.',
    generate: 'Заказать описание',
    notBorn: 'Элемент ещё не рождён — описание можно заказать после рождения.',
    fullDescription: 'Полное описание',
    provides: 'Что он даёт',
    openElement: 'Открыть элемент',
    wallet: {
      title: 'Кошелёк узла',
      lead: 'Кошелёк — ключ узла и его счёт в одном: создаётся бесплатно в любом приложении-кошельке Ethereum, ни у кого регистрироваться не нужно, а его адрес и есть имя узла в сети. Через него идут все платежи элементов узла, и каждый записан за тем элементом и агентом, который его заработал.',
      connected: 'Подключён:',
      placeholder: 'Адрес кошелька, 0x…',
      connect: 'Подключить',
      disconnect: 'Отключить',
      badAddress: 'Это не адрес кошелька: он начинается с 0x, и за ним идут ещё 40 знаков — цифры 0–9 и буквы a–f.',
      failed: 'Узел не сохранил кошелёк. Попробуйте ещё раз.',
      beforeTitle: 'Без кошелька',
      before: [
        'Узел работает на вашем компьютере, но в сети Lagrix его нет: его агентов нельзя найти, и сами они не ищут через супер-узлы.',
        'Кошелёк ничего не стоит: любое приложение-кошелёк Ethereum создаёт его за минуту, и ни у кого регистрироваться не нужно.',
        'Открытые объявления сети можно читать и без кошелька — бесплатно.',
      ],
      afterTitle: 'С кошельком',
      after: [
        'Узел есть в сети: адрес кошелька — его имя, и объявления подписаны им.',
        'Поиск стоит $0,01 за выдачу из баланса USDC в контракте — одна цена для всех.',
        'Сделки в USDC защищены эскроу; отзывы по оплаченным сделкам складываются в репутацию каждого элемента узла.',
        'Марки сети узел платит сам — эфиром или в USDC через сторонний Paymaster; $LGX для этого не нужен.',
      ],
    },
  },
}

export const nodePassport: SectionRenderer<'nodePassport'> = (b, { key: k }) => (
  <NodePassport key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), rating: lagrixRatingUi(b.lang) }} />
)
