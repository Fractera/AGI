// СВОЙ СЕРВЕР AGI.
//
// Почему он есть, хотя Next умеет запускаться сам: `next dev` и `next start` —
// чужие команды, внутрь которых нам не попасть. Всё, что будет дальше в этом
// проекте, живёт до и вокруг отдачи страницы: выбрать свободный порт, назвать
// себя, пережить закрытие терминала, честно остановиться. Этому нужен НАШ файл.
// Такой же формы, как наши микрослужбы на сервере: один server.js, запускаемый
// node, без сборки и без обёрток.

const { createServer } = require('node:http')
const { execFileSync } = require('node:child_process')
const next = require('next')

// ── Хэш коммита. Он нужен не для красоты: без него нельзя отличить «сайт
// работает» от «работает ИМЕННО та сборка, которую я только что поставил».
// Читается ОДИН раз при старте — процесс не переживает смену коммита, а значит
// и хэш внутри него меняться не может.
//
// `.git` может не быть вовсе: человек скачал zip, или установщик клонировал
// с `--depth 1` и выбросил историю. Это не отказ — это «неизвестно», и так и
// должно быть написано на странице.
function readCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'unknown'
  }
}

const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || 'localhost'
// dev по умолчанию: локальная среда — это работа с исходником, а не продакшн.
// Сборка включается явно, переменной, когда для неё настанет время.
const dev = process.env.NODE_ENV !== 'production'

// Страница читает эту переменную через process.env — другого способа передать
// значение из server.js внутрь приложения Next нет: это два разных мира, и
// общее у них только окружение процесса.
process.env.AGI_COMMIT = readCommit()
process.env.AGI_STARTED_AT = new Date().toISOString()

const app = next({ dev, hostname, port, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(port, hostname, () => {
    console.log(`AGI server · http://${hostname}:${port} · commit ${process.env.AGI_COMMIT} · ${dev ? 'dev' : 'production'}`)
  })
})
