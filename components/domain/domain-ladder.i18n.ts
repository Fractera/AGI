// СЛОВА ЛЕСТНИЦЫ ПОДКЛЮЧЕНИЯ ДОМЕНА — рядом с самой лестницей (259-1).
//
// 🔒 ПОЧЕМУ СЛОВА ЗДЕСЬ, А НЕ В `_data` СТРАНИЦЫ. `_data` несёт слова СТРАНИЦЫ —
// заголовок, вступление и темы; её тип этого и не позволяет расширить без правки
// общего договора коллекции. Лестница — переиспользуемая часть: тот же экран
// понадобится там, где домен подключают повторно. Приём тот же, что у слов
// cookie-баннера: они лежат рядом с баннером, а не в общем словаре.
//
// 🔒 МОДУЛЬ СЕРВЕРНЫЙ. Островок получает уже выбранный язык пропсами — сторож
// `check-lang-delivery` следит, чтобы словарь не уехал в браузер целиком.

export type DomainLadderWords = {
  lead: string
  step1Title: string
  step1Text: string
  step2Title: string
  step2Text: string
  step3Title: string
  step3Text: string
  step4Title: string
  step4Text: string
  step5Title: string
  step5Text: string
  done: string
  next: string
  locked4: string
  locked5: string
  keyConfigured: string
  nodeAddress: string
  quickAddress: string
  loading: string
  soon: string
}

const W: Record<string, DomainLadderWords> = {
  en: {
    lead: "Five steps. The first three happen outside this computer — only you can do them. The rest the node does itself.",
    step1Title: "A domain of your own",
    step1Text: "Register a domain at any registrar, or take one you already own. This is the only part that costs money.",
    step2Title: "Add the domain to Cloudflare",
    step2Text: "In the Cloudflare dashboard: Onboard a domain → enter the apex domain (example.com) → select a plan. Cloudflare will show you two nameservers.",
    step3Title: "Change the nameservers at the registrar",
    step3Text: "Enter those two nameservers in your registrar's panel, replacing the current ones. Until this is done nothing further works, and this is the step that takes the longest — Cloudflare has to see the change.",
    step4Title: "Give the node a Cloudflare key",
    step4Text: "Create an API token in Cloudflare with permission to edit DNS and tunnels, and paste it here. The node keeps it to itself and never shows it again.",
    step5Title: "The node does the rest",
    step5Text: "It creates a tunnel, writes the DNS record and points your domain at this computer. Nothing to install by hand.",
    done: "done",
    next: "I have done this",
    locked4: "The key field appears here once you have changed the nameservers.",
    locked5: "This opens once the node has a working key.",
    keyConfigured: "Key is configured",
    nodeAddress: "Node address",
    quickAddress: "Temporary address in use",
    loading: "Reading the node state…",
    soon: "Built in the next sub-step.",
  },
  ru: {
    lead: "Пять шагов. Первые три происходят вне этого компьютера — их можете сделать только вы. Остальное узел делает сам.",
    step1Title: "Собственный домен",
    step1Text: "Зарегистрируйте домен у любого регистратора или возьмите тот, что уже есть. Это единственная часть, которая стоит денег.",
    step2Title: "Заведите домен в Cloudflare",
    step2Text: "В панели Cloudflare: Onboard a domain → введите корневой домен (example.com) → выберите план. Cloudflare покажет два своих сервера имён.",
    step3Title: "Смените серверы имён у регистратора",
    step3Text: "Впишите эти два сервера имён в панели своего регистратора вместо нынешних. Пока это не сделано, дальше ничего не работает, и это самый долгий шаг — Cloudflare должен увидеть смену.",
    step4Title: "Выдайте узлу ключ Cloudflare",
    step4Text: "Создайте в Cloudflare токен API с правом править DNS и туннели и вставьте его здесь. Узел оставит его себе и больше никогда не покажет.",
    step5Title: "Остальное узел делает сам",
    step5Text: "Он создаст туннель, заведёт запись DNS и направит ваш домен на этот компьютер. Руками ставить нечего.",
    done: "сделано",
    next: "Я это сделал",
    locked4: "Поле для ключа появится здесь, когда вы смените серверы имён.",
    locked5: "Откроется, когда у узла будет рабочий ключ.",
    keyConfigured: "Ключ настроен",
    nodeAddress: "Адрес узла",
    quickAddress: "Сейчас работает временный адрес",
    loading: "Читаю состояние узла…",
    soon: "Строится в следующем подшаге.",
  },
}

export function domainLadderWords(lang: string): DomainLadderWords {
  return W[lang] ?? W[lang.slice(0, 2)] ?? W.en
}
