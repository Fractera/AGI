// СЛОВА ИНДИКАТОРА СОСТОЯНИЯ УЗЛА — рядом с самим островком (276-2).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. `_data` несёт слова СТРАНИЦЫ. Индикатор
// переиспользуемый: тот же вопрос «где стоит узел и как до него добираются» встанет и на экранах
// входа, когда замки поедут по режиму. Приём тот же, что у островка порта службы.
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ. Островок получает уже выбранный язык пропсами — в браузер уезжает один набор
// строк, а не словарь; за этим следит `check:lang-delivery`.
//
// 🛑 СЛОВА РАЗДЕЛЯЮТ ИЗМЕРЕННОЕ И ОБЪЯВЛЕННОЕ. «Измерено» и «с ваших слов» — разные пометки, потому
// что человек, читающий объявленное как проверенное, перестаёт проверять.

export type NodeStateWords = {
  loading: string
  /** дверь не ответила: честное «не знаю», а не «ничего нет» */
  unknown: string
  /** заголовки трёх строк */
  reachTitle: string
  placeTitle: string
  isolationTitle: string
  /** пометки источника */
  measured: string
  declared: string
  notKnown: string
  /** как добираются */
  reachOwnDomain: string
  reachOwnDomainForeign: string
  reachOwnDomainSilent: string
  reachTemporary: string
  reachTemporaryBroken: string
  reachLocalOnly: string
  /** где стоит */
  placeHome: string
  placeServer: string
  placeUnknown: string
  placeChange: string
  /** стена */
  isolationNone: string
  isolationContainer: string
  /** кнопка нового замера и что видно во время него (276-5) */
  checkNow: string
  checking: string
  /** подпись звезды для экранного чтеца: звезда повторяет слова, а не заменяет их */
  starTrue: string
  starFalse: string
  /** одна фраза о том, почему это спрашивается, а не написано */
  note: string
}

const DICT: Record<string, NodeStateWords> = {
  en: {
    loading: "Asking the node…",
    unknown: "The node did not answer. This means «I do not know», not «nothing is set up».",
    reachTitle: "How people reach this node",
    placeTitle: "Where this node stands",
    isolationTitle: "Walls around the items",
    measured: "measured just now",
    declared: "from your own words",
    notKnown: "not known",
    reachOwnDomain: "Your own domain {host} — and it answers with this node.",
    reachOwnDomainForeign: "The name {host} answers, but not with this node. Check where the DNS record points.",
    reachOwnDomainSilent: "The name {host} is set up but silent right now, so from the internet this node is not there.",
    reachTemporary: "A temporary address {host}. It changes every time the tunnel restarts, so a link you gave someone stops working.",
    reachTemporaryBroken: "The temporary address is not answering, so from the internet this node is not there.",
    reachLocalOnly: "Not published at all: the node is visible only on this computer.",
    placeHome: "A home computer — you choose which items to install, and you answer for that choice.",
    placeServer: "A dedicated server — the place to invite other developers to.",
    placeUnknown: "Not stated yet. Nothing can measure this, so the node asks you.",
    placeChange: "Tell the node",
    isolationNone: "None. Items run as the same user as you and reach the same files.",
    isolationContainer: "The node runs inside a container.",
    checkNow: "Check now",
    checking: "Checking the node again…",
    starTrue: "true",
    starFalse: "false",
    note: "A filled star means true. Reach and walls are measured when you check; where the node stands is what you told it.",
  },
  ru: {
    loading: "Спрашиваю узел…",
    unknown: "Узел не ответил. Это значит «не знаю», а не «ничего не настроено».",
    reachTitle: "Как до узла добираются",
    placeTitle: "Где стоит узел",
    isolationTitle: "Стена вокруг элементов",
    measured: "измерено только что",
    declared: "с ваших слов",
    notKnown: "не известно",
    reachOwnDomain: "Свой домен {host} — и он отвечает этим узлом.",
    reachOwnDomainForeign: "Имя {host} отвечает, но это не этот узел. Проверьте, куда ведёт запись DNS.",
    reachOwnDomainSilent: "Имя {host} настроено, но сейчас молчит — значит из интернета узла нет.",
    reachTemporary: "Временный адрес {host}. Он меняется при каждом перезапуске туннеля, и ссылка, которую вы кому-то дали, перестаёт работать.",
    reachTemporaryBroken: "Временный адрес не отвечает — значит из интернета узла нет.",
    reachLocalOnly: "Наружу не опубликован: узел виден только на этом компьютере.",
    placeHome: "Домашний компьютер — элементы вы выбираете сами и за выбор отвечаете сами.",
    placeServer: "Выделенный сервер — сюда можно приглашать чужих разработчиков.",
    placeUnknown: "Пока не сказано. Измерить это нечем, поэтому узел спрашивает вас.",
    placeChange: "Сказать узлу",
    isolationNone: "Стены нет. Элементы работают тем же пользователем, что и вы, и дотягиваются до тех же файлов.",
    isolationContainer: "Узел работает внутри контейнера.",
    checkNow: "Проверить сейчас",
    checking: "Проверяю узел заново…",
    starTrue: "правда",
    starFalse: "ложь",
    note: "Заполненная звезда — правда. Доступ и стена измеряются при проверке; где стоит узел — то, что вы сказали ему сами.",
  },
}

export function nodeStateWords(lang: string): NodeStateWords {
  return DICT[lang] ?? DICT.en
}
