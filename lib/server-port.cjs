// ПОРТ AGI — ОДНО МЕСТО, ГДЕ ОН ВЫБИРАЕТСЯ, И ОДИН ФАЙЛ, ГДЕ ОН ОБЪЯВЛЕН.
//
// ── Почему не 3000. Решение владельца 2026-09-18. Порт 3000 — самый занятый
// порт в мире разработки: Next, React, Rails, добрая половина учебных проектов.
// Отобрать занятый порт нельзя — кто встал первым, тот и держит; но мы встаём
// ПЕРВЫМИ, автозапуском при включении компьютера, ещё до того, как человек сел
// работать. Значит на 3000 ломались бы не мы, а его собственные проекты — с
// невнятной ошибкой, которую он никогда не свяжет с установкой AGI.
//
// ── Почему не 50505 и вообще не 49152+. Измерено 2026-09-18:
// `netsh int ipv4 show dynamicport tcp` → Start 49152, Number 16384. Весь
// диапазон 49152–65535 операционная система раздаёт ИСХОДЯЩИМ соединениям
// (Windows и macOS; Linux берёт 32768–60999). Постоянный слушатель там однажды
// не поднимется, потому что его номер занят чьим-то временным соединением, —
// редко, невоспроизводимо и дорого в поиске.
//
// ── Отсюда блок 24680–24699. Зона 1024–32767 свободна от эфемерных диапазонов
// ВСЕХ трёх систем, а этот участок внутри неё не занят ничьим умолчанием.
// Двадцати портов хватает продукту с запасом: порт нужен не на субдомен и не на
// страницу, а на ЗАПУЩЕННУЮ СЛУЖБУ — снаружи субдомены разводит один прокси.

const net = require('node:net')
const fs = require('node:fs')
const path = require('node:path')

const PORT_BLOCK_START = 24680
const PORT_BLOCK_END = 24699

// Куда сервер кладёт номер порта, на котором в итоге встал. Файл нужен не
// человеку, а нашим же программам: сторож здоровья и команда «статус» обязаны
// спрашивать САМ СЕРВЕР, а не повторять предположение о порте. Предположение
// разойдётся с правдой ровно в тот день, когда порт уступили.
const RUNTIME_FILE = path.join(__dirname, '..', 'logs', 'runtime.json')

// Свободен ли порт. Спрашиваем единственным честным способом — пробуем встать.
// `exclusive: true` отключает поблажку, с которой две программы могут слушать
// один порт на разных стеках и обе считать себя единственными.
function isFree(port, hostname) {
  return new Promise((resolve) => {
    const probe = net.createServer()
    probe.once('error', () => resolve(false))
    probe.once('listening', () => probe.close(() => resolve(true)))
    probe.listen({ port, host: hostname, exclusive: true })
  })
}

// 🔒 ПОРЯДОК ВЫБОРА, И В НЁМ ЕСТЬ ОДНА ЖЁСТКОСТЬ. Явный PORT из окружения —
// приказ человека: он либо исполняется, либо служба честно не встаёт. Уступать
// с него молча нельзя: человек, назвавший порт, ждёт сайт ИМЕННО там — чаще
// всего потому, что на него смотрит прокси или проброс из контейнера.
async function pickPort(hostname) {
  const asked = Number(process.env.PORT)

  if (Number.isInteger(asked) && asked > 0) {
    if (await isFree(asked, hostname)) return { port: asked, moved: false, asked }
    const error = new Error(
      `Порт ${asked} задан переменной PORT, но занят. Освободите его или уберите PORT — ` +
        `тогда AGI сам выберет свободный из ${PORT_BLOCK_START}–${PORT_BLOCK_END}.`,
    )
    error.code = 'PORT_BUSY'
    throw error
  }

  for (let port = PORT_BLOCK_START; port <= PORT_BLOCK_END; port += 1) {
    if (await isFree(port, hostname)) {
      return { port, moved: port !== PORT_BLOCK_START, asked: null }
    }
  }

  const error = new Error(
    `Свободного порта нет во всём блоке ${PORT_BLOCK_START}–${PORT_BLOCK_END} — занято двадцать штук подряд. ` +
      'Похоже, запущено много копий AGI: остановите лишние (npm run serve:stop).',
  )
  error.code = 'PORT_BLOCK_FULL'
  throw error
}

function writeRuntime(data) {
  try {
    fs.mkdirSync(path.dirname(RUNTIME_FILE), { recursive: true })
    fs.writeFileSync(RUNTIME_FILE, JSON.stringify(data, null, 2))
  } catch {
    // Не встал файл — это неприятно, но не повод не отдавать страницы. Сторож
    // тогда возьмёт порт по умолчанию и скажет об этом вслух.
  }
}

function readRuntime() {
  try {
    return JSON.parse(fs.readFileSync(RUNTIME_FILE, 'utf8'))
  } catch {
    return null
  }
}

module.exports = {
  PORT_BLOCK_START,
  PORT_BLOCK_END,
  RUNTIME_FILE,
  isFree,
  pickPort,
  writeRuntime,
  readRuntime,
}
