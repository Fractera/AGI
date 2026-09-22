// СЛОВА ВКЛАДКИ «GITHUB» (273).
//
// 🔒 У КАЖДОГО СОСТОЯНИЯ ПРИВЯЗКИ СВОИ СЛОВА, И НИ ОДНО НЕ НАЗЫВАЕТСЯ ПОЛОМКОЙ ЗРЯ: узел на выделенном
// сервере живёт без репозитория законно, а узел, запущенный из репозитория Fractera, работает — просто
// писать в него нельзя. Общее «что-то не так» здесь было бы ложью в обе стороны.
// 🔒 Зарегистрирован в `scripts/check-i18n.mjs` тем же коммитом, что и создан (закон 236-1).

export type GithubWords = {
  loading: string
  forbidden: string
  intro: string

  bindingTitle: string
  repoLabel: string
  branchLabel: string
  commitLabel: string
  stateOwn: string
  stateUpstream: string
  stateNoGit: string
  stateNoRemote: string
  stateForeignHost: string

  keyTitle: string
  keyLead: string
  keySteps: string[]
  keyLabel: string
  keyHint: string
  save: string
  saving: string
  saved: string
  forget: string
  check: string
  checking: string
  openTokens: string

  accessTitle: string
  accountLabel: string
  visibleLabel: string
  writeLabel: string
  expiresLabel: string
  yes: string
  no: string
  never: string
  unknown: string
  writeOk: string
  writeDenied: string
  expiresSoon: string
  notChecked: string

  errors: Record<string, string>
}

const DICT: Record<string, GithubWords> = {
  en: {
    loading: "Asking the node…",
    forbidden: "Only the architect can see this, and only from this computer or your own domain.",
    intro:
      "This page answers one question: which repository this node works with right now. It asks git itself, so a renamed or replaced repository shows up here instead of surprising you on the day you publish.",

    bindingTitle: "The repository of this node",
    repoLabel: "Repository",
    branchLabel: "Branch",
    commitLabel: "Last commit",
    stateOwn: "This is your repository. Changes go here.",
    stateUpstream:
      "This node was started from the Fractera repository, not from your own. It works, but you cannot write here: make your own copy on GitHub, point origin at it, and this card will change by itself.",
    stateNoGit:
      "There is no repository at all — that is how an installation on a dedicated server looks. The node works; changes simply have nowhere to go yet. Create a repository on GitHub and connect it when you are ready.",
    stateNoRemote: "There is a repository, but no address to push to: the code was copied without its origin.",
    stateForeignHost: "The repository lives outside GitHub. The node works with it; the checks below are about GitHub only.",

    keyTitle: "The key",
    keyLead: "A key is what lets the node read and write this repository. It is kept on this computer only, and it is never shown again — only its last four characters.",
    keySteps: [
      "Open GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.",
      "Choose «Only select repositories» and pick the repository of this node.",
      "Repository permissions: Contents — Read and write, Metadata — Read-only. Nothing else is needed.",
      "Pick an expiry you are willing to renew, generate the token and paste it here.",
    ],
    keyLabel: "GitHub token",
    keyHint: "starts with github_pat_ or ghp_",
    save: "Save and check",
    saving: "Asking GitHub…",
    saved: "Key saved · …{tail}",
    forget: "Forget the key",
    check: "Check access",
    checking: "Checking…",
    openTokens: "Open the token page",

    accessTitle: "What this key can do",
    accountLabel: "Account",
    visibleLabel: "Repository visible",
    writeLabel: "Write access",
    expiresLabel: "Key expires",
    yes: "yes",
    no: "no",
    never: "no expiry",
    unknown: "not known",
    writeOk: "The key can write: publishing will work.",
    writeDenied:
      "The key can read but not write. It looks healthy right now and will fail on the day you publish — widen its permissions to Contents: Read and write, or issue a new one.",
    expiresSoon: "The key expires soon — renew it before it stops working.",
    notChecked: "Not checked yet.",

    errors: {
      "empty-token": "Paste the token first.",
      "bad-format": "That does not look like a GitHub token: it starts with github_pat_ or ghp_.",
      "token-rejected": "GitHub does not recognise this key. It may be revoked or expired.",
      "github-unreachable": "GitHub did not answer. Check the internet on this computer.",
      "github-refused": "GitHub refused the request.",
      "repo-invisible": "GitHub answers «not found»: either the repository does not exist, or this key is not allowed to see it.",
      "no-token": "Save a key first.",
      network: "The node did not answer.",
    },
  },
  ru: {
    loading: "Спрашиваю узел…",
    forbidden: "Эту страницу видит только архитектор и только с этого компьютера или со своего домена.",
    intro:
      "Страница отвечает на один вопрос: с каким репозиторием работает этот узел прямо сейчас. Она спрашивает сам git, поэтому подменённый или переименованный репозиторий виден здесь, а не в день публикации.",

    bindingTitle: "Репозиторий этого узла",
    repoLabel: "Репозиторий",
    branchLabel: "Ветка",
    commitLabel: "Последний коммит",
    stateOwn: "Это ваш репозиторий. Изменения уезжают сюда.",
    stateUpstream:
      "Узел запущен из репозитория Fractera, а не из вашего. Он работает, но писать сюда вы не можете: сделайте свою копию на GitHub, переключите на неё origin — и эта карточка сменится сама.",
    stateNoGit:
      "Репозитория нет вовсе — так выглядит установка на выделенный сервер. Узел работает, изменениям просто некуда уезжать. Заведите репозиторий на GitHub и подключите его, когда будете готовы.",
    stateNoRemote: "Репозиторий есть, но адреса для отправки нет: код скопировали без origin.",
    stateForeignHost: "Репозиторий живёт не на GitHub. Узел с ним работает; проверки ниже — только про GitHub.",

    keyTitle: "Ключ",
    keyLead: "Ключ — это то, чем узел читает и пишет этот репозиторий. Он хранится только на этом компьютере и больше не показывается — видны лишь четыре последних знака.",
    keySteps: [
      "Откройте GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens.",
      "Выберите «Only select repositories» и укажите репозиторий этого узла.",
      "Права репозитория: Contents — Read and write, Metadata — Read-only. Больше ничего не нужно.",
      "Выберите срок, который готовы продлевать, создайте токен и вставьте его сюда.",
    ],
    keyLabel: "Токен GitHub",
    keyHint: "начинается с github_pat_ или ghp_",
    save: "Сохранить и проверить",
    saving: "Спрашиваю GitHub…",
    saved: "Ключ сохранён · …{tail}",
    forget: "Забыть ключ",
    check: "Проверить доступ",
    checking: "Проверяю…",
    openTokens: "Открыть страницу токенов",

    accessTitle: "Что умеет этот ключ",
    accountLabel: "Аккаунт",
    visibleLabel: "Репозиторий виден",
    writeLabel: "Право записи",
    expiresLabel: "Срок ключа",
    yes: "да",
    no: "нет",
    never: "без срока",
    unknown: "неизвестно",
    writeOk: "Ключ умеет писать: публикация пройдёт.",
    writeDenied:
      "Ключ умеет читать, но не писать. Сейчас он выглядит исправным и откажет в день публикации — расширьте права до Contents: Read and write или выпустите новый.",
    expiresSoon: "Срок ключа подходит к концу — продлите его до того, как он перестанет работать.",
    notChecked: "Ещё не проверяли.",

    errors: {
      "empty-token": "Сначала вставьте токен.",
      "bad-format": "Это не похоже на токен GitHub: он начинается с github_pat_ или ghp_.",
      "token-rejected": "GitHub не узнаёт этот ключ. Возможно, он отозван или истёк.",
      "github-unreachable": "GitHub не ответил. Проверьте интернет на этом компьютере.",
      "github-refused": "GitHub отклонил запрос.",
      "repo-invisible": "GitHub отвечает «не найдено»: либо репозитория нет, либо этому ключу его не видно.",
      "no-token": "Сначала сохраните ключ.",
      network: "Узел не ответил.",
    },
  },
}

export function githubWords(lang: string): GithubWords {
  return DICT[lang] ?? DICT.en
}
