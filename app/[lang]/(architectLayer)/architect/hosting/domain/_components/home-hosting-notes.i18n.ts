// КАРТОЧКИ «КОГДА ПОДХОДИТ САЙТ С ДОМАШНЕГО КОМПЬЮТЕРА» И «ПОСЕТИТЕЛИ В РОССИИ» (узел, шаг 344-5). Слово владельца 2026-09-30:
// «на вкладке где мы подключаем и настраиваем домен … очень подробно об этом рассказать … режим который необходимо использовать
// либо на ранней стадии загрузки проекта либо тогда когда проект вообще создается только для собственных нужд. В случае если
// лимит превышен пользователя предстоит выбрать перейти на оплату Cloud Flyer или приобрести в аренду vps … Российской Федерации
// … рекомендуется … использовать аренду vps»; «По умолчанию эти карточки должны быть закрыты».
//
// 🔒 ФАКТЫ — ИЗ ПЕРВОИСТОЧНИКОВ (проверено 2026-09-30), а не из пересказа:
//   лимиты и «не счёт, а отказ» — developers.cloudflare.com/workers/platform/pricing и /limits (Free: 100 000 запросов в сутки,
//   20 000 файлов на версию; «further operations of that type will fail with an error»; режим маршрута Fail open);
//   замедление в России — blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet (с 9 июня 2025,
//   «only the first 16 KB»); Роскомнадзор — interfax.ru/digital/1017951 (апрель 2025: отказаться от TLS ECH, размещаться у
//   отечественных хостинг-провайдеров). Закона, прямо запрещающего Cloudflare, первоисточники НЕ называют — поэтому текст
//   говорит «замедляют» и «рекомендовал», а не «запрещено».

export type HomeHostingNotes = { title: string; home: { summary: string; text: string[] }; russia: { summary: string; text: string[] } }

const en: HomeHostingNotes = {
  title: "Before you rely on this mode",
  home: {
    summary: "Site from a home computer: when this mode fits",
    text: [
      "The node serves your site from this computer through a Cloudflare tunnel. Public pages are also kept as a copy in your own Cloudflare account, so they open even while the computer is off. Sign-in, the personal account and everything computed on the fly work only while the computer is on.",
      "This mode fits the start of a project and sites you build for yourself. It is free within the Cloudflare Workers limits: 100,000 requests a day to what is not in the copy, and up to 20,000 files in the copy. Going over a limit never produces a bill: extra requests simply skip the copy and go straight to the computer, as they would without it.",
      "When the project grows — many visitors, or sign-in that must work around the clock — choose one of two: a paid Cloudflare Workers plan, or a rented server (VPS) that is never switched off.",
    ],
  },
  russia: {
    summary: "If your visitors are in Russia",
    text: [
      "Since 9 June 2025 Russian internet providers throttle access to sites served through Cloudflare: according to Cloudflare, visitors from Russia receive only the first 16 KB of each file, so pages practically do not open. In April 2025 Roskomnadzor advised site owners to drop Cloudflare's extension that bypasses blocking and to host sites with Russian hosting providers.",
      "If your project is public and meant for visitors in Russia, host it on a rented server (VPS) rather than through Cloudflare.",
    ],
  },
}

const ru: HomeHostingNotes = {
  title: "Прежде чем полагаться на этот режим",
  home: {
    summary: "Сайт с домашнего компьютера: когда этот режим подходит",
    text: [
      "Узел раздаёт ваш сайт с этого компьютера через туннель Cloudflare. Публичные страницы, кроме того, хранятся копией в вашем собственном аккаунте Cloudflare, поэтому они открываются и тогда, когда компьютер выключен. Вход, личный кабинет и всё, что считается на лету, работают, только пока компьютер включён.",
      "Этот режим хорош на старте проекта и для сайтов, которые вы делаете для себя. Он бесплатный в пределах лимитов Cloudflare Workers: 100 000 обращений в сутки к тому, чего нет в копии, и до 20 000 файлов в копии. Превышение лимита никогда не превращается в счёт: лишние запросы просто идут мимо копии прямо к компьютеру, как шли бы без неё.",
      "Когда проект вырастет — посетителей станет много или вход должен работать круглосуточно, — выберите одно из двух: платный тариф Cloudflare Workers или арендованный сервер (VPS), который не выключается.",
    ],
  },
  russia: {
    summary: "Если ваши посетители в России",
    text: [
      "С 9 июня 2025 года российские провайдеры замедляют доступ к сайтам, которые работают через Cloudflare: по данным Cloudflare, посетители из России получают только первые 16 КБ каждого файла, и страницы практически не открываются. В апреле 2025 года Роскомнадзор рекомендовал владельцам сайтов отказаться от расширения Cloudflare, обходящего блокировки, и размещать сайты у российских хостинг-провайдеров.",
      "Если ваш проект публичный и рассчитан на посетителей из России, размещайте его на арендованном сервере (VPS), а не через Cloudflare.",
    ],
  },
}

export function homeHostingNotes(lang: string): HomeHostingNotes {
  return lang === "ru" ? ru : en
}
