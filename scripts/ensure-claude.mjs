// ЕСТЬ ЛИ НА МАШИНЕ CLAUDE CODE CLI (`claude`) — И ЕСЛИ НЕТ, ПОСТАВИТЬ ЕГО (шаг 371-2). Запуск: `preinstall`, после проверок.
//
// 🔒 РЕШЕНИЕ ВЛАДЕЛЬЦА 2026-10-02, дословно: «1, ставь CLI автоматически» и «пользователь может запустить установку через
// Codex например поэтому ты закрываешь уязвимость». И раньше: «Я бы не хотел просто доверять агенту который может устать
// или забыть» — поэтому это код установки, а не строка README.
//
// 🔒 ЗАЧЕМ. Терминалы агентов на пульте (агент элемента, бот Telegram, вход в подписку) запускают ФАЙЛ `claude`
// (`_agent-kit/server/claude-cli.cjs` → `resolveBin`). Claude Desktop его не ставит — первоисточник
// code.claude.com/docs/en/desktop-quickstart: «The desktop app includes Claude Code, so you don't need to install Node.js or
// the CLI to use the Code tab» и «Want `claude` in your terminal: install the CLI separately». Узел, поставленный из Desktop
// или из Codex, без этого файла работал бы, а все терминалы отвечали бы «claude не найден».
//
// 🔒 КОМАНДЫ — ИЗ ПЕРВОИСТОЧНИКА (code.claude.com/docs/en/setup):
//   macOS, Linux:  `curl -fsSL https://claude.ai/install.sh | bash` («Native Install (Recommended)») → `~/.local/bin/claude`;
//   Windows:       `npm install -g @anthropic-ai/claude-code` («Install with npm»: «installs the same native binary as the
//                  standalone installer»; узлу нужен Node 22 — то же требование, что у пакета).
// 🛑 НА WINDOWS — НЕ `irm https://claude.ai/install.ps1 | iex`. ✗ Измерено 2026-10-02 на машине владельца: Windows Defender
// принял запуск `powershell -ExecutionPolicy Bypass -Command "… irm … | iex"` из node за **Trojan:Win32/Commando.A!ml** и
// заблокировал процесс (а затем и node с этой строкой в аргументах — EPERM). Узел, поднимающий тревогу антивируса при
// установке, непригоден, как бы верно он ни работал. Путь npm — тот же, которым `ensure-pm2.mjs` ставит pm2.
//
// 🔒 ПОИСК — ТОТ ЖЕ, ЧТО У ПУЛЬТА (`resolveBin`): `~/.local/bin`, `~/.bun/bin`, затем PATH. Своя копия поиска разошлась бы
// с той, что потом запускает терминал, и установка «нашла бы» файл, которого пульт не видит.
//
// 🛑 НЕ ВАЛИТ УСТАНОВКУ. Не вышло (нет сети, нет curl, песочница Codex без интернета) — `===CLAUDE_CLI_FAILED===` с причиной
// и командой для человека; узел ставится дальше, без терминалов агентов. Сайт и пульт от CLI не зависят.

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { resolveBin } = require('../app/[lang]/(architectLayer)/architect/[item]/_agent-kit/server/claude-cli.cjs')

const isWindows = process.platform === 'win32'
const npm = isWindows ? 'npm.cmd' : 'npm'
const MANUAL = isWindows ? 'npm install -g @anthropic-ai/claude-code' : 'curl -fsSL https://claude.ai/install.sh | bash'

// shell только на Windows и только для `.cmd` (node не запускает их без оболочки — EINVAL после CVE-2024-27980);
// все аргументы — наши константы.
function run(command, args, extra = {}) {
  const shell = isWindows && /\.cmd$/i.test(command)
  // 🛑 Имя `.cmd` — БЕЗ кавычек: `"npm.cmd"` в cmd ломает `%~dp0`, и npm ищет себя в папке проекта
  // (измерено: «Cannot find module …\agi-code\node_modules\npm\bin\npm-cli.js»). Путь из `resolveBin` с пробелами — кавычки нужны.
  const cmd = shell && /\s/.test(command) ? `"${command}"` : command
  return spawnSync(cmd, args, { encoding: 'utf8', windowsHide: true, shell, ...extra })
}

function version(bin) {
  const r = run(bin, ['--version'], { timeout: 30_000 })
  return r.status === 0 ? String(r.stdout).trim() : null
}

// Каталог глобальных команд npm (на Windows — сам prefix). Долгоживущий процесс мог получить PATH до установки node,
// поэтому каталог добавляется к поиску явно, как `~/.local/bin` у `resolveBin`.
function npmGlobalBin() {
  const r = run(npm, ['prefix', '-g'])
  const prefix = r.status === 0 ? String(r.stdout).trim() : ''
  if (!prefix) return null
  return isWindows ? prefix : path.join(prefix, 'bin')
}

function find() {
  const extra = npmGlobalBin()
  const pathValue = [process.env.PATH || process.env.Path || '', extra].filter(Boolean).join(path.delimiter)
  return resolveBin('claude', pathValue)
}

const found = find()
if (found) {
  console.log(`===CLAUDE_CLI_PRESENT=== ${found} ${version(found) ?? ''}`.trim())
  process.exit(0)
}

console.log('Claude Code CLI не найден — ставлю официальным способом Anthropic (терминалам агентов на пульте он нужен).')
console.log('Claude Code CLI not found — installing it the official Anthropic way.')

const r = isWindows
  ? run(npm, ['install', '-g', '@anthropic-ai/claude-code'], { stdio: 'inherit', timeout: 600_000 })
  : spawnSync('bash', ['-c', 'curl -fsSL https://claude.ai/install.sh | bash'], { encoding: 'utf8', stdio: 'inherit', timeout: 600_000 })

const after = find()
const v = after ? version(after) : null
if (after && v) {
  console.log(`===CLAUDE_CLI_INSTALLED=== ${after} ${v}`)
  console.log('Войти в подписку Claude можно на пульте узла, на странице «Подписка Claude Code» любого элемента.')
  process.exit(0)
}

const reason = r.error ? String(r.error.message) : `установщик завершился с кодом ${r.status}`
console.error(`===CLAUDE_CLI_FAILED=== ${reason}`)
console.error('Узел ставится дальше, но терминалы агентов на пульте не запустятся, пока не будет CLI. Поставьте его сами:')
console.error(`  ${MANUAL}`)
process.exit(0)
