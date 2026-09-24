import type { SectionRenderer } from '@/sections/contract'
import { DeployBoard, type DeployBoardWords } from '@/components/deploy/deploy-board.client'

// ДАШБОРД РАЗВЁРТЫВАНИЙ (280-11b): элементы узла, что ждёт развёртывания, кнопка у каждого и «всё».
// Слова берутся здесь, на сервере, и уходят островку пропсами.
const WORDS: Record<string, DeployBoardWords> = {
  en: {
    intro: 'A deployment rebuilds a part of your project so that it shows what you have saved — design, settings, a new version. Saving alone does not change what visitors see.',
    what: 'Deploy once after a series of changes, not after each one: every element is rebuilt in a neighbour folder while the old build keeps serving, then switched in a few seconds. One element takes about two minutes; elements are deployed one after another.',
    loading: 'Asking the node about its elements…',
    unavailable: 'The node did not answer, so the list is not shown.',
    element: 'Element',
    version: 'version',
    built: 'built',
    status: 'status',
    pending: 'changes waiting',
    upToDate: 'up to date',
    noSettings: 'takes no settings from the core',
    notInstalled: 'not installed',
    deployOne: 'Deploy',
    deployAll: 'Deploy everything',
    running: 'Deploying {id}…',
    queued: 'queued',
    lastRun: 'Last deployment finished',
    ok: 'done',
    failed: 'failed — the previous build keeps serving',
    core: 'core',
    coreNote: 'The core (these architect pages) is rebuilt with npm run serve:rebuild on this computer: it restarts the server that serves this page and is not yet done without downtime.',
    busy: 'A deployment is already running — wait for it to finish.',
    rollback: 'Roll back to {version}',
    rollbackGit: 'The previous version from the registry history — whether it worked is not recorded.',
  },
  ru: {
    intro: 'Развёртывание пересобирает часть проекта, чтобы она показала сохранённое: оформление, настройки, новую версию. Само сохранение того, что видят посетители, не меняет.',
    what: 'Разворачивайте один раз после серии правок, а не после каждой: каждый элемент собирается в соседнюю папку, пока прежняя сборка работает, и переключается за несколько секунд. Один элемент — около двух минут; элементы разворачиваются по очереди.',
    loading: 'Спрашиваю узел о его элементах…',
    unavailable: 'Узел не ответил, поэтому список не показан.',
    element: 'Элемент',
    version: 'версия',
    built: 'собран',
    status: 'состояние',
    pending: 'ждут изменения',
    upToDate: 'актуален',
    noSettings: 'настроек из ядра не получает',
    notInstalled: 'не установлен',
    deployOne: 'Развернуть',
    deployAll: 'Развернуть всё',
    running: 'Разворачиваю {id}…',
    queued: 'в очереди',
    lastRun: 'Последнее развёртывание завершено',
    ok: 'готово',
    failed: 'ошибка — работает прежняя сборка',
    core: 'ядро',
    coreNote: 'Ядро (эти страницы архитектора) пересобирается командой npm run serve:rebuild на этом компьютере: она перезапускает сервер, отдающий эту страницу, и пока идёт с простоем.',
    busy: 'Развёртывание уже идёт — дождитесь окончания.',
    rollback: 'Вернуть {version}',
    rollbackGit: 'Предыдущая версия из истории реестра — была ли она рабочей, не записано.',
  },
}

export const deployBoard: SectionRenderer<'deployBoard'> = (b, { key: k }) => (
  <DeployBoard key={k} words={WORDS[b.lang] ?? WORDS.en} lang={b.lang} />
)
