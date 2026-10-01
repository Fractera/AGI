// СЛОВА ПЛАШКИ «ВЕРСИЯ УСТАРЕЛА» (шаг 368). `en` основа, `ru` перевод; выбирает сервер и передаёт острову пропсом.
export type OriginNoticeWords = { text: string; sync: string }

const DICT: Record<"en" | "ru", OriginNoticeWords> = {
  en: {
    text: "Your node is built from your own fork, and the original Fractera has {n} new changes. Update when convenient — everything keeps working as it is.",
    sync: "Open your fork and press «Sync fork»",
  },
  ru: {
    text: "Узел собран из вашего форка, а в оригинале Fractera {n} новых изменений. Обновитесь, когда удобно, — всё продолжает работать как есть.",
    sync: "Открыть ваш форк и нажать «Sync fork»",
  },
}

export function originNoticeWords(lang: string): OriginNoticeWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
