// СЛОВА ИНДИКАТОРА СОСТОЯНИЯ ПРОЕКТА — рядом с самим островком (276-2; человеческим языком — 276-6).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. Индикатор переиспользуемый: тот же вопрос встанет и
// на экранах входа, когда замки поедут по режиму.
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ. Островок получает уже выбранный язык пропсами; следит `check:lang-delivery`.
//
// 🛑 ЯЗЫК — ПРОФЕССИОНАЛЬНЫЙ И ЧЕЛОВЕЧЕСКИЙ (слово владельца 2026-09-23): «проект», «адрес»,
// «размещён», «контейнер». ✗ Оплачено: «узел», «стена вокруг элементов» и «как до узла добираются»
// владелец назвал бредом — это внутренний жаргон, а не слова, которыми с людьми говорят.

export type NodeStateWords = {
  loading: string
  checking: string
  /** дверь не ответила: честное «не знаю», а не «ничего нет» */
  unknown: string
  checkNow: string
  starTrue: string
  starFalse: string
  measuredAt: string
  /** группа 1 — адрес проекта: четыре карточки, активна одна */
  addressTitle: string
  localhost: string
  localhostText: string
  tryDomain: string
  tryDomainText: string
  tryDomainActive: string
  tryDomainBroken: string
  ip: string
  ipText: string
  ownDomain: string
  ownDomainText: string
  ownDomainActive: string
  ownDomainForeign: string
  ownDomainSilent: string
  /** группа 2 — где размещён проект: две карточки, активна сказанная */
  placeTitle: string
  placeLocal: string
  placeLocalText: string
  placeServer: string
  placeServerText: string
  placeFromYou: string
  placeNotSet: string
  placeChange: string
  /** группа 3 — изоляция */
  isolationTitle: string
  container: string
  containerYes: string
  containerNo: string
  note: string
}

const DICT: Record<string, NodeStateWords> = {
  en: {
    loading: "Checking the project…",
    checking: "Checking the project again…",
    unknown: "The project did not answer. This means «unknown», not «nothing is set up».",
    checkNow: "Check now",
    starTrue: "active",
    starFalse: "inactive",
    measuredAt: "checked at {at}",
    addressTitle: "Project address",
    localhost: "Localhost",
    localhostText: "Development mode: the project opens only on this computer.",
    tryDomain: "Cloudflare trial domain",
    tryDomainText: "A temporary *.trycloudflare.com address; it changes on every restart.",
    tryDomainActive: "{host} — a temporary address; it changes on every restart.",
    tryDomainBroken: "The temporary address is not answering.",
    ip: "IP address",
    ipText: "The project opens by the server's IP address, without a domain.",
    ownDomain: "Own domain",
    ownDomainText: "Your domain, connected through Cloudflare.",
    ownDomainActive: "{host} — this project answers.",
    ownDomainForeign: "{host} answers, but it is not this project. Check the DNS record.",
    ownDomainSilent: "{host} is set up but not answering right now.",
    placeTitle: "Where the project is hosted",
    placeLocal: "Local computer",
    placeLocalText: "You choose the apps yourself and answer for that choice.",
    placeServer: "Dedicated server",
    placeServerText: "The place to invite other developers to.",
    placeFromYou: "as you stated",
    placeNotSet: "not stated yet",
    placeChange: "Change",
    isolationTitle: "Isolation",
    container: "Container",
    containerYes: "The project runs in a container: an isolated environment with its own file system.",
    containerNo: "No. Apps run under your user account and can read the same files as you.",
    note: "Only one card per row is active. Address and isolation are measured on every check; hosting is what you stated.",
  },
  ru: {
    loading: "Проверяю проект…",
    checking: "Проверяю проект заново…",
    unknown: "Проект не ответил. Это значит «неизвестно», а не «ничего не настроено».",
    checkNow: "Проверить сейчас",
    starTrue: "активно",
    starFalse: "не активно",
    measuredAt: "проверено в {at}",
    addressTitle: "Адрес проекта",
    localhost: "Localhost",
    localhostText: "Режим разработки: проект открывается только на этом компьютере.",
    tryDomain: "Пробный домен Cloudflare",
    tryDomainText: "Временный адрес *.trycloudflare.com; меняется при каждом перезапуске.",
    tryDomainActive: "{host} — временный адрес, меняется при каждом перезапуске.",
    tryDomainBroken: "Временный адрес не отвечает.",
    ip: "IP-адрес",
    ipText: "Проект открывается по IP-адресу сервера, без домена.",
    ownDomain: "Собственный домен",
    ownDomainText: "Ваш домен, подключённый через Cloudflare.",
    ownDomainActive: "{host} — отвечает этот проект.",
    ownDomainForeign: "{host} отвечает, но это не этот проект. Проверьте запись DNS.",
    ownDomainSilent: "{host} настроен, но сейчас не отвечает.",
    placeTitle: "Где размещён проект",
    placeLocal: "Локальный компьютер",
    placeLocalText: "Приложения вы выбираете сами и за выбор отвечаете сами.",
    placeServer: "Выделенный сервер",
    placeServerText: "Сюда можно приглашать других разработчиков.",
    placeFromYou: "с ваших слов",
    placeNotSet: "пока не указано",
    placeChange: "Изменить",
    isolationTitle: "Изоляция",
    container: "Контейнер",
    containerYes: "Проект работает в контейнере: изолированное окружение со своей файловой системой.",
    containerNo: "Нет. Приложения работают под вашей учётной записью и видят те же файлы, что и вы.",
    note: "В каждой строке активна одна карточка. Адрес и изоляция измеряются при каждой проверке; размещение — с ваших слов.",
  },
}

export function nodeStateWords(lang: string): NodeStateWords {
  return DICT[lang] ?? DICT.en
}
