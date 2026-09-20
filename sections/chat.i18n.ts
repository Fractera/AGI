// Слова ленты переписки — хром СЕКЦИИ, а не материал страницы (шаг 80-4а).
//
// 🔒 ЯЗЫКОВ ДЕСЯТЬ, И ЭТО ПОЛНОЕ РЕШЕНИЕ, А НЕ ДОЛГ. Тот же разряд, что у
// `sections/project-type-marquee.i18n.ts`: слова, написанные для страниц ЭТОГО
// проекта, идут по включённому набору `NEXT_PUBLIC_SUPPORTED_LANGUAGES`. Все 82
// обязаны нести только переиспользуемые части продукта — меню, корзина, окно как
// таковое.
//
// 🔒 ФАЙЛ ЛЕЖИТ В КОРНЕ `sections/`, А НЕ В `sections/blocks/`. В `blocks/` живут
// ТОЛЬКО рендереры: сторож секций считает файлы этой папки, и словарь среди них
// исказил бы счёт.
//
// 🔒 ПОЛОВИНА КЛЮЧЕЙ СЕГОДНЯ НЕ РИСУЕТСЯ, И ОНИ ВСЁ РАВНО ЗДЕСЬ. Вид блока —
// всегда лента без поля ввода (обработчик отправки серверный рендерер передать не
// может), поэтому `placeholder`, `send` и `attach` на странице не появляются. Но
// договор инструмента требует их целиком, а второй словарь «для тех, у кого есть
// поле ввода» разошёлся бы с этим на первом же переводе.

import type { ChatUi } from '@/_tools/chat/types/chat'

const UI: Record<string, ChatUi> = {
  en: { emptyTitle: 'No messages yet', emptyNote: 'The conversation will appear here.', placeholder: 'Write a message…', send: 'Send', attach: 'Attach a file', place: 'Location', event: 'Event', forwarded: 'Forwarded from' },
  ru: { emptyTitle: 'Сообщений пока нет', emptyNote: 'Переписка появится здесь.', placeholder: 'Напишите сообщение…', send: 'Отправить', attach: 'Прикрепить файл', place: 'Место', event: 'Событие', forwarded: 'Переслано от' },
}

export function chatUi(lang: string): ChatUi {
  return UI[lang] ?? UI.en
}
