// Слова слоя архитектора.
//
// 🔒 ЯЗЫКОВ ДВА, И ЭТО ОСОЗНАННОЕ СОСТОЯНИЕ, А НЕ НЕДОДЕЛКА. Столько же, сколько
// у самого проекта (`NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,ru`). Резолвер
// откатывается на английский, поэтому чужой язык видит работающую страницу, а не
// пустоту.
//
// 🔒 СЛОВА СЕРВЕРНЫЕ. Их резолвит серверный компонент и передаёт островкам
// пропсами: клиентский компонент, импортирующий словарь, увёз бы в браузер все
// его языки разом.
//
// 🔒 ФОРМА СЛОВАРЯ ПОВТОРЯЕТ ФОРМУ МЕНЮ, И ЭТО НЕ СОВПАДЕНИЕ (236-1). Группы и
// разделы объявлены здесь ОДНИМ объектом на язык, а `_lib/architect-menu.ts`
// собирает из них пункты. Разложи мы имена по страницам — десять страниц стали
// бы десятью местами, где живёт слово, и первое же переименование разошлось бы
// молча. Тип `ArchitectLayerUi` при этом заставляет оба языка иметь ОДИН набор
// ключей: забытый перевод не доживает до проверки типов.
//
// 🪦 ПРЕЖНИЙ СЛОВАРЬ БЫЛ НА 91 СТРОКУ (удалён 229-5 вместе со слоем). Он описывал
// страницы, которых больше нет: восемь групп меню, заголовки настроек
// приложения, подписи переключателя языка настроек. Возвращать его целиком
// значило бы вернуть описание несуществующего.

export type ArchitectLayerUi = {
  /** Название слоя целиком — крошка и заголовок раздела. */
  layer: string
  /** Подпись над левым меню. */
  menuTitle: string
  /** Имена трёх групп левого меню. */
  groups: {
    passport: string
    tools: string
    build: string
  }
  /**
   * 🪦 ЗДЕСЬ БЫЛО ПОЛЕ `sections` — ИМЕНА ДЕВЯТИ РАЗДЕЛОВ. Удалено 2026-09-19
   * (254): имя раздела переехало в его собственную папку (`_data/<lang>.ts`), и
   * второй копии в общем словаре быть не должно — две половины одного знания
   * расходятся молча. Здесь остаётся только то, что повторяется на ВСЕХ
   * страницах слоя: имя слоя, имена групп, вход и предупреждение.
   */
  /**
   * Вход в слой — страница `/architect`, на которую человек попадает, набрав адрес.
   * Заголовок и подзаголовок продиктованы владельцем 2026-09-19 и описывают ГРУППУ
   * страниц целиком: у остальных десяти заголовок — имя своего раздела.
   */
  home: {
    title: string
    lead: string
    /**
     * Имя открытого раздела ВНУТРИ рабочего экрана. Заголовок самой страницы с
     * 2026-09-19 стоит НАД экраном, и внутри ему места больше нет: два заголовка
     * об одном и том же подряд — тот же дефект, что две одинаковые кнопки.
     */
    sectionTitle: string
  }
  /** Строка на пустом разделе: страница есть, содержимого пока нет. */
  emptyLead: string
  /**
   * Подпись ссылки в рубрикаторе группы (254).
   *
   * 🛑 ЗАДАЁТСЯ ЯВНО, ПОТОМУ ЧТО УМОЛЧАНИЕ ВИДА `docref` — «Скачать .md»:
   * он задуман для документов, а здесь ведёт в раздел. Умолчание чужого
   * вида, оставленное по невнимательности, обещает человеку файл.
   */
  openSection: string
  /**
   * Что стоит на странице, у которой ещё нет содержимого (255).
   *
   * 🔒 Решение владельца 2026-09-19: страница обязана иметь обработчик — «если
   * ничего не пришло, вернуть просто название страницы с текстом: скоро будет
   * построена». Благодаря ему страница ЗАВЕРШЕНА с первой минуты, а не
   * выглядит белым листом, который человек читает как поломку.
   */
  soon: string
  /**
   * Предупреждение о работе без авторизации — аккордеон в шапке слоя.
   * Показывается только в режиме разработки и на временном адресе; в обычной
   * работе его нет вовсе (решение владельца 2026-09-19).
   */
  authWarning: {
    /** Строка, которую видно всегда, пока аккордеон свёрнут. */
    title: string
    /** Почему открыто — версия для хозяина за клавиатурой. */
    reasonMachine: string
    /** Почему открыто — версия для временного адреса в интернете. */
    reasonTemporary: string
    /** Вывод и рекомендация: оба состояния временные, для полноценной работы нужен микросервис авторизации. */
    body: string
  }
}

// 🔒 ФОРМА `Record<string, Ui>`, А НЕ ПАРА `const EN` / `const RU` — ЭТО ТРЕБОВАНИЕ
// ПРИБОРА, А НЕ ВКУС. ✗ оплачено дважды: в комментариях `scripts/check-i18n.mjs`
// стоит запись, что два словаря движка «были написаны в форме, которой сторож не
// понимает», и здесь я повторил ту же ошибку — сторож отвечал «языков 0/2».
// Словарь, которого прибор не понимает, неотличим от словаря, которого нет.
const DICT: Record<string, ArchitectLayerUi> = {
  en: {
  layer: "Architect",
  menuTitle: "Your node",
  groups: {
    passport: "Passport",
    tools: "Tools of this server",
    build: "Building",
  },
  home: {
    title: "The architect group of pages",
    sectionTitle: "Overview",
    lead: "Here you manage the building of this microservice, set up its links with the other microservices of your application, and control how visible your microservice is within the global blockchain architecture of Fractera. This is also where you connect your own domain name and move the node to a remote server, once this machine is no longer enough for it.",
  },
  emptyLead: "The section is in place; its content comes with the step that builds it.",
  openSection: "Open the section",
  soon: "This page is in place; its content will be built soon.",
  authWarning: {
    title: "This layer is open without any sign-in — a temporary state",
    reasonMachine: "You are inside without signing in because you are working from this very machine: whoever sits at this keyboard already owns the files.",
    reasonTemporary: "You are inside without signing in because the node is on a temporary address. While that address is open, anyone who knows the link sees this layer.",
    body: "Both of these are development states, and neither is meant to last. A node that keeps no authentication can only be built in development mode or on a temporary address — on a permanent domain this layer is closed, and from outside its pages simply do not exist. For everyday use, activate the Fractera authentication microservice: it gives the node real roles, and the architect layer starts asking who you are instead of trusting where you came from.",
  },
  },
  ru: {
  layer: "Архитектор",
  menuTitle: "Ваш узел",
  groups: {
    passport: "Паспорт",
    tools: "Инструменты этого сервера",
    build: "Строительство",
  },
  home: {
    title: "Группа страниц архитектора",
    sectionTitle: "Обзор",
    lead: "Здесь вы управляете строительством этого микросервиса и устанавливаете связи с другими микросервисами вашего приложения, управляете видимостью вашего микросервиса в глобальной видимости блокчейн-архитектуры Fractera. Отсюда же вы подключите собственное доменное имя и переедете на удалённый сервер, когда узлу станет тесно на этой машине.",
  },
  emptyLead: "Раздел на месте; содержимое придёт вместе с шагом, который его построит.",
  openSection: "Открыть раздел",
  soon: "Страница на месте — содержимое скоро будет построено.",
  authWarning: {
    title: "Этот слой открыт без авторизации — состояние временное",
    reasonMachine: "Вы внутри без входа, потому что работаете с этой самой машины: тот, кто сидит за этой клавиатурой, и так владеет файлами.",
    reasonTemporary: "Вы внутри без входа, потому что узел стоит на временном адресе. Пока этот адрес открыт, слой видит каждый, кто знает ссылку.",
    body: "Оба состояния — рабочие, и ни одно не рассчитано надолго. Узел, оставшийся без авторизации, можно строить только в режиме разработки или на временном адресе: на постоянном домене этот слой закрыт, и снаружи его страниц просто нет. Для полноценной работы активируйте микросервис авторизации Fractera — он даёт узлу настоящие роли, и слой архитектора начинает спрашивать, кто вы, вместо того чтобы верить, откуда вы пришли.",
  },
  },
}

/** Язык не из набора откатывается на английский: человек видит работающую страницу, а не пустоту. */
export function architectLayerUi(lang: string): ArchitectLayerUi {
  return DICT[lang] ?? DICT.en
}
