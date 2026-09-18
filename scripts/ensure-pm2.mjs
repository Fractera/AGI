// ЕСТЬ ЛИ pm2 НА ЭТОЙ МАШИНЕ — И ЕСЛИ НЕТ, ПОСТАВИТЬ ЕГО.
//
// 🔒 Рамка линии: человек, ставящий AGI, не знает, что такое VS Code, и тем
// более — что такое pm2. Он не должен ни ставить его руками, ни читать о нём.
// Поэтому установка живёт в коде проекта, а не в инструкции для человека.
//
// 🔒 ИЗМЕРЕНО 2026-09-18, И ЭТО ГЛАВНОЕ ЗНАНИЕ ЭТОГО ФАЙЛА. На Windows node
// ОТКАЗЫВАЕТСЯ запускать `.cmd` и `.bat` без оболочки: `spawnSync('npm.cmd', …,
// { shell: false })` падает с `EINVAL`, ничего не написав ни в stdout, ни в
// stderr. Это не наша ошибка и не поломка npm — это запрет, введённый в node
// после CVE-2024-27980 (действует с 20.12 и 22.x). На macOS и Linux запускается
// обычный исполняемый файл, и оболочка там не нужна вовсе.
//
// Отсюда две строки ниже: оболочка включается ТОЛЬКО на Windows и только для
// этих двух команд, у которых все аргументы — наши собственные константы
// (`install -g pm2`, `-v`). Ни одного значения, пришедшего снаружи, в них не
// попадает, поэтому разбора кавычек оболочкой здесь бояться нечего.

import { spawnSync } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npm = isWindows ? 'npm.cmd' : 'npm'
const pm2 = isWindows ? 'pm2.cmd' : 'pm2'

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', shell: isWindows })
}

// 🔒 Причину отказа печатаем ВСЕГДА и из всех трёх мест. ✗ оплачено получасом в
// этом же подшаге: скрипт показал «причина неизвестна» ровно потому, что читал
// stdout и stderr, а настоящая ошибка (EINVAL) лежала в поле `error` и в вывод
// не попадала. Отказ, о котором нечего сказать, — самый дорогой род отказа.
function explain(result) {
  return (
    (result.error && `${result.error.code || 'ошибка'}: ${result.error.message}`) ||
    result.stderr?.trim() ||
    result.stdout?.trim() ||
    'причина неизвестна'
  )
}

function installedVersion() {
  const probe = run(pm2, ['-v'])
  // `error` — файла нет вовсе; ненулевой код — он есть, но сломан. Оба случая
  // означают одно: пригодного pm2 на машине нет.
  if (probe.error || probe.status !== 0) return null
  // Первый запуск pm2 поднимает свой демон и печатает перед версией баннер —
  // поэтому версия берётся последней непустой строкой, а не всем выводом.
  const lines = probe.stdout.trim().split(/\r?\n/).filter(Boolean)
  return lines[lines.length - 1]?.trim() || null
}

const before = installedVersion()

if (before) {
  console.log(`pm2 уже установлен: версия ${before}`)
  process.exit(0)
}

console.log('pm2 не найден — ставлю глобально (npm i -g pm2)…')
const install = run(npm, ['install', '-g', 'pm2'])

if (install.status !== 0) {
  console.error(explain(install))
  // 🛑 Останавливаемся с ненулевым кодом, а не «идём дальше без pm2». Установка,
  // которая молча не состоялась, даёт сервер без живучести — и человек узнает об
  // этом только следующей перезагрузкой, то есть позже всего.
  console.error(
    '\nНе удалось поставить pm2. Чаще всего причина — права на глобальную папку npm.\n' +
      'Сайт можно поднять и без него: npm run dev — но он не переживёт перезагрузку.',
  )
  process.exit(1)
}

const after = installedVersion()

if (!after) {
  console.error('npm отчитался об успехе, но pm2 всё ещё не запускается — установка не состоялась.')
  console.error(explain(run(pm2, ['-v'])))
  process.exit(1)
}

console.log(`pm2 установлен: версия ${after}`)
