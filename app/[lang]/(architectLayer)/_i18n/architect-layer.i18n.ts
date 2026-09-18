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
  /** Имена разделов внутри групп — верхний ряд рабочего экрана. */
  sections: {
    toolsRequired: string
    toolsRecommended: string
    buildSubscription: string
    buildTerminal: string
    buildDocs: string
    buildEvolution: string
    buildAgent: string
    buildAgentSettings: string
    buildTelegram: string
  }
  /** Строка на пустом разделе: страница есть, содержимого пока нет. */
  emptyLead: string
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
  sections: {
    toolsRequired: "Required",
    toolsRecommended: "Recommended",
    buildSubscription: "Claude Code subscription",
    buildTerminal: "Terminal",
    buildDocs: "Development documents",
    buildEvolution: "Evolution",
    buildAgent: "Programmer agent",
    buildAgentSettings: "Agent settings",
    buildTelegram: "Telegram bot for remote development",
  },
  emptyLead: "The section is in place; its content comes with the step that builds it.",
  },
  ru: {
  layer: "Архитектор",
  menuTitle: "Ваш узел",
  groups: {
    passport: "Паспорт",
    tools: "Инструменты этого сервера",
    build: "Строительство",
  },
  sections: {
    toolsRequired: "Обязательные",
    toolsRecommended: "Рекомендуемые",
    buildSubscription: "Подписка Claude Code",
    buildTerminal: "Терминал",
    buildDocs: "Документы разработки",
    buildEvolution: "Эволюционное развитие",
    buildAgent: "Агент-программист",
    buildAgentSettings: "Настройки агента",
    buildTelegram: "Telegram-бот удалённой разработки",
  },
  emptyLead: "Раздел на месте; содержимое придёт вместе с шагом, который его построит.",
  },
}

/** Язык не из набора откатывается на английский: человек видит работающую страницу, а не пустоту. */
export function architectLayerUi(lang: string): ArchitectLayerUi {
  return DICT[lang] ?? DICT.en
}
