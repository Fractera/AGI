// Слова виджета «безопасность» — СВОИ (шаг 521, вторая разновидность).
//
// 🔒 ДЕСЯТЬ ЯЗЫКОВ, страничный набор (правило 4д): виджет принадлежит ОДНОМУ
// маршруту и не переиспользуется. Восемьдесят два несут переиспользуемые части
// продукта — ящик аккаунта, корзину, окна: они являются в любом включённом языке
// сами, а виджет так не появляется. Включат язык сверх десяти — виджет ответит
// по-английски (откат в функции внизу), и это осознанный размен.
//
// 🔒 ЧЕТЫРЕ ПУНКТА — СЛОВА ВЛАДЕЛЬЦА, а не мой пересказ, И ПОРЯДОК ЕГО ЖЕ
// (уточнён 2026-08-22): 01 соответствие регуляторам · 02 сохранность данных ·
// 03 финансы без сюрпризов · 04 своя авторизация. Номер карточки — это её место
// в массиве, поэтому порядок здесь и есть нумерация на экране. Раскладка донора
// не менялась: на широком экране 01 сверху слева, 03 сверху справа, 02 снизу
// слева, 04 снизу справа — диагональное чтение; на узком карточки идут подряд.

export type SecurityCard = {
  title: string
  text: string
  /** Короткий ярлычок под текстом и на плавающей метке орбиты. */
  chip: string
}

export type SecurityOrbitUi = {
  /** Ярлык раздела — то же слово, что у соседних секций страницы. */
  badge: string
  /** Заголовок разорван надвое: вторая половина — акцентом. */
  headingLead: string
  headingAccent: string
  subheading: string
  cards: [SecurityCard, SecurityCard, SecurityCard, SecurityCard]
}

const UI: Record<string, SecurityOrbitUi> = {
  en: {
    badge: "Why it matters",
    headingLead: "Security is built into the",
    headingAccent: "foundation",
    subheading: "Four layers of protection — each one works on its own.",
    cards: [
      { title: "Made to fit the regulator", text: "Personal data stays where the law of your country requires it to stay — on your own server, under your own jurisdiction.", chip: "your country's law" },
      { title: "Your data survives you", text: "Backups, moving to another server, export and import — the project is yours to carry away whole.", chip: "backups and moving" },
      { title: "Money with no surprises", text: "Cloud AI costs and everything else stay on the server you own. Nothing bills you from somewhere else.", chip: "no surprises" },
      { title: "Your own authorization", text: "The whole project is closed by authorization that belongs to you. Security is entirely in your hands.", chip: "your authorization" },
    ],
  },
  ru: {
    badge: "Почему это важно",
    headingLead: "Безопасность встроена в",
    headingAccent: "основу",
    subheading: "Четыре слоя защиты — каждый работает независимо.",
    cards: [
      { title: "Соответствие регуляторам", text: "Персональные данные остаются там, где требует закон вашей страны, — на вашем собственном сервере и в вашей юрисдикции.", chip: "по закону страны" },
      { title: "Сохранность данных", text: "Резервные копии, перенос на другой сервер, выгрузка и загрузка — проект вы вправе унести целиком.", chip: "копии и перенос" },
      { title: "Финансы без сюрпризов", text: "Расходы на облачный искусственный интеллект и всё остальное остаются на вашем сервере. Никто не выставит счёт со стороны.", chip: "без сюрпризов" },
      { title: "Своя авторизация", text: "Весь проект закрыт авторизацией, которая принадлежит вам. Безопасность целиком в ваших руках.", chip: "ваша авторизация" },
    ],
  },
}

export function securityOrbitUi(lang: string): SecurityOrbitUi {
  return UI[lang] ?? UI[lang.slice(0, 2)] ?? UI.en
}
