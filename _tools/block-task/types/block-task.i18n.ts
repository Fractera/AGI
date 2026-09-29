// СЛОВА ОКНА ЗАДАЧИ БЛОКА (336-3). `en` основа, `ru` перевод. Шесть вариантов — слово владельца 2026-09-29; описания
// (≤200 знаков) написаны агентом, владелец поправит их позже.

import type { BlockTaskUi } from "./block-task"

const DICT: Record<"en" | "ru", BlockTaskUi> = {
  en: {
    title: "What to do with this block?",
    description: "Pick one, add details by voice or text, and send the task to the element's agent.",
    block: "Block",
    copy: "Copy address",
    copied: "Copied",
    details: "Details",
    detailsPlaceholder: "What exactly to change…",
    send: "Send",
    cancel: "Cancel",
    pickFirst: "Pick what to do first.",
    keyLink: "Add the OpenAI key",
    task: "Task",
    intents: {
      design: { title: "Improve the design", text: "The agent redraws the block — spacing, colours, fonts, composition — with Design tokens, no hard-coded values. Meaning and texts stay." },
      code: { title: "Improve the code", text: "Behaviour stays, structure changes: the agent simplifies the block's code, removes repetition, checks types and accessibility." },
      broken: { title: "This works wrong", text: "Say what you expected and what you see. The agent finds the cause, fixes it and shows how it checked." },
      delete: { title: "Let's delete this", text: "The agent removes the block from the page with its data and any code nobody else needs, and checks that the page still builds." },
      texts: { title: "Let's change the texts", text: "The agent rewrites the block's words in every language of the page. Say what should change: tone, meaning, length." },
      tool: { title: "Let's turn this into a tool", text: "The agent moves the block into a reusable part, so it can be placed on other pages and set up with data." },
    },
  },
  ru: {
    title: "Что сделать с этим блоком?",
    description: "Выберите вариант, добавьте подробности голосом или текстом и отправьте задачу агенту элемента.",
    block: "Блок",
    copy: "Скопировать адрес",
    copied: "Скопировано",
    details: "Подробности",
    detailsPlaceholder: "Что именно изменить…",
    send: "Отправить",
    cancel: "Отмена",
    pickFirst: "Сначала выберите, что сделать.",
    keyLink: "Добавить ключ OpenAI",
    task: "Задача",
    intents: {
      design: { title: "Улучшить дизайн", text: "Агент перерисует блок — отступы, цвета, шрифты, композицию — токенами «Дизайна», без жёстких значений. Смысл и тексты остаются." },
      code: { title: "Улучшить код", text: "Поведение то же, меняется устройство: агент упростит код блока, уберёт повторы, проверит типы и доступность." },
      broken: { title: "Это работает неправильно", text: "Опишите, что вы ждали и что видите. Агент найдёт причину, исправит её и покажет, чем проверил." },
      delete: { title: "Давай это удалим", text: "Агент уберёт блок со страницы вместе с данными и кодом, который больше никому не нужен, и проверит, что страница собирается." },
      texts: { title: "Давай изменим тексты", text: "Агент перепишет слова блока на всех языках страницы. Скажите, что должно измениться: тон, смысл, длина." },
      tool: { title: "Давай превратим это в инструмент", text: "Агент вынесет блок в переиспользуемую часть, чтобы его можно было ставить на другие страницы и настраивать данными." },
    },
  },
}

export function blockTaskUi(lang: string): BlockTaskUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
