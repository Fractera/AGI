import type { SectionRenderer } from '@/sections/contract'
import { tableUi } from '@/sections/table.i18n'
import { ProjectsBoard, type ProjectsBoardWords } from '@/components/dashboard/projects-board.client'

// ТАБЛИЦА ПРОЕКТОВ УЗЛА (339): слова берутся здесь, на сервере, и уходят островку пропсами. Порядок колонок — слово владельца.
const WORDS: Record<string, Omit<ProjectsBoardWords, 'table'>> = {
  en: {
    loading: 'Asking the node about its AGI ITEMS…',
    unavailable: 'The node did not answer, so the table is not shown.',
    native: 'Show native AGI ITEMS',
    custom: 'Show custom AGI ITEMS',
    head: ['#', 'Service address', 'Meta title', 'Meta description', 'Own domain', 'For sale in web3', 'Last commit', 'Status', 'Date', 'Commits', 'Link', 'Open', 'Users online'],
    status: { running: 'running', stopped: 'stopped', building: 'building', unborn: 'not born yet' },
    openLabel: 'Open',
  },
  ru: {
    loading: 'Спрашиваю узел о его AGI ITEMS…',
    unavailable: 'Узел не ответил, поэтому таблица не показана.',
    native: 'Показывать нативные AGI ITEMS',
    custom: 'Показывать кастомные AGI ITEMS',
    head: ['№', 'Служебный адрес', 'Заголовок из мета', 'Описание из мета', 'Свой домен', 'На продаже в web3', 'Последний коммит', 'Статус', 'Дата', 'Коммитов', 'Ссылка', 'Открыть', 'Пользователи онлайн'],
    status: { running: 'работает', stopped: 'остановлен', building: 'идёт сборка', unborn: 'ещё не рождён' },
    openLabel: 'Открыть',
  },
}

export const projectsBoard: SectionRenderer<'projectsBoard'> = (b, { key: k }) => (
  <ProjectsBoard key={k} lang={b.lang} words={{ ...(WORDS[b.lang] ?? WORDS.en), table: tableUi(b.lang) }} />
)
