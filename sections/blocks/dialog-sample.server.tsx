import type { SectionRenderer } from '@/sections/contract'
import { DialogSample, type DialogSampleShape, type DialogSampleWords } from '@/components/dialog/dialog-sample.client'
import { appDialogUi } from '@/components/dialog/app-dialog.i18n'

// ОБРАЗЕЦ МОДАЛЬНОГО ОКНА (296). Слова — дословно из каталога окон fractera-next-starter (`design.i18n.ts`,
// раздел dialogs), en и ru; берутся здесь, на сервере, и уходят островку пропсами.
type Common = Pick<DialogSampleWords, 'show' | 'longLine' | 'lockedHint'>
type Sample = Omit<DialogSampleWords, keyof Common>

const COMMON: Record<string, Common> = {
  en: {
    show: 'Show the window',
    longLine: 'A line of body text. The body scrolls; the heading and the buttons do not move.',
    lockedHint: 'This window has no cross and ignores Escape and a click outside. The only lawful use is refusing access: closing it would leave the person on a page they may not see.',
  },
  ru: {
    show: 'Показать окно',
    longLine: 'Строка текста внутри тела. Тело прокручивается; заголовок и кнопки при этом не двигаются.',
    lockedHint: 'У этого окна нет крестика, оно не закрывается ни Escape, ни нажатием мимо. Единственный законный случай — отказ в доступе: закрытие оставило бы человека на странице, которую ему нельзя видеть.',
  },
}

const SAMPLES: Record<string, Record<DialogSampleShape, Sample>> = {
  en: {
    plain: { name: 'Plain', note: 'A heading, an explanation, a cross. A reference window is closed, not confirmed — so it has no buttons at all.', title: 'A window without buttons', description: 'Read and close. This is a complete, and often the right, kind of window.', body: 'The body is optional too: a question like "add three to the order?" fits into the heading and the explanation whole, and an empty body would draw a strip of air under them.' },
    footer: { name: 'With buttons', note: 'A footer that stays put. Buttons belong to the WINDOW, not to the body — otherwise they scroll away with the text.', title: 'A window with a footer', description: 'Confirm or cancel.', body: 'The footer sits below the body and does not move with it. On a phone this is the difference between a reachable button and an unreachable one.', footerOk: 'Confirm', footerCancel: 'Cancel' },
    long: { name: 'Long — this is the one that matters', note: 'The body outgrows the screen and scrolls; the heading and the buttons stay. Exactly what a hand-built window loses.', title: 'A long window', description: 'Scroll the body — the heading and the buttons do not move.', footerOk: 'Done', footerCancel: 'Close' },
    locked: { name: 'Cannot be dismissed', note: 'No cross, no Escape, no click-outside. One lawful use: refusing access.', title: 'Access refused', description: 'The only case where a window may not be closed.', footerOk: 'Go to the main page' },
  },
  ru: {
    plain: { name: 'Простое', note: 'Заголовок, пояснение, крестик. Справочное окно закрывают, а не подтверждают, — поэтому кнопок у него нет вовсе.', title: 'Окно без кнопок', description: 'Прочитать и закрыть. Это полноценный и часто правильный вид окна.', body: 'Тело тоже необязательно: вопрос вида «положить три штуки в заказ?» укладывается в заголовок и пояснение целиком, а пустое тело нарисовало бы под ними полосу воздуха.' },
    footer: { name: 'С кнопками', note: 'Подвал, который стоит на месте. Кнопки принадлежат ОКНУ, а не телу, — иначе они уезжают вместе с текстом.', title: 'Окно с подвалом', description: 'Подтвердить или отменить.', body: 'Подвал лежит под телом и не двигается вместе с ним. На телефоне это разница между кнопкой, до которой можно дотянуться, и кнопкой, до которой нельзя.', footerOk: 'Подтвердить', footerCancel: 'Отмена' },
    long: { name: 'Длинное — вот оно и есть главное', note: 'Тело перерастает экран и прокручивается; заголовок и кнопки остаются. Ровно это теряет окно, собранное руками.', title: 'Длинное окно', description: 'Прокрутите тело — заголовок и кнопки не сдвинутся.', footerOk: 'Готово', footerCancel: 'Закрыть' },
    locked: { name: 'Неотменяемое', note: 'Ни крестика, ни Escape, ни нажатия мимо. Один законный случай — отказ в доступе.', title: 'Доступ закрыт', description: 'Единственный случай, когда окно нельзя закрыть.', footerOk: 'На главную' },
  },
}

export const dialogSample: SectionRenderer<'dialogSample'> = (b, { key: k }) => {
  const lang = SAMPLES[b.lang] ? b.lang : 'en'
  return (
    <DialogSample
      key={k}
      sample={b.sample}
      words={{ ...COMMON[lang], ...SAMPLES[lang][b.sample] }}
      dialogUi={appDialogUi(lang)}
    />
  )
}
