// СЛОВА СТРАНИЦЫ GITHUB РОЖДЁННОГО ЭЛЕМЕНТА (319-5). `en` основа, `ru` перевод; строки выбирает сервер и передаёт островку.

export type ElementGithubUi = {
  notBorn: string
  step1: string
  step1Link: string
  step2: string
  step2Link: string
  step2Sub: string[]
  step3: string
  step4: string
  repoLabel: string
  repoPlaceholder: string
  tokenLabel: string
  tokenPlaceholder: string
  tokenHelp: string
  connect: string
  connecting: string
  connected: string
  account: string
  keyTail: string
  expires: string
  noExpiry: string
  forget: string
  push: string
  pushing: string
  pushHelp: string
  lastPush: string
  neverPushed: string
  dirty: string
  dirtyHelp: string
  commitPush: string
  commitPushHelp: string
  pushed: string
  nextStep: string
  network: string
  keySource: string
  keyElement: string
  keyNode: string
  importTitle: string
  importIntro: string
  importRepo: string
  importToken: string
  importButton: string
  importConfirm: string
  importYes: string
  importCancel: string
  importRefresh: string
  importState: Record<string, string>
  errors: Record<string, string>
}

const DICT: Record<string, ElementGithubUi> = {
  en: {
    notBorn: "The element is not born yet: give birth to it on its home page — then its folder can go to GitHub.",
    step1: "Create an empty repository on your GitHub — without a README, or GitHub will reject the export.",
    step1Link: "Create a repository",
    step2: "Sign in to GitHub as the account that owns the repository and create a classic key:",
    step2Link: "Create a classic key",
    step2Sub: [
      "If a list of keys opens, press «Generate new token» and choose «Generate new token (classic)» — not the fine-grained one.",
      "Note — any name, e.g. «fractera element»; Expiration — the term you want.",
      "Tick two boxes: «repo» (writing to your repositories) and «workflow» (the element carries GitHub Actions files in .github/workflows — without this box GitHub refuses them). Nothing else is needed.",
      "Press «Generate token» at the bottom and copy the key — it starts with ghp_.",
    ],
    step3: "Paste the repository and the key below and press «Check and save».",
    step4: "Sending answers 403? The key has no «repo» box or belongs to another GitHub account — create a new one by point 2, paste it and press «Check and save»: it replaces the old one.",
    repoLabel: "Repository",
    repoPlaceholder: "owner/name or https://github.com/owner/name",
    tokenLabel: "GitHub key",
    tokenPlaceholder: "ghp_…",
    tokenHelp: "A classic key with the «repo» box, created under the account that owns the repository. The node keeps it in its own data (owner-only), shows only the last 4 characters and never writes it into git settings.",
    connect: "Check and save",
    connecting: "Asking GitHub…",
    connected: "Connected",
    account: "Account",
    keyTail: "Key ends with",
    expires: "Key expires",
    noExpiry: "no expiry",
    forget: "Forget the key",
    push: "Send to GitHub",
    pushing: "Sending…",
    pushHelp: "Sends the element's committed history to the branch main of the repository. Nothing is sent by itself — only by this button. The repository should be empty or already hold this element's history.",
    lastPush: "Last export",
    neverPushed: "not exported yet",
    dirty: "The element's folder has {n} uncommitted change(s) — nothing was sent.",
    dirtyHelp: "Changes the agent has not committed are not part of the history and would not reach GitHub. Ask the element's agent to commit them, then press «Send to GitHub» again.",
    commitPush: "Commit and send",
    commitPushHelp: "The node commits every uncommitted change itself as «export <date>» and sends. Use it when you do not want to wait for the agent; the commit message says nothing about what changed.",
    pushed: "Sent: commit {commit}.",
    nextStep: "Connected. Next step — press «Send to GitHub».",
    network: "The node did not answer as expected (code {code}). Reload the page and try again; if it repeats, the reason is in the node log.",
    keySource: "Sent with",
    keyElement: "this item's own key",
    keyNode: "the node's common key — if it is revoked, this item stops being saved until you add its own key above",
    importTitle: "Replace the code from another repository",
    importIntro: "Bought or found a ready project? It takes this item's place: the same address, domain and port, the new code. The current history first goes to this item's repository and stays there as an archive. The key below becomes this item's own key and is used from now on.",
    importRepo: "Repository to take (owner/name)",
    importToken: "Key that sees that repository",
    importButton: "Replace the code",
    importConfirm: "The code of this item is replaced with {repo}. Its current history goes to {previous} and stays there. The item stops for the time of the build (a few minutes). Continue?",
    importYes: "Yes, replace",
    importCancel: "Cancel",
    importRefresh: "Refresh the state",
    importState: {
      starting: "Starting…",
      archiving: "Saving the current history to its repository…",
      downloading: "Downloading the new project…",
      swapping: "Putting the new project in place…",
      building: "Building — the item is back in a few minutes.",
      done: "Done: the new project works in this item's place. The previous history is in {previous}.",
      failed: "Stopped: {reason}",
    },
    errors: {
      "archive-first": "This item has no repository yet — its current history would be lost. Create the repositories first (Build → GitHub).",
      "same-repo": "This is already this item's repository.",
      "bad-repo": "Write the repository as owner/name or as its GitHub address.",
      "bad-token-shape": "This does not look like a GitHub key (github_pat_… or ghp_…).",
      "token-rejected": "GitHub does not accept this key.",
      "no-write": "GitHub does not let this key write to the repository (a trial push answered 403). Create a classic key with the «repo» box under the account that owns the repository (point 2) and paste it.",
      "repo-not-visible": "The key does not see this repository — check the name and the key's repository access.",
      "github-unreachable": "GitHub did not answer — check the internet connection.",
      "github-refused": "GitHub refused the check.",
      "not-connected": "Connect the repository first.",
      "rejected": "GitHub rejected the export: the repository holds a different history. Use an empty repository or this element's own.",
      "auth-failed": "GitHub rejected the key while sending (403): the key has no «repo» box or belongs to another account. Create a new one by point 2 and paste it.",
      "repo-not-found": "GitHub does not find the repository.",
      "needs-workflow": "GitHub refused the files in .github/workflows: the key has no «workflow» box. Create a key with «repo» and «workflow» (point 2), paste it and send again.",
      "commit-failed": "The node could not commit the changes.",
      "push-failed": "The export did not go through.",
      "temporary-address": "Keys are not handled on a temporary public address — open the node on its own domain or on this computer.",
    },
  },
  ru: {
    notBorn: "Элемент ещё не рождён: родите его на главной — тогда его папку можно отправить в GitHub.",
    step1: "Создайте на своём GitHub пустой репозиторий — без README, иначе GitHub отклонит выгрузку.",
    step1Link: "Создать репозиторий",
    step2: "Войдите в GitHub под тем аккаунтом, которому принадлежит репозиторий, и создайте классический ключ:",
    step2Link: "Создать классический ключ",
    step2Sub: [
      "Если открылся список ключей, нажмите «Generate new token» и выберите «Generate new token (classic)» — не тонкий ключ.",
      "Note — любое имя, например «fractera element»; Expiration — нужный срок.",
      "Отметьте две галочки: «repo» (запись в ваши репозитории) и «workflow» (в элементе есть файлы GitHub Actions в .github/workflows — без этой галочки GitHub их не примет). Больше ничего не нужно.",
      "Внизу нажмите «Generate token» и скопируйте ключ — он начинается с ghp_.",
    ],
    step3: "Вставьте репозиторий и ключ ниже и нажмите «Проверить и сохранить».",
    step4: "Отправка отвечает 403? У ключа нет галочки «repo» или он создан под другим аккаунтом GitHub — создайте новый по пункту 2, вставьте и нажмите «Проверить и сохранить»: он заменит старый.",
    repoLabel: "Репозиторий",
    repoPlaceholder: "владелец/имя или https://github.com/владелец/имя",
    tokenLabel: "Ключ GitHub",
    tokenPlaceholder: "ghp_…",
    tokenHelp: "Классический ключ с галочкой «repo», созданный под аккаунтом-владельцем репозитория. Узел хранит его в своих данных (доступ только владельцу), показывает лишь 4 последних знака и никогда не пишет в настройки git.",
    connect: "Проверить и сохранить",
    connecting: "Спрашиваю GitHub…",
    connected: "Подключено",
    account: "Аккаунт",
    keyTail: "Ключ заканчивается на",
    expires: "Ключ действует до",
    noExpiry: "бессрочный",
    forget: "Забыть ключ",
    push: "Отправить в GitHub",
    pushing: "Отправляю…",
    pushHelp: "Отправляет закоммиченную историю элемента в ветку main репозитория. Сам узел ничего не отправляет — только эта кнопка. Репозиторий должен быть пустым или уже хранить историю этого элемента.",
    lastPush: "Последняя выгрузка",
    neverPushed: "ещё не выгружался",
    dirty: "В папке элемента {n} незакоммиченных правок — ничего не отправлено.",
    dirtyHelp: "Правки, которые агент не закоммитил, не входят в историю и в GitHub не попадут. Попросите агента элемента закоммитить их и нажмите «Отправить в GitHub» ещё раз.",
    commitPush: "Закоммитить и отправить",
    commitPushHelp: "Узел сам закоммитит все незакоммиченные правки как «export <дата>» и отправит. Для случая, когда ждать агента не хочется; подпись коммита ничего не говорит о том, что изменилось.",
    pushed: "Отправлено: коммит {commit}.",
    nextStep: "Подключено. Следующий шаг — нажмите «Отправить в GitHub».",
    network: "Узел ответил не так, как ожидалось (код {code}). Обновите страницу и повторите; если повторится — причина в журнале узла.",
    keySource: "Отправка идёт",
    keyElement: "собственным ключом элемента",
    keyNode: "общим ключом узла — если его отозвать, элемент перестанет сохраняться, пока вы не добавите ему свой ключ выше",
    importTitle: "Заменить код из другого репозитория",
    importIntro: "Купили или нашли готовый проект? Он встанет на место этого элемента: тот же адрес, домен и порт, новый код. Нынешняя история сначала уедет в репозиторий элемента и останется там архивом. Ключ ниже станет собственным ключом элемента и будет использоваться дальше.",
    importRepo: "Какой репозиторий взять (владелец/имя)",
    importToken: "Ключ, который видит этот репозиторий",
    importButton: "Заменить код",
    importConfirm: "Код элемента заменится на {repo}. Нынешняя история уедет в {previous} и останется там. На время сборки (несколько минут) элемент остановится. Продолжить?",
    importYes: "Да, заменить",
    importCancel: "Отмена",
    importRefresh: "Обновить состояние",
    importState: {
      starting: "Запускаю…",
      archiving: "Сохраняю нынешнюю историю в репозиторий элемента…",
      downloading: "Скачиваю новый проект…",
      swapping: "Ставлю новый проект на место…",
      building: "Собираю — элемент вернётся через несколько минут.",
      done: "Готово: новый проект работает на месте элемента. Прежняя история — в {previous}.",
      failed: "Остановлено: {reason}",
    },
    errors: {
      "archive-first": "У элемента ещё нет репозитория — его нынешняя история пропала бы. Сначала создайте репозитории («Строительство → GitHub»).",
      "same-repo": "Это и есть репозиторий этого элемента.",
      "bad-repo": "Укажите репозиторий как владелец/имя или его адресом на GitHub.",
      "bad-token-shape": "Это не похоже на ключ GitHub (github_pat_… или ghp_…).",
      "token-rejected": "GitHub не принимает этот ключ.",
      "no-write": "GitHub не даёт этому ключу писать в репозиторий (пробная отправка — 403). Создайте классический ключ с галочкой «repo» под аккаунтом-владельцем репозитория (пункт 2) и вставьте его.",
      "repo-not-visible": "Ключ не видит этот репозиторий — проверьте имя и доступ ключа к репозиториям.",
      "github-unreachable": "GitHub не ответил — проверьте подключение к интернету.",
      "github-refused": "GitHub отказал в проверке.",
      "not-connected": "Сначала подключите репозиторий.",
      "rejected": "GitHub отклонил выгрузку: в репозитории другая история. Возьмите пустой репозиторий или собственный этого элемента.",
      "auth-failed": "GitHub отклонил ключ при отправке (403): у ключа нет галочки «repo» или он создан под другим аккаунтом. Создайте новый по пункту 2 и вставьте его.",
      "repo-not-found": "GitHub не находит репозиторий.",
      "needs-workflow": "GitHub не принял файлы .github/workflows: у ключа нет галочки «workflow». Создайте ключ с галочками «repo» и «workflow» (пункт 2), вставьте и отправьте снова.",
      "commit-failed": "Узел не смог закоммитить правки.",
      "push-failed": "Выгрузка не прошла.",
      "temporary-address": "На временном публичном адресе ключи не принимаются — откройте узел на его домене или на этом компьютере.",
    },
  },
}

export function elementGithubUi(lang: string): ElementGithubUi {
  return DICT[lang] ?? DICT.en
}
