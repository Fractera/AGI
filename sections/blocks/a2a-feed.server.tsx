import type { SectionRenderer } from '@/sections/contract'
import { A2aFeed, type A2aFeedWords } from '@/components/dashboard/a2a-feed.client'

// ЛЕНТА ОБЩЕНИЯ АГЕНТОВ УЗЛА (шаг 408): слова берутся здесь, на сервере, и уходят островку пропсами.
const WORDS: Record<string, A2aFeedWords> = {
  en: {
    loading: 'Asking the node for the agents’ conversation…',
    unavailable: 'The node did not answer, so the conversation is not shown.',
    empty: 'No agent has called another yet. Every call between the elements of this node will appear here.',
    all: 'Everyone',
    none: 'No one',
    earlier: 'Show earlier',
    asks: 'asks',
    answers: 'answers',
    refused: 'refused',
    truncated: 'cut to 8 KB',
    data: 'Data',
    states: {
      TASK_STATE_COMPLETED: 'done',
      TASK_STATE_FAILED: 'failed',
      TASK_STATE_WORKING: 'working',
      TASK_STATE_CANCELED: 'cancelled',
      ERROR: 'error',
    },
  },
  ru: {
    loading: 'Спрашиваю узел о разговоре агентов…',
    unavailable: 'Узел не ответил, поэтому разговор не показан.',
    empty: 'Пока ни один агент не звал другого. Здесь появится каждый вызов между элементами этого узла.',
    all: 'Все',
    none: 'Никого',
    earlier: 'Показать ранее',
    asks: 'спрашивает',
    answers: 'отвечает',
    refused: 'отказ',
    truncated: 'обрезано до 8 КБ',
    data: 'Данные',
    states: {
      TASK_STATE_COMPLETED: 'готово',
      TASK_STATE_FAILED: 'не удалось',
      TASK_STATE_WORKING: 'в работе',
      TASK_STATE_CANCELED: 'отменено',
      ERROR: 'ошибка',
    },
  },
}

export const a2aFeed: SectionRenderer<'a2aFeed'> = (b, { key: k }) => (
  <A2aFeed key={k} lang={b.lang} words={WORDS[b.lang] ?? WORDS.en} />
)
