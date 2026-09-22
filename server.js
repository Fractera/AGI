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
const { pickPort, writeRuntime } = require('./lib/server-port.cjs')
const { attachTerminal } = require('./lib/terminal/bridge.cjs')
const { startIdlePoller } = require('./lib/channel/telegram.cjs')

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

const hostname = process.env.HOST || 'localhost'
// dev по умолчанию: локальная среда — это работа с исходником, а не продакшн.
// Сборка включается явно, переменной, когда для неё настанет время.
const dev = process.env.NODE_ENV !== 'production'

// Страница читает эту переменную через process.env — другого способа передать
// значение из server.js внутрь приложения Next нет: это два разных мира, и
// общее у них только окружение процесса.
process.env.AGI_COMMIT = readCommit()
process.env.AGI_STARTED_AT = new Date().toISOString()

// 🔒 Порт выбирается ДО того, как поднят Next: его конструктор получает номер
// один раз и потом о нём только рассказывает. Почему не 3000 и почему не
// 49152+ — в `lib/server-port.cjs`, там же и блок портов продукта.
async function main() {
  const { port, moved, asked } = await pickPort(hostname)

  // Next должен знать тот же номер: по нему он строит адреса в сообщениях об
  // ошибках и в горячей перезагрузке.
  process.env.PORT = String(port)

  const app = next({ dev, hostname, port, dir: __dirname })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Мост терминала (267-1): сокет `/pty` принимается здесь, до Next. Устройство и
  // оплаченные ловушки — в самом модуле.
  attachTerminal(server, app)
  // Пока терминал выключен, бота Telegram читает узел и отвечает сообщением о состоянии (267-3).
  startIdlePoller()

  server.listen(port, hostname, () => {
    // Номер порта уходит в файл — его читают сторож здоровья и команда
    // «статус». Они обязаны спрашивать сервер, а не повторять предположение.
    writeRuntime({
      port,
      hostname,
      pid: process.pid,
      commit: process.env.AGI_COMMIT,
      startedAt: process.env.AGI_STARTED_AT,
      mode: dev ? 'dev' : 'production',
    })

    console.log(
      `AGI server · http://${hostname}:${port} · commit ${process.env.AGI_COMMIT} · ${dev ? 'dev' : 'production'}`,
    )

    // Уступка порта — событие, о котором человек обязан узнать сразу. Молчание
    // здесь означает, что он открывает старый адрес, видит чужое приложение или
    // пустоту и считает, что сломались мы.
    if (moved) {
      console.log(
        `⚠ порт по умолчанию был занят — AGI встал на ${port}. Адрес: http://${hostname}:${port}`,
      )
    }
    if (asked) {
      console.log(`порт ${asked} задан переменной PORT`)
    }
  })
}

main().catch((error) => {
  // Отказ при старте печатается человеческими словами и уходит в журнал pm2 —
  // молчаливый выход с ненулевым кодом выглядит как «pm2 сломался».
  console.error(`AGI server не запустился: ${error.message}`)
  process.exit(1)
})
