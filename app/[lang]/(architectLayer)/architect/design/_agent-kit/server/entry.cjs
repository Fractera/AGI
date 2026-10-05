// ВХОД КОПИИ КОМПЛЕКТА ДЛЯ УЗЛА (271).
//
// 🔒 ОБЩЕЕ ПОДКЛЮЧЕНИЕ УЗЛА (`lib/agent-kit/mount.cjs`) НАХОДИТ ЭТОТ ФАЙЛ В `architect/<служба>/_agent-kit/server/`
// САМО, обходом папок при старте, и получает отсюда три вещи: принять сокет терминала службы, начать читать её
// бота, пока терминал выключен, и разбудить агента без браузера (409-1, `wake`). Удалили папку службы — после
// перезапуска узла её здесь нет.

const { onConnection, wake } = require('./bridge.cjs')
const { startIdlePoller } = require('./telegram.cjs')

module.exports = { onConnection, startIdlePoller, wake }
