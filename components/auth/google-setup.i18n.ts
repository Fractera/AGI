// СЛОВА ЭКРАНА «ВХОД ЧЕРЕЗ GOOGLE» — рядом с самим экраном (265-2, переписаны 265-4).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. `_data` несёт слова СТРАНИЦЫ.
// Экран переиспользуем: тот же вид понадобится соседнему разделу «Письмо-ключ
// (Resend)» и любому провайдеру, чьи ключи выдаёт кто-то чужой.
//
// 🛑 НАЗВАНИЯ РАЗДЕЛОВ КОНСОЛИ GOOGLE ВЗЯТЫ ИЗ ПЕРВОИСТОЧНИКА, А НЕ ПО ПАМЯТИ, И
// ЭТО ОПЛАЧЕНО ЗАМЕЧАНИЕМ ВЛАДЕЛЬЦА 2026-09-21: «из твоего описания я сделать это
// не могу». Первая редакция вела человека в «OAuth consent screen → Credentials»,
// а Google этот раздел переименовал: сегодня это **Google Auth Platform** с
// разделами **Branding**, **Audience** и **Clients**, и кнопка называется
// **CREATE CLIENT** (support.google.com/cloud/answer/6158849).
//
// 🔒 ОТСЮДА ПРАВИЛО ШИРЕ ЭТОГО ФАЙЛА: инструкция, ведущая человека по ЧУЖОЙ
// панели, стареет без нашего ведома и молча. Проверять её надо у первоисточника
// в тот день, когда её пишут, и заново — когда человек сообщает, что не нашёл.

export type GoogleSetupWords = {
  loading: string

  /** плашка: узел ещё не на своём домене */
  lockedTitle: string
  lockedText: string
  lockedWhere: string

  /** общая подводка над лестницей */
  intro: string

  step1Title: string
  step1Text: string
  openConsole: string

  step2Title: string
  step2Text: string
  step2Points: string[]

  step3Title: string
  step3Text: string
  step3Points: string[]

  step4Title: string
  step4Text: string
  redirectLabel: string
  redirectRequired: string
  originLabel: string
  originOptional: string
  copy: string
  copied: string
  noRedirect: string

  step5Title: string
  step5Text: string
  idLabel: string
  idHint: string
  secretLabel: string
  secretHint: string
  turnOn: string
  sending: string

  step6Title: string
  onText: string
  offText: string
  turnOff: string
  notInstalled: string

  savedOn: string
  savedOff: string

  errBoth: string
  errShape: string
  errWhitespace: string
  errTemporary: string
  errForbidden: string
  errNetwork: string
  errUnknown: string

  caveat: string
}

const DICT: Record<string, GoogleSetupWords> = {
  en: {
    loading: "Asking the node…",

    lockedTitle: "Your own domain comes first",
    lockedText:
      "Google returns a person to a public address after they approve the sign-in, and a node that is reachable only from this computer has no such address. Set the domain up first — otherwise this screen would end in a button that looks configured and never works.",
    lockedWhere: "The section «Domain and hosting» walks through it, once, in about ten minutes of waiting.",

    intro:
      "Five minutes in Google's console, once. Nothing here costs money, and you do not need to publish anything to start.",

    step1Title: "Create a project in Google's console",
    step1Text:
      "A project is only a container for your keys — nobody but you sees its name. Open the console, use the project selector in the top bar and create a new one.",
    openConsole: "Open Google Cloud Console",

    step2Title: "Say what people will see while signing in",
    step2Text:
      "In the left menu open «Google Auth Platform» → «Branding». This is the screen a person is shown when they press your Google button, so the name here is your name, not ours.",
    step2Points: [
      "App name — what the person reads above «wants access to your Google Account».",
      "User support email — your own address; Google shows it to anyone who asks.",
      "Developer contact information — your address again, this one is for Google itself.",
    ],

    step3Title: "Decide who may sign in",
    step3Text:
      "Same menu, section «Audience». Choose user type «External» — that is any Google account, which is what a public site needs. Then one choice worth understanding:",
    step3Points: [
      "While the app stays in «Testing», only the accounts you list as test users can sign in — up to 100 — and their approval expires after seven days.",
      "Publishing removes both limits. Verification by Google is required only for sensitive scopes; sign-in asks for name, email and profile, which are not sensitive.",
      "So: add yourself as a test user to try it today, and publish when you want other people in.",
    ],

    step4Title: "Create the client and give Google your addresses",
    step4Text:
      "Same menu, section «Clients» → «CREATE CLIENT» → application type «Web application». The form asks for two kinds of address; both are below, ready to copy.",
    redirectLabel: "Authorized redirect URI",
    redirectRequired: "Required. This is where Google sends the person back. One extra character and sign-in ends with «redirect_uri_mismatch» on Google's side.",
    originLabel: "Authorized JavaScript origin",
    originOptional: "Optional for this kind of sign-in — Google's own documentation says server-side apps specify the redirect URI. The field is in the form, so the value is here; filling it changes nothing and leaving it empty breaks nothing.",
    copy: "Copy",
    copied: "Copied",
    noRedirect:
      "Your sign-in service has not been told its public address yet. Reconnect the domain — until then there is nothing to give Google.",

    step5Title: "Bring the pair Google gave you",
    step5Text:
      "After «CREATE» Google shows two values. They go straight into your sign-in service; the node does not keep them and cannot show them back.",
    idLabel: "Client ID",
    idHint: "ends with .apps.googleusercontent.com",
    secretLabel: "Client secret",
    secretHint: "shown by Google once — copy it before closing that page",
    turnOn: "Turn Google on",
    sending: "Writing and restarting…",

    step6Title: "State",
    onText: "Google sign-in is on. The button is on your sign-in page.",
    offText: "Google sign-in is off. Nobody sees the button.",
    turnOff: "Turn off",
    notInstalled:
      "This node carries no sign-in service, so there is nothing to configure. Install it first — until then nobody can sign in at all.",

    savedOn: "Done. The service is restarting; the button appears within a few seconds.",
    savedOff: "Turned off. The service is restarting.",

    errBoth: "Both values are needed: with one of them the service keeps the provider off, and the screen would lie to you.",
    errShape: "That client id does not look like Google's — they end with .apps.googleusercontent.com. Check you did not paste the secret into the first field.",
    errWhitespace: "There is a space or a line break inside the value. That usually means the copy caught something extra.",
    errTemporary: "Keys cannot be set from a temporary address: anyone who was sent that link could open this page. Do it from this computer or from your own domain.",
    errForbidden: "This needs the architect role.",
    errNetwork: "The node did not answer. Nothing was written.",
    errUnknown: "The node refused and did not say why. Nothing was written.",

    caveat:
      "Whether the pair is correct is known only to Google, and only at the first sign-in. The node checks the shape and does not pretend to check more.",
  },
  ru: {
    loading: "Спрашиваю узел…",

    lockedTitle: "Сначала собственный домен",
    lockedText:
      "После согласия человека Google возвращает его по публичному адресу, а у узла, доступного только с этого компьютера, такого адреса нет. Сначала подключите домен — иначе настройка закончится кнопкой, которая выглядит рабочей и не работает.",
    lockedWhere: "Это разбирает раздел «Домен и хостинг» — один раз, и почти всё время там уходит на ожидание.",

    intro:
      "Пять минут в консоли Google, один раз. Ничего из этого не стоит денег, и публиковать что-либо, чтобы начать, не нужно.",

    step1Title: "Создайте проект в консоли Google",
    step1Text:
      "Проект — это просто контейнер для ваших ключей, его имя не увидит никто, кроме вас. Откройте консоль, нажмите выбор проекта в верхней полосе и создайте новый.",
    openConsole: "Открыть Google Cloud Console",

    step2Title: "Скажите, что человек увидит при входе",
    step2Text:
      "В левом меню откройте «Google Auth Platform» → «Branding». Это тот экран, который показывают человеку, нажавшему вашу кнопку Google, — значит и имя здесь ваше, а не наше.",
    step2Points: [
      "App name — то, что человек прочитает над словами «хочет получить доступ к вашему аккаунту Google».",
      "User support email — ваш адрес; Google показывает его всякому, кто спросит.",
      "Developer contact information — снова ваш адрес, этот нужен самому Google.",
    ],

    step3Title: "Решите, кто может входить",
    step3Text:
      "То же меню, раздел «Audience». Тип пользователей — «External», то есть любой аккаунт Google: именно это нужно публичному сайту. Дальше один выбор, который стоит понимать:",
    step3Points: [
      "Пока приложение в состоянии «Testing», войти могут только те аккаунты, которые вы впишете в тестовые, — не больше ста, — и их согласие истекает через семь дней.",
      "Публикация снимает оба ограничения. Проверка со стороны Google нужна только для чувствительных разрешений, а вход просит имя, почту и профиль — они к чувствительным не относятся.",
      "Отсюда порядок: впишите себя в тестовые, чтобы попробовать сегодня, и опубликуйте, когда захотите пускать других.",
    ],

    step4Title: "Создайте клиент и отдайте Google свои адреса",
    step4Text:
      "То же меню, раздел «Clients» → «CREATE CLIENT» → тип приложения «Web application». Форма спросит два рода адресов; оба готовы ниже.",
    redirectLabel: "Authorized redirect URI",
    redirectRequired: "Обязательный. Сюда Google возвращает человека. Лишний знак — и вход закончится ошибкой «redirect_uri_mismatch» на стороне Google.",
    originLabel: "Authorized JavaScript origin",
    originOptional: "Для такого входа не обязателен: документация Google говорит, что серверные приложения указывают адрес возврата. Поле в форме есть, поэтому значение здесь — вписать его ничего не изменит, оставить пустым ничего не сломает.",
    copy: "Скопировать",
    copied: "Скопировано",
    noRedirect:
      "Вашей службе входа ещё не сказали её публичный адрес. Подключите домен заново — пока его нет, отдавать Google нечего.",

    step5Title: "Принесите пару, которую выдал Google",
    step5Text:
      "После «CREATE» Google покажет два значения. Они уходят прямо в вашу службу входа; узел их у себя не хранит и показать обратно не может.",
    idLabel: "Идентификатор клиента (Client ID)",
    idHint: "оканчивается на .apps.googleusercontent.com",
    secretLabel: "Секрет клиента (Client secret)",
    secretHint: "Google показывает его один раз — скопируйте, прежде чем закрыть ту страницу",
    turnOn: "Включить Google",
    sending: "Записываю и перезапускаю…",

    step6Title: "Состояние",
    onText: "Вход через Google включён. Кнопка стоит на вашей странице входа.",
    offText: "Вход через Google выключен. Кнопку никто не видит.",
    turnOff: "Выключить",
    notInstalled:
      "На этом узле нет службы входа, и настраивать нечего. Сначала установите её — пока её нет, войти не может никто.",

    savedOn: "Готово. Служба перезапускается, кнопка появится через несколько секунд.",
    savedOff: "Выключено. Служба перезапускается.",

    errBoth: "Нужны оба значения: с одним служба оставит провайдера выключенным, и экран соврал бы вам.",
    errShape: "Этот идентификатор не похож на выданный Google — они оканчиваются на .apps.googleusercontent.com. Проверьте, не вставили ли вы секрет в первое поле.",
    errWhitespace: "Внутри значения пробел или перенос строки. Обычно это значит, что копирование захватило лишнее.",
    errTemporary: "Ключи нельзя вписать с временного адреса: эту страницу мог бы открыть всякий, кому переслали ссылку. Сделайте это с самого компьютера или со своего домена.",
    errForbidden: "Для этого нужна роль архитектора.",
    errNetwork: "Узел не ответил. Ничего не записано.",
    errUnknown: "Узел отказал и не назвал причину. Ничего не записано.",

    caveat:
      "Верна ли пара, знает только Google, и только при первом входе. Узел проверяет форму и не притворяется, что умеет больше.",
  },
}

/** Адрес консоли Google — один на все языки, поэтому вынесен из словаря. */
export const GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/"

/** Слова экрана на выбранном языке; незнакомый язык честно деградирует до английского. */
export function googleSetupWords(lang: string): GoogleSetupWords {
  return DICT[lang] ?? DICT.en
}
