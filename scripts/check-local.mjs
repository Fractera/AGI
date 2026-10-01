// УЗЕЛ СТАВИТСЯ ТОЛЬКО НА КОМПЬЮТЕР ЧЕЛОВЕКА И ТОЛЬКО ОДИН (шаг 369). Запуск: `preinstall`, первым в `prebuild`, в `serve:start`.
//
// 1. НЕ В ОБЛАЧНОЙ СЕССИИ. ✗ Оплачено 2026-10-01: «запусти это» в облачной сессии Claude Code поставило узел во временную машину
// Anthropic, которая исчезает с концом сессии. Владелец: «Мне надо, чтобы у меня при подобном запуске всегда была реальная установка».
// 🔒 ПРИЗНАК — ДОКУМЕНТИРОВАННЫЙ (code.claude.com/docs/en/env-vars): «CLAUDE_CODE_REMOTE — Set automatically to `true` when Claude
// Code is running as a cloud session … to detect whether you are in a cloud session». README говорит то же агенту ДО клонирования.
// ✓ Доказано живым облачным сеансом 2026-10-01 (новый аккаунт): агент остановился на шаге 0 README.
//
// 2. ОДИН УЗЕЛ НА КОМПЬЮТЕР (решение владельца 2026-10-01: «да, запрещай»). Вторая копия сталкивается с первой по устройству: имена
// процессов pm2 одинаковы (`fractera-agi`, `fractera-svc-auth`…), а pm2 у пользователя один — пересборки, развёртывания и переезды
// второй копии управляли бы процессами первой; автозапуск один (`pm2 resurrect`); блок портов 24680–24699 общий. Новые проекты —
// AGI ITEM внутри одного узла. Признак: процесс `fractera-agi` из ДРУГОЙ папки в работающем pm2 или в его сохранённом снимке
// (`dump.pm2` — из него поднимает автозапуск, то есть узел установлен, даже если сейчас остановлен). Папки того узла уже нет —
// запись устарела, отказа нет.

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

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

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'))
const IS_WIN = process.platform === 'win32'
const same = (a, b) => (IS_WIN ? resolve(a).toLowerCase() === resolve(b).toLowerCase() : resolve(a) === resolve(b))

/** Папки, за которыми pm2 числит процесс `fractera-agi`: работающий pm2 и его сохранённый снимок. */
function nodeFolders() {
  const found = new Set()
  const take = (list) => {
    if (!Array.isArray(list)) return
    for (const p of list) {
      const env = p?.pm2_env ?? p
      if ((p?.name ?? env?.name) !== 'fractera-agi') continue
      const cwd = env?.pm_cwd ?? env?.cwd
      if (typeof cwd === 'string' && cwd) found.add(cwd)
    }
  }
  const live = spawnSync(IS_WIN ? 'pm2.cmd' : 'pm2', ['jlist'], { encoding: 'utf8', shell: IS_WIN, windowsHide: true, timeout: 20_000 })
  if (live.status === 0) { try { take(JSON.parse(live.stdout.slice(live.stdout.indexOf('[')))) } catch { /* вывод не JSON — смотрим снимок */ } }
  const home = process.env.PM2_HOME || join(homedir(), '.pm2')
  try { take(JSON.parse(readFileSync(join(home, 'dump.pm2'), 'utf8'))) } catch { /* снимка нет — pm2 здесь ещё не сохранял */ }
  return [...found]
}

const other = nodeFolders().find((dir) => !same(dir, root) && existsSync(join(dir, 'package.json')))
if (other) {
  console.error('')
  console.error(`На этом компьютере уже установлен узел Fractera: ${other}`)
  console.error('Один компьютер — один узел. Вторая копия не нужна: внутри одного узла живёт много сайтов и приложений — AGI ITEM.')
  console.error('Новый проект создаётся там кнопкой «Создать AGI ITEM» в слое архитектора.')
  console.error('Если тот узел больше не нужен, остановите и удалите его процессы (в его папке: npm run serve:stop, затем pm2 delete all и')
  console.error('pm2 save) и повторите установку здесь.')
  console.error('A Fractera node is already installed on this computer — one computer, one node. New projects are AGI ITEMS inside it.')
  console.error(`===NODE_EXISTS=== ${other}`)
  process.exit(1)
}
