// ВХОД КОПИИ КОМПЛЕКТА ДЛЯ УЗЛА (271).
//
// 🔒 ОБЩЕЕ ПОДКЛЮЧЕНИЕ УЗЛА (`lib/agent-kit/mount.cjs`) НАХОДИТ ЭТОТ ФАЙЛ В `architect/<служба>/_agent-kit/server/`
// САМО, обходом папок при старте, и получает отсюда ровно две вещи: принять сокет терминала службы и начать
// читать её бота, пока терминал выключен. Удалили папку службы — после перезапуска узла её здесь нет.

const { onConnection } = require('./bridge.cjs')
const { startIdlePoller } = require('./telegram.cjs')

module.exports = { onConnection, startIdlePoller }
