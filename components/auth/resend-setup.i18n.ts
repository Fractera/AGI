// СЛОВА ЭКРАНА «ПИСЬМО-КЛЮЧ (RESEND)» — рядом с самим экраном (266-2).
//
// 🔒 УСТРОЙСТВО ТО ЖЕ, ЧТО У ЭКРАНА GOOGLE, И ЭТО СЛОВО ВЛАДЕЛЬЦА: «абсолютно такой
// же с точки зрения смысла». Повторяется смысл, а не текст: у Resend другие
// ловушки, и их надо назвать до того, как человек в них попадёт.
//
// 🛑 НАЗВАНИЯ РАЗДЕЛОВ ПАНЕЛИ RESEND ВЗЯТЫ У ПЕРВОИСТОЧНИКА (resend.com/docs,
// 2026-09-22): Domains → Add Domain; записи DKIM, SPF и MX/CNAME; «часто
// подтверждается в течение 15 минут», распространение DNS — до 72 часов; права
// ключа `full_access` и `sending_access`. Урок того же дня: инструкция по ЧУЖОЙ
// панели стареет молча и проверяется у источника, а не по памяти.
//
// 🛑 ГЛАВНАЯ ЛОВУШКА НАЗЫВАЕТСЯ НА ВТОРОЙ СТУПЕНИ, А НЕ В КОНЦЕ: пока домен не
// подтверждён, Resend шлёт письма только на почту владельца аккаунта. Узнав это
// после настройки, человек решает, что сломан наш продукт.

export type ResendSetupWords = {
  loading: string

  lockedTitle: string
  lockedText: string
  lockedWhere: string

  intro: string

  step1Title: string
  step1Text: string
  openResend: string

  step2Title: string
  step2Text: string
  step2Points: string[]
  /** подсказка «какой домен добавить» — `{zone}` подставляется */
  zoneHint: string
  openDomains: string

  step3Title: string
  step3Text: string
  step3Points: string[]

  step4Title: string
  step4Text: string
  keyLabel: string
  keyHint: string
  fromLabel: string
  fromHint: string
  /** пример отправителя — `{zone}` подставляется */
  fromExample: string
  turnOn: string
  sending: string

  step5Title: string
  onText: string
  offText: string
  /** «письма уходят с адреса …» — `{from}` подставляется */
  fromNow: string
  turnOff: string
  notInstalled: string

  savedOn: string
  savedOff: string

  errBoth: string
  errWhitespace: string
  errFromShape: string
  errFromSandbox: string
  errTemporary: string
  errForbidden: string
  errNetwork: string
  errUnknown: string

  caveat: string
}

const DICT: Record<string, ResendSetupWords> = {
  en: {
    loading: "Asking the node…",

    lockedTitle: "Your own domain comes first",
    lockedText:
      "The letter carries a link back to your sign-in page, and a node reachable only from this computer has no public page to link to. Resend also sends from your own domain only after it is verified. Set the domain up first — otherwise this screen would end in a button that sends nothing anyone can use.",
    lockedWhere: "The section «Domain and hosting» walks through it.",

    intro:
      "About ten minutes of your time in Resend, and then a wait while the internet learns your new records. The free plan is enough to start.",

    step1Title: "Create a Resend account",
    step1Text: "Resend is the service that actually delivers the letter. Sign up with any email you read — the account is yours, not ours.",
    openResend: "Open Resend",

    step2Title: "Add your domain and prove it is yours",
    step2Text:
      "In Resend open «Domains» → «Add Domain». Resend recommends a subdomain rather than the domain itself — it keeps sign-in mail separate from anything else you send.",
    step2Points: [
      "Choose the region closest to most of the people who will sign in.",
      "Resend shows a few DNS records — DKIM and SPF (type TXT) and an MX or CNAME. Add each one, exactly as shown, where your domain's DNS lives.",
      "Verification often takes about fifteen minutes; DNS can take up to 72 hours to spread. Resend shows «Verified» when it is done.",
      "Until it says «Verified», Resend delivers letters only to the email of the Resend account owner — anyone else gets nothing. This is Resend's rule, not ours.",
    ],
    zoneHint: "Your domain is {zone} — a subdomain such as mail.{zone} is a good choice.",
    openDomains: "Open Domains in Resend",

    step3Title: "Create a key that can only send",
    step3Text: "In Resend open «API Keys» → create a key. Give it a name you will recognise later.",
    step3Points: [
      "Permission «Sending access» is enough: the key can send letters and nothing else. «Full access» would also let it delete your domains.",
      "You may restrict the key to the domain you just verified — then even a leaked key sends only from it.",
      "Resend shows the key once. Copy it before closing that page.",
    ],

    step4Title: "Bring the key and choose the sender",
    step4Text:
      "The key goes straight into your sign-in service and is never shown again. The sender is the address people see the letter come from; it must be on the domain you verified.",
    keyLabel: "API key",
    keyHint: "shown by Resend once — copy it before closing that page",
    fromLabel: "Sender",
    fromHint: "an address on your verified domain, with a name if you like",
    fromExample: "Sign-in <noreply@mail.{zone}>",
    turnOn: "Turn sign-in letters on",
    sending: "Writing and restarting…",

    step5Title: "State",
    onText: "Sign-in letters are on. The option is on your sign-in page.",
    offText: "Sign-in letters are off. Nobody sees the option.",
    fromNow: "Letters are sent from {from}.",
    turnOff: "Turn off",
    notInstalled:
      "This node carries no sign-in service, so there is nothing to configure. Install it first — until then nobody can sign in at all.",

    savedOn: "Done. The service is restarting; the option appears within a few seconds.",
    savedOff: "Turned off. The sender stays remembered for next time.",

    errBoth: "Both are needed: without a sender the service would use its default, which no mail service accepts — and the option would appear anyway.",
    errWhitespace: "There is a space or a line break inside the key. That usually means the copy caught something extra.",
    errFromShape: "That does not look like an address. Write it as noreply@mail.example.com, or as Name <noreply@mail.example.com>.",
    errFromSandbox: "Addresses on resend.dev deliver only to the owner of the Resend account, so your visitors would never get the letter. Use an address on your own verified domain.",
    errTemporary: "Keys cannot be set from a temporary address: anyone who was sent that link could open this page. Do it from this computer or from your own domain.",
    errForbidden: "This needs the architect role.",
    errNetwork: "The node did not answer. Nothing was written.",
    errUnknown: "The node refused and did not say why. Nothing was written.",

    caveat:
      "Whether the key works and the domain is verified is known only to Resend, at the first letter. The node checks the shape and does not pretend to check more.",
  },
  ru: {
    loading: "Спрашиваю узел…",

    lockedTitle: "Сначала собственный домен",
    lockedText:
      "В письме лежит ссылка обратно на вашу страницу входа, а у узла, доступного только с этого компьютера, публичной страницы нет. К тому же Resend отправляет с вашего домена только после того, как он подтверждён. Сначала подключите домен — иначе настройка закончится кнопкой, которая не шлёт ничего, чем можно воспользоваться.",
    lockedWhere: "Это разбирает раздел «Домен и хостинг».",

    intro:
      "Минут десять вашего времени в Resend, а потом ожидание, пока интернет узнает ваши новые записи. Бесплатного тарифа для начала достаточно.",

    step1Title: "Заведите аккаунт Resend",
    step1Text: "Resend — служба, которая на самом деле доставляет письмо. Зарегистрируйтесь с любой почтой, которую читаете; аккаунт ваш, а не наш.",
    openResend: "Открыть Resend",

    step2Title: "Добавьте свой домен и докажите, что он ваш",
    step2Text:
      "В Resend откройте «Domains» → «Add Domain». Resend советует поддомен, а не сам домен: так письма для входа не смешиваются со всем остальным, что вы отправляете.",
    step2Points: [
      "Выберите регион, ближайший к большинству тех, кто будет входить.",
      "Resend покажет несколько записей DNS — DKIM и SPF (тип TXT) и MX или CNAME. Добавьте каждую точно как показано — там, где живут записи вашего домена.",
      "Подтверждение часто занимает около пятнадцати минут; расходиться по интернету записи DNS могут до 72 часов. Когда всё готово, Resend пишет «Verified».",
      "Пока там не написано «Verified», Resend доставляет письма только на почту владельца аккаунта Resend — всем остальным не приходит ничего. Это правило Resend, а не наше.",
    ],
    zoneHint: "Ваш домен — {zone}; хороший выбор — поддомен вида mail.{zone}.",
    openDomains: "Открыть Domains в Resend",

    step3Title: "Создайте ключ, который умеет только отправлять",
    step3Text: "В Resend откройте «API Keys» → создайте ключ. Дайте ему имя, которое потом узнаете.",
    step3Points: [
      "Права «Sending access» достаточно: такой ключ умеет отправлять письма и ничего больше. «Full access» позволил бы ему ещё и удалять ваши домены.",
      "Ключ можно ограничить только что подтверждённым доменом — тогда даже утёкший ключ отправит только с него.",
      "Resend показывает ключ один раз. Скопируйте его, прежде чем закрыть ту страницу.",
    ],

    step4Title: "Принесите ключ и выберите отправителя",
    step4Text:
      "Ключ уходит прямо в вашу службу входа и больше не показывается. Отправитель — адрес, с которого люди увидят письмо; он обязан быть на подтверждённом домене.",
    keyLabel: "Ключ API",
    keyHint: "Resend показывает его один раз — скопируйте, прежде чем закрыть ту страницу",
    fromLabel: "Отправитель",
    fromHint: "адрес на подтверждённом домене, можно с именем",
    fromExample: "Вход <noreply@mail.{zone}>",
    turnOn: "Включить вход по письму",
    sending: "Записываю и перезапускаю…",

    step5Title: "Состояние",
    onText: "Вход по письму включён. Этот способ стоит на вашей странице входа.",
    offText: "Вход по письму выключен. Этого способа никто не видит.",
    fromNow: "Письма уходят с адреса {from}.",
    turnOff: "Выключить",
    notInstalled:
      "На этом узле нет службы входа, и настраивать нечего. Сначала установите её — пока её нет, войти не может никто.",

    savedOn: "Готово. Служба перезапускается, способ появится через несколько секунд.",
    savedOff: "Выключено. Отправитель запомнен на следующий раз.",

    errBoth: "Нужно и то и другое: без отправителя служба взяла бы своё умолчание, которое не принимает ни одна почтовая служба, — а способ входа всё равно бы появился.",
    errWhitespace: "Внутри ключа пробел или перенос строки. Обычно это значит, что копирование захватило лишнее.",
    errFromShape: "Это не похоже на адрес. Напишите его как noreply@mail.example.com или как Имя <noreply@mail.example.com>.",
    errFromSandbox: "С адресов на resend.dev письма доходят только до владельца аккаунта Resend — ваши посетители их не получат. Возьмите адрес на своём подтверждённом домене.",
    errTemporary: "Ключ нельзя вписать с временного адреса: эту страницу мог бы открыть всякий, кому переслали ссылку. Сделайте это с самого компьютера или со своего домена.",
    errForbidden: "Для этого нужна роль архитектора.",
    errNetwork: "Узел не ответил. Ничего не записано.",
    errUnknown: "Узел отказал и не назвал причину. Ничего не записано.",

    caveat:
      "Работает ли ключ и подтверждён ли домен, знает только Resend — при первом письме. Узел проверяет форму и не притворяется, что умеет больше.",
  },
}

/** Адреса панели Resend — одни на все языки, поэтому вынесены из словаря. */
export const RESEND_URL = "https://resend.com/"
export const RESEND_DOMAINS_URL = "https://resend.com/domains"

/** Слова экрана на выбранном языке; незнакомый язык честно деградирует до английского. */
export function resendSetupWords(lang: string): ResendSetupWords {
  return DICT[lang] ?? DICT.en
}
