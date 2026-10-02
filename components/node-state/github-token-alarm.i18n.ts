// СЛОВА ТРЕВОЖНОЙ ПОЛОСЫ «РАБОТА НЕ СОХРАНЯЕТСЯ В GITHUB» (шаг 374-9). `en` основа, `ru` перевод; выбирает сервер и передаёт
// острову пропсом.
export type GithubTokenAlarmWords = { lead: string; why: string; connect: string }

const DICT: Record<"en" | "ru", GithubTokenAlarmWords> = {
  en: {
    lead: "Your AGI ITEMS are kept only on this computer.",
    why: "Every change is saved in each item's own history here, but nowhere else: if this computer breaks, the work is gone. Add a GitHub key — the node creates a private repository for every AGI ITEM in your account, uploads the whole history and keeps it there; the project can then be restored on any computer, and any item can be handed over on its own.",
    connect: "Add a GitHub key",
  },
  ru: {
    lead: "Ваши AGI ITEMS хранятся только на этом компьютере.",
    why: "Каждая правка сохраняется в истории своего элемента здесь, но больше нигде: если компьютер сломается, работа пропадёт. Добавьте ключ GitHub — узел создаст в вашем аккаунте приватный репозиторий для каждого AGI ITEM, выгрузит туда всю историю и будет хранить её там; тогда проект можно восстановить на любом компьютере, а любой элемент — передать отдельно.",
    connect: "Добавить ключ GitHub",
  },
}

export function githubTokenAlarmWords(lang: string): GithubTokenAlarmWords {
  return lang === "ru" ? DICT.ru : DICT.en
}
