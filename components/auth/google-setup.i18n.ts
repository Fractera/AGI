// СЛОВА ЭКРАНА «ВХОД ЧЕРЕЗ GOOGLE» — рядом с самим экраном (265-2).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. `_data` несёт слова СТРАНИЦЫ —
// заголовок, вступление и темы. Экран переиспользуем: тот же вид понадобится
// соседнему разделу «Письмо-ключ (Resend)», и слова поедут вместе с ним. Приём
// тот же, что у лестницы домена и у островка порта.
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ. Язык выбирается на сервере, в браузер уезжает один набор
// строк — за этим следит `check:lang-delivery`.

export type GoogleSetupWords = {
  /** пока состояние не пришло от двери */
  loading: string

  step1Title: string
  step1Text: string
  /** подпись поля с адресом возврата */
  redirectLabel: string
  copy: string
  copied: string
  /** служба ещё не знает своего публичного адреса */
  noRedirect: string

  step2Title: string
  step2Text: string
  idLabel: string
  idHint: string
  secretLabel: string
  secretHint: string
  turnOn: string
  sending: string

  step3Title: string
  /** провайдер включён */
  onText: string
  /** провайдер выключен */
  offText: string
  turnOff: string
  /** служба входа вообще не установлена на этом узле */
  notInstalled: string

  /** успех записи */
  savedOn: string
  savedOff: string
  /** служба перезапускается, кнопка появится через несколько секунд */
  restarting: string

  /** отказы, переведённые в человеческие слова */
  errBoth: string
  errShape: string
  errWhitespace: string
  errTemporary: string
  errForbidden: string
  errNetwork: string
  errUnknown: string

  /** одна честная оговорка: правильность ключей знает только Google */
  caveat: string
}

const DICT: Record<string, GoogleSetupWords> = {
  en: {
    loading: "Asking the node…",

    step1Title: "1. Give Google the address it must return people to",
    step1Text:
      "Google refuses to send anyone back to an address it has not been told about, so this string goes into your OAuth client under «Authorized redirect URIs». Copy it exactly — one extra slash and the sign-in ends with an error page on Google's side.",
    redirectLabel: "Return address",
    copy: "Copy",
    copied: "Copied",
    noRedirect:
      "Your node has no public address yet, so there is nothing for Google to return to. Connect your domain first — the section «Domain and hosting» walks through it.",

    step2Title: "2. Bring the pair Google gave you",
    step2Text:
      "Google issues two values: a client id and a client secret. They go straight to your sign-in service and are never stored by the node. The secret is written once and never shown again — neither to you nor to anyone else.",
    idLabel: "Client ID",
    idHint: "ends with .apps.googleusercontent.com",
    secretLabel: "Client secret",
    secretHint: "shown by Google once — copy it before closing that page",
    turnOn: "Turn Google on",
    sending: "Writing and restarting…",

    step3Title: "3. State",
    onText: "Google sign-in is on. The button is on your sign-in page.",
    offText: "Google sign-in is off. Nobody sees the button.",
    turnOff: "Turn off",
    notInstalled:
      "This node carries no sign-in service, so there is nothing to configure. Install it first — until then nobody can sign in at all.",

    savedOn: "Done. The service is restarting; the button appears within a few seconds.",
    savedOff: "Turned off. The service is restarting.",
    restarting: "restarting…",

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

    step1Title: "1. Скажите Google, куда возвращать людей",
    step1Text:
      "Google отказывается возвращать человека по адресу, о котором ему не сказали, — поэтому эта строка вписывается в ваш клиент OAuth в поле «Authorized redirect URIs». Скопируйте её точно: лишняя косая черта, и вход закончится страницей ошибки на стороне Google.",
    redirectLabel: "Адрес возврата",
    copy: "Скопировать",
    copied: "Скопировано",
    noRedirect:
      "У вашего узла пока нет публичного адреса, и возвращать людей Google некуда. Сначала подключите домен — это разбирает раздел «Домен и хостинг».",

    step2Title: "2. Принесите пару, которую выдал Google",
    step2Text:
      "Google выдаёт два значения: идентификатор клиента и секрет. Они уходят прямо в вашу службу входа, узел их у себя не хранит. Секрет записывается один раз и больше не показывается никогда — ни вам, ни кому-либо ещё.",
    idLabel: "Идентификатор клиента",
    idHint: "оканчивается на .apps.googleusercontent.com",
    secretLabel: "Секрет клиента",
    secretHint: "Google показывает его один раз — скопируйте, прежде чем закрыть ту страницу",
    turnOn: "Включить Google",
    sending: "Записываю и перезапускаю…",

    step3Title: "3. Состояние",
    onText: "Вход через Google включён. Кнопка стоит на вашей странице входа.",
    offText: "Вход через Google выключен. Кнопку никто не видит.",
    turnOff: "Выключить",
    notInstalled:
      "На этом узле нет службы входа, и настраивать нечего. Сначала установите её — пока её нет, войти не может никто.",

    savedOn: "Готово. Служба перезапускается, кнопка появится через несколько секунд.",
    savedOff: "Выключено. Служба перезапускается.",
    restarting: "перезапускается…",

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

/** Слова экрана на выбранном языке; незнакомый язык честно деградирует до английского. */
export function googleSetupWords(lang: string): GoogleSetupWords {
  return DICT[lang] ?? DICT.en
}
