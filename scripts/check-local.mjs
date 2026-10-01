// УЗЕЛ СТАВИТСЯ ТОЛЬКО НА КОМПЬЮТЕР ЧЕЛОВЕКА, НЕ В ОБЛАЧНУЮ СЕССИЮ (шаг 369). Запуск: `preinstall`, первым в `prebuild`, в `serve:start`.
//
// ✗ Оплачено 2026-10-01: владелец запустил «запусти это» в облачной сессии Claude Code — агент честно поставил узел во временную
// машину Anthropic, которая исчезает с концом сессии: долгое ожидание и лимит подписки впустую. Владелец: «Мне надо, чтобы у меня при
// подобном запуске всегда была реальная установка».
// 🔒 ПРИЗНАК — ДОКУМЕНТИРОВАННЫЙ (code.claude.com/docs/en/env-vars): «CLAUDE_CODE_REMOTE — Set automatically to `true` when Claude
// Code is running as a cloud session … to detect whether you are in a cloud session». Недокументированные признаки не читаются.
// README говорит то же агенту ДО клонирования; этот файл ловит агента, который README не прочёл.

if (String(process.env.CLAUDE_CODE_REMOTE ?? '').toLowerCase() === 'true') {
  console.error('')
  console.error('Fractera нельзя установить в облачной сессии Claude Code: эта машина временная и исчезнет вместе с сессией.')
  console.error('Узел ставится только на ваш компьютер. Откройте Claude Desktop → вкладка Code → выберите Local и папку на этом')
  console.error('компьютере, либо запустите `claude` в терминале в пустой папке, вставьте ссылку на ваш форк и напишите «запусти это».')
  console.error('Fractera cannot be installed in a Claude Code cloud session: this machine is temporary. Use Claude Desktop → Code →')
  console.error('Local, or `claude` in a terminal on your own computer.')
  console.error('===CLOUD_REFUSED=== cloud session (CLAUDE_CODE_REMOTE=true)')
  process.exit(1)
}
