// СОДЕРЖИМОЕ СТРАНИЦЫ ГРУППЫ «СТРОИТЕЛЬСТВО» — `/{lang}/architect/build`.
//
// 🛑 ЭТО МАКЕТ, А НЕ ТЕКСТ. Решение владельца 2026-09-19, дословно: «пока я хочу
// чтобы ты сделал макет с тремя разделами: раздел один будет называться раздел
// один текст бла-бла-бла, раздел два будет называться раздел два текст
// бла-бла-бла, раздел три будет называться раздел три текст бла-бла-бла. Пока я
// хочу проверить просто дизайн, правильно ты меня понял или нет». Настоящие слова
// он даст отдельно — тогда заменяется содержимое этого файла, и только оно.
//
// 🔒 ЗАГЛУШКА ЛЕЖИТ В СЛОВАРЕ, А НЕ В РАЗМЕТКЕ СТРАНИЦЫ. Текст, написанный прямо
// в странице, не переводится и остаётся в коде навсегда: заменять его придётся
// правкой разметки, а не правкой слов. Форма файла — та же, что у входа в слой,
// поэтому замена макета настоящим текстом не потребует трогать страницу вовсе.
//
// 🔒 ФОРМА `Record<string, Ui>` — ТРЕБОВАНИЕ ПРИБОРА `check:i18n`, а не вкус:
// словарь, написанный парой констант, сторож не понимает и молча считает пустым.

import type { ArchitectTopic } from './architect-home.i18n'

export type ArchitectBuildUi = {
  /** Заголовок самой страницы — над рабочим экраном, рядом с бейджем слоя. */
  title: string
  /** Подзаголовок страницы. */
  lead: string
  /** Имя открытого раздела внутри рабочего экрана. */
  sectionTitle: string
  /** Разделы страницы. Порядок здесь — порядок на экране и в верхнем ряду. */
  topics: ArchitectTopic[]
}

const DICT: Record<string, ArchitectBuildUi> = {
  en: {
    title: 'Building',
    lead: 'The pages of this group run the development of your node: the agent, its instructions, the tools and the subscription.',
    sectionTitle: 'Overview',
    topics: [
      { anchor: 'one', tab: 'Section one', title: 'Section one', text: 'Blah-blah-blah.' },
      { anchor: 'two', tab: 'Section two', title: 'Section two', text: 'Blah-blah-blah.' },
      { anchor: 'three', tab: 'Section three', title: 'Section three', text: 'Blah-blah-blah.' },
    ],
  },
  ru: {
    title: 'Строительство',
    lead: 'Страницы этой группы ведут разработку вашего узла: агент, его инструкции, инструменты и подписка.',
    sectionTitle: 'Обзор',
    topics: [
      { anchor: 'one', tab: 'Раздел один', title: 'Раздел один', text: 'Бла-бла-бла.' },
      { anchor: 'two', tab: 'Раздел два', title: 'Раздел два', text: 'Бла-бла-бла.' },
      { anchor: 'three', tab: 'Раздел три', title: 'Раздел три', text: 'Бла-бла-бла.' },
    ],
  },
}

/** Язык не из набора откатывается на английский: человек видит работающую страницу, а не пустоту. */
export function architectBuildUi(lang: string): ArchitectBuildUi {
  return DICT[lang] ?? DICT.en
}
