// СЛОВА «РАЗВЕРНУТЬ / ПРЕДПРОСМОТР» НА СТРАНИЦЕ «РАЗВЁРТЫВАНИЯ» ЭЛЕМЕНТА (узел, шаг 337-3/4). `en` основа, `ru` перевод;
// строки выбирает сервер и передаёт острову пропсом.
export type ElementDeployUi = {
  title: string
  running: string
  head: string
  none: string
  changes: string
  pending: string
  upToDate: string
  deploy: string
  deploying: string
  preview: string
  previewBuilding: string
  previewReady: string
  previewOpen: string
  accept: string
  reject: string
  accepting: string
  previewOnMachine: string
  lastOk: string
  lastFailed: string
  previewFailed: string
  busy: string
  afterDecision: string
  allDeployed: string
  reportTitle: string
  reportCheck: string
  reportMissing: string
  starting: string
  previewWaiting: string
  loading: string
  unavailable: string
}

const DICT: Record<"en" | "ru", ElementDeployUi> = {
  en: {
    title: "Deploy",
    running: "Running",
    head: "Last commit",
    none: "—",
    changes: "Uncommitted changes: {n}",
    pending: "changes waiting",
    upToDate: "up to date",
    deploy: "Deploy",
    deploying: "Deploying — about two minutes; the current version keeps serving…",
    preview: "Preview",
    previewBuilding: "Building a preview beside the running version — about two minutes…",
    previewReady: "The preview is ready: look at it, then accept or reject. Visitors still see the running version.",
    previewOpen: "Open the preview in a new tab",
    accept: "Accept",
    reject: "Reject",
    accepting: "Switching to the new version…",
    previewOnMachine: "The preview answers only on the computer where the node runs (127.0.0.1).",
    lastOk: "Last deployment: done",
    lastFailed: "Last deployment failed — the previous version keeps serving",
    previewFailed: "Preview failed:",
    busy: "Another deployment is running — wait for it to finish.",
    afterDecision: "A new deployment becomes available once you accept or reject this preview.",
    starting: "Starting — the first lines appear in a few seconds…",
    allDeployed: "Everything is deployed — there are no new changes",
    reportTitle: "What was done in this build",
    reportCheck: "How to check",
    reportMissing: "The element agent attached no task report to this commit.",
    previewWaiting: "A preview is waiting for your decision — accept or reject it first.",
    loading: "Asking the node about this element…",
    unavailable: "The node did not answer.",
  },
  ru: {
    title: "Развернуть",
    running: "Работает",
    head: "Последний коммит",
    none: "—",
    changes: "Незакоммиченных правок: {n}",
    pending: "ждёт развёртывания",
    upToDate: "актуален",
    deploy: "Развернуть",
    deploying: "Разворачиваю — около двух минут; пока работает прежняя версия…",
    preview: "Предпросмотр",
    previewBuilding: "Собираю предпросмотр рядом с работающей версией — около двух минут…",
    previewReady: "Предпросмотр готов: посмотрите и примите или отклоните. Посетители пока видят прежнюю версию.",
    previewOpen: "Открыть предпросмотр в новой вкладке",
    accept: "Принять",
    reject: "Отклонить",
    accepting: "Переключаю на новую версию…",
    previewOnMachine: "Предпросмотр отвечает только на компьютере, где работает узел (127.0.0.1).",
    lastOk: "Последнее развёртывание: готово",
    lastFailed: "Последнее развёртывание не удалось — работает прежняя версия",
    previewFailed: "Предпросмотр не удался:",
    busy: "Идёт другое развёртывание — дождитесь окончания.",
    afterDecision: "Новое развёртывание станет доступно, когда вы примете или отклоните этот предпросмотр.",
    starting: "Запускаю — первые строки появятся через несколько секунд…",
    allDeployed: "Всё уже развёрнуто — новых изменений нет",
    reportTitle: "Что сделано в этой сборке",
    reportCheck: "Как проверить",
    reportMissing: "Агент элемента не приложил отчёт о задаче к этому коммиту.",
    previewWaiting: "Предпросмотр ждёт вашего решения — сначала примите или отклоните его.",
    loading: "Спрашиваю узел об этом элементе…",
    unavailable: "Узел не ответил.",
  },
}

export function elementDeployUi(lang: string): ElementDeployUi {
  return lang === "ru" ? DICT.ru : DICT.en
}
