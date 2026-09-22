// СОСТОЯНИЕ ПОДПИСКИ CLAUDE CODE НА ЭТОЙ МАШИНЕ (267-2, перенос `fractera-memory-starter/lib/fractera/claude-cli.mjs`).
//
// 🔒 СПРАШИВАЕМ ПОЛЕ, А НЕ КОД ВОЗВРАТА — И ЭТО ИЗМЕРЕНО ЗАНОВО, А НЕ ПЕРЕНЕСЕНО. В памяти написано, что
// `claude auth status` отдаёт 0 и вошедшему, и невошедшему. На Windows 2026-09-22 (CLI 2.1.278) измерено
// иначе: вошедший — код 0, невошедший (пустой `CLAUDE_CONFIG_DIR`) — код **1**, но JSON печатается в обоих
// случаях. Поэтому JSON читается при любом коде, а решает поле `loggedIn`.
//
// 🔒 `null` — «спросить не удалось», и это НЕ «не вошёл»: разница решает, покажем мы вход или ложное
// «подключено».
//
// 🔒 ПУТЬ К CLI — ПРОСТО `claude`: на Windows `which` нет, а libuv сам дописывает `.exe` при поиске в PATH
// (измерено: `spawnSync('claude', …)` без оболочки находит `C:\Users\…\.local\bin\claude.exe`).
// `CLAUDE_BIN` — для машины, где CLI стоит вне PATH.

const { spawnSync } = require('node:child_process')

function claudeBin() {
  return process.env.CLAUDE_BIN || 'claude'
}

/** @returns {{ loggedIn: boolean | null, method: string | null, email: string | null, plan: string | null }} */
function claudeAuthState() {
  try {
    const out = spawnSync(claudeBin(), ['auth', 'status'], { encoding: 'utf8', timeout: 15_000, windowsHide: true })
    if (!out.stdout) return { loggedIn: null, method: null, email: null, plan: null }
    const p = JSON.parse(out.stdout)
    return {
      loggedIn: typeof p.loggedIn === 'boolean' ? p.loggedIn : null,
      method: typeof p.authMethod === 'string' ? p.authMethod : null,
      email: typeof p.email === 'string' ? p.email : null,
      plan: typeof p.subscriptionType === 'string' ? p.subscriptionType : null,
    }
  } catch {
    return { loggedIn: null, method: null, email: null, plan: null }
  }
}

module.exports = { claudeBin, claudeAuthState }
