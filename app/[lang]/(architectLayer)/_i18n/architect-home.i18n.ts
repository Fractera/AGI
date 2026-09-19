// СОДЕРЖИМОЕ КОРНЕВОЙ СТРАНИЦЫ СЛОЯ АРХИТЕКТОРА.
//
// 🔒 ОТДЕЛЬНЫЙ ФАЙЛ, А НЕ ВЕТКА В СЛОВАРЕ СЛОЯ. Словарь слоя описывает то, что
// повторяется на ОДИННАДЦАТИ страницах — имена групп, разделов, предупреждение.
// Здесь текст ОДНОЙ страницы, и его объём немедленно утопил бы общий словарь.
//
// 🪦 БЛОК «БЛОКЧЕЙН-ВИДИМОСТЬ» УДАЛЁН ОТСЮДА 2026-09-19 ПО СЛОВУ ВЛАДЕЛЬЦА
// («all trash to remove»). Он описывал путь микросервиса к продаже четырьмя
// шагами и повторял то, что уже рассказано на ГЛАВНОЙ, — а страница архитектора
// не витрина: сюда приходят строить, а не читать о замысле. Живой текст о
// блокчейн-видимости остался на главной, в `(publicLayer)/_data/ru.ts`.
//
// 🪦 АККОРДЕОН ОТМЕНЁН ТЕМ ЖЕ РЕШЕНИЕМ: «уберём с этой страницы аккордеоны и
// представим страницу в виде раскрытых блоков с заголовками своего уровня и
// описанием». Свёрнутое здесь мешало: человек пришёл разбираться в своём узле, а
// не открывать по одной полосе.
//
// 🔒 ВЕРХНИЙ РЯД — НАВИГАЦИЯ ПО ЭТОЙ СТРАНИЦЕ, А НЕ КОПИЯ ЛЕВОГО МЕНЮ. Его слова:
// «ошибка, которую ты совершил, — ты продублировал это меню и слева, и сверху;
// это неправильно, это меню предназначено только для навигации по странице с
// плавной прокруткой». Поэтому у каждой темы есть `anchor`, и ряд собирается из
// тех же тем — второго списка не существует.

export type ArchitectTopic = {
  /** Якорь раздела. Задаётся явно: русский заголовок дал бы нечитаемый хеш. */
  anchor: string
  /** Короткая подпись для верхнего ряда — она же пункт навигации по странице. */
  tab: string
  title: string
  text: string
  points?: string[]
}

export type ArchitectHomeUi = {
  /** Вводный абзац: что это за группа страниц. */
  intro: string
  /** Условие выхода в продакшн — видно всегда, стоит до тем. */
  production: { title: string; text: string }
  /** Разделы страницы. Порядок здесь — порядок на экране и в верхнем ряду. */
  topics: ArchitectTopic[]
  /** Закрывающая строка: остальное — на своих вкладках. */
  outro: string
}

const DICT: Record<string, ArchitectHomeUi> = {
  en: {
    intro:
      'This group of pages is where you run the development of your project. Here you switch the programmer agent on, shape its instructions, connect external tools, and decide how this microservice meets the others.',
    production: {
      title: 'Before you hand the project to production',
      text: 'These pages control the server itself, so they must never stay open to everyone. Either protect the project with authentication, or delete this block of pages once development is over. There is no third option: a node that went to production with the architect layer open is a node anyone can rebuild.',
    },
    topics: [
      {
        anchor: 'agent',
        tab: 'Agent',
        title: 'The programmer agent and your development flow',
        text: 'Out of the box the project ships with Claude Code. Prefer another agent — Codex, or a different model altogether? Ask Claude Code once to add support for it, and the node learns that path for good.',
        points: [
          'Fractera assumes a documentation-first flow: development is a sequence of steps, each with a written plan and a written outcome.',
          'That flow is a suggestion, not a cage. Ask the agent to delete the files you do not want, and the architecture becomes the one you like.',
        ],
      },
      {
        anchor: 'languages',
        tab: 'Languages',
        title: 'Languages: start with one, finish with as many as you need',
        text: 'The architecture is built for multilingual work, but a single language costs you nothing extra: leave one in the environment variables and the node uses one. Add up to 82 when the project is ready for them.',
        points: [
          'While building, write each feature in ONE language — switching between eighty-two of them mid-feature is how translations rot.',
          'Everything left untranslated is collected into the translation-debt registry, so nothing is forgotten when you come back to it.',
        ],
      },
      {
        anchor: 'load',
        tab: 'Load',
        title: 'Built for load — and why not to break that',
        text: 'This project is already optimised for heavy traffic: pages are generated statically and refreshed afterwards, so a hundred visits and a hundred thousand cost the same work. Asking the agent to move to dynamic rendering undoes exactly that, and the bill arrives as server load.',
      },
      {
        anchor: 'auth',
        tab: 'Authentication',
        title: 'Authentication — recommended in every case',
        text: 'Even when this microservice needs no sign-in on its public layer, you still have to protect the private layer and the architect layer, or anyone at all can edit your server. Hide the sign-in button through PLATFORM CONFIG if it does not belong on your public pages — and activate the Fractera authentication microservice anyway.',
      },
      {
        anchor: 'data',
        tab: 'Data',
        title: 'Data and storage — when files are enough, and when they are not',
        text: 'Plenty of sites need no database at all: text lives in the project, images live in the file system, and the architecture already has the patterns to do that efficiently. But once you need dynamic parameters, personal accounts or protected applications, activate the Fractera Data microservice — a full database and object storage inside your own server, with queries, sorting and search, and no cloud provider in the middle.',
      },
      {
        anchor: 'design',
        tab: 'Look and blocks',
        title: 'Look, settings and reusable blocks',
        text: 'Four configuration files decide how the node looks and behaves, and every one of them has a microservice that turns it into a visual interface.',
        points: [
          'DESIGN CONFIG — colour, type, spacing and corners for every page at once. Visual editor: Fractera Design.',
          'PLATFORM CONFIG — header, footer pages, cookie banner, breadcrumbs, theme switch, the sign-in button. Visual editor: Fractera Platform Settings.',
          'Reusable sections and blocks — build your own branded set once and use it across every page. Catalogue: Fractera Blocks.',
          'APP CONFIG — company name, languages, logo, favicon, snippets, 404 artwork and the rest of the metadata. Your node is search- and agent-ready because this is wired in. Visual editor: Fractera App Config.',
        ],
      },
      {
        anchor: 'network',
        tab: 'Domain and API',
        title: 'Domain, server, API — and selling this node to other agents',
        text: 'A microservice rarely lives alone. Its API is written automatically as development goes; you never have to build it by hand, but you can read it here and ask the agent to add or sharpen a method you need. You also decide whether it answers only inside your server or on the internet — the access key is set here.',
        points: [
          'Connect the real domain you bought, so your site becomes visible on the internet.',
          'Move to a VPS of any provider, when the economics of the project call for it.',
          'Register the node in the global network, so other agents can find and buy it.',
        ],
      },
      // 🔒 The last topic is about earning, and it stands last on purpose (owner,
      // 2026-09-19): this page is read while building, and talk of selling belongs
      // where the building ends — not in the middle of the settings.
      {
        anchor: 'sell',
        tab: 'Selling',
        title: 'Development finished — switch visibility on and start earning',
        text: 'Once your microservice is built, this is where you switch its visibility on across the shared network: from that moment it is available for sale, and you earn from every project that installs it.',
        points: [
          'The catalogue description is composed by the architecture itself — from your documentation and source code.',
          'You set the rights and the price, zero included: a free node still accumulates a history of installations.',
          'Telemetry shows the buyer how many projects already run your microservice and how many users they have.',
        ],
      },
    ],
    outro: 'Everything else is described on the page that owns it — open a section on the left.',
  },
  ru: {
    intro:
      'Эта группа страниц предназначена для управления разработкой вашего проекта. Здесь вы активируете агента-программиста, настраиваете его инструкции, подключаете внешние инструменты и решаете, как этот микросервис встречается с остальными.',
    production: {
      title: 'Прежде чем передать проект в продакшн',
      text: 'Эти страницы управляют самим сервером, поэтому они не имеют права остаться открытыми для всех. Либо защитите проект при помощи авторизации, либо удалите блок этих страниц после завершения разработки. Третьего не дано: узел, ушедший в продакшн с открытым слоем архитектора, — это узел, который может перестроить кто угодно.',
    },
    topics: [
      {
        anchor: 'agent',
        tab: 'Агент',
        title: 'Агент-программист и ваш поток разработки',
        text: 'Из коробки проект поставляется с Claude Code. Предпочитаете другого агента — Codex или вовсе другую модель? Достаточно один раз попросить Claude Code добавить такую возможность, и узел запомнит этот путь навсегда.',
        points: [
          'Fractera предполагает поток разработки, ориентированный на документацию: работа идёт последовательностью шагов, у каждого письменный план и письменный итог.',
          'Этот поток — предложение, а не клетка. Попросите агента удалить ненужные файлы, и архитектура станет такой, какая нравится вам.',
        ],
      },
      {
        anchor: 'languages',
        tab: 'Языки',
        title: 'Языки: начните с одного, закончите сколькими нужно',
        text: 'Архитектура оптимизирована для мультиязычной разработки, но один язык не стоит вам ничего лишнего: оставьте в переменных окружения один — узел будет работать с одним. Добавьте до 82, когда проект к ним готов.',
        points: [
          'В разработке пишите каждую функцию на ОДНОМ языке — переключение между восьмьюдесятью двумя посреди работы и есть то, от чего переводы гниют.',
          'Всё непереведённое собирается в реестр долгов по переводу, поэтому к нему можно спокойно вернуться и ничего не потерять.',
        ],
      },
      {
        anchor: 'load',
        tab: 'Нагрузка',
        title: 'Рассчитан на нагрузку — и почему это не стоит ломать',
        text: 'Проект уже оптимизирован под высокую нагрузку: страницы генерируются статически и обновляются после, поэтому сто визитов и сто тысяч стоят одинаковой работы. Просьба к агенту перейти на динамическую генерацию отменяет ровно это, и счёт приходит нагрузкой на сервер.',
      },
      {
        anchor: 'auth',
        tab: 'Авторизация',
        title: 'Авторизация — рекомендуется во всех случаях',
        text: 'Даже когда этому микросервису не нужен вход на публичном слое, приватный слой и слой архитектора защитить всё равно необходимо, иначе редактировать ваш сервер сможет кто угодно. Кнопку входа можно скрыть через PLATFORM CONFIG, если ей не место на ваших публичных страницах, — а микросервис авторизации Fractera активировать всё равно.',
      },
      {
        anchor: 'data',
        tab: 'Данные',
        title: 'Данные и хранилище — когда хватает файлов, а когда нет',
        text: 'Множеству сайтов база данных не нужна вовсе: тексты живут в проекте, изображения — в файловой системе, и архитектура уже содержит нужные паттерны, чтобы делать это эффективно. Но как только понадобятся динамические параметры, личный кабинет или защищённые приложения, активируйте микросервис Fractera Data — полноценная база и объектное хранилище внутри вашего сервера, с выборками, сортировкой и удобным поиском, без зависимости от облачных поставщиков.',
      },
      {
        anchor: 'design',
        tab: 'Оформление',
        title: 'Оформление, настройки и переиспользуемые блоки',
        text: 'Четыре конфигурационных файла решают, как узел выглядит и ведёт себя, и у каждого есть микросервис, превращающий его в визуальный интерфейс.',
        points: [
          'DESIGN CONFIG — цвет, шрифты, отступы и скругления сразу для всех страниц. Визуальный интерфейс: Fractera Design.',
          'PLATFORM CONFIG — верхнее меню, страницы подвала, cookie-баннер, хлебные крошки, переключатель темы, кнопка входа. Визуальный интерфейс: Fractera Platform Settings.',
          'Секции и блоки — соберите собственный фирменный набор один раз и переиспользуйте на всех страницах. Каталог: Fractera Blocks.',
          'APP CONFIG — название компании, языки, логотип, favicon, сниппеты, картинки-заглушки 404 и остальная мета-разметка. Узел готов к поисковой и агентной оптимизации именно потому, что это уже собрано. Визуальный интерфейс: Fractera App Config.',
        ],
      },
      {
        anchor: 'network',
        tab: 'Домен и API',
        title: 'Домен, сервер, API — и продажа этого узла чужим агентам',
        text: 'Микросервис редко живёт один. Его API пишется автоматически по ходу разработки: вручную участвовать в этом не нужно, но здесь его можно увидеть и попросить агента добавить или усилить нужный вам метод. Здесь же вы решаете, отвечает ли он только внутри вашего сервера или в интернете, — ключ доступа устанавливается на этой вкладке.',
        points: [
          'Подключите реальный домен, который вы приобрели, чтобы сайт получил видимость в интернете.',
          'Перейдите на VPS любого поставщика, когда этого потребует экономика проекта.',
          'Зарегистрируйте узел в общей сети, чтобы чужие агенты могли найти и купить его.',
        ],
      },
      // 🔒 ПОСЛЕДНЯЯ ТЕМА — О ЗАРАБОТКЕ, И ОНА СТОИТ ПОСЛЕДНЕЙ НАМЕРЕННО
      // (решение владельца 2026-09-19). Человек читает эту страницу, пока
      // строит; разговор о продаже уместен тогда, когда постройка закончена, —
      // то есть в самом конце, а не посреди настроек.
      {
        anchor: 'sell',
        tab: 'Продажа',
        title: 'Закончили разработку — включите видимость и начните зарабатывать',
        text: 'Если разработка вашего микросервиса завершена, именно здесь вы активируете его видимость в общей сети: с этой минуты он становится доступен для продажи, а вы — получаете заработок с каждого проекта, который его установит.',
        points: [
          'Описание для каталога архитектура составит сама — по вашей документации и исходному коду.',
          'Права и цену назначаете вы, включая цену в ноль: бесплатный узел тоже набирает историю установок.',
          'Телеметрия показывает покупателю, сколько проектов уже работают на вашем микросервисе и сколько у них пользователей.',
        ],
      },
    ],
    outro: 'Всё остальное описано на той вкладке, которой оно принадлежит, — откройте раздел слева.',
  },
}

/** Язык не из набора откатывается на английский: человек видит работающую страницу, а не пустоту. */
export function architectHomeUi(lang: string): ArchitectHomeUi {
  return DICT[lang] ?? DICT.en
}
