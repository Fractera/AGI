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
      "Note — any name, e.g. «fractera element»; Expiration — the term you want.",
      "Tick the «repo» box (full access to your repositories, writing included). Nothing else is needed.",
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
    errors: {
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
      "Note — любое имя, например «fractera element»; Expiration — нужный срок.",
      "Отметьте галочку «repo» (полный доступ к вашим репозиториям, включая запись). Больше ничего не нужно.",
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
    errors: {
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
      "commit-failed": "Узел не смог закоммитить правки.",
      "push-failed": "Выгрузка не прошла.",
      "temporary-address": "На временном публичном адресе ключи не принимаются — откройте узел на его домене или на этом компьютере.",
    },
  },
}

export function elementGithubUi(lang: string): ElementGithubUi {
  return DICT[lang] ?? DICT.en
}
