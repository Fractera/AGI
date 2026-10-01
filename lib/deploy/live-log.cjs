// ЖИВОЙ ХОД РАЗВЁРТЫВАНИЯ И ПРЕДПРОСМОТРА (узел, шаг 353-3).
//
// Слово владельца 2026-10-01: «развёртывание … проходит полностью вслепую … нажал кнопку процесс нужно показывать сразу … контейнер
// который увеличивается максимум до 400 пикселей у которого внутри идут какие-то движения процессы». ✗ До 353 установщик и
// предпросмотр собирали вывод `spawnSync(..., pipe)` целиком и отдавали его только в конце: минуту сборки не было видно ничего.
//
// 🔒 ВЫВОД ИДЁТ ПРЯМО В ФАЙЛ, ПОКА ПРОЦЕСС РАБОТАЕТ: дочерний процесс получает дескриптор файла журнала вместо трубы, строки
// ложатся на диск сразу. Разбор результата прежний — тот же текст читается из файла после выхода (с отметки начала), поэтому
// вызывающий код не меняет ни одной проверки. Файл открывается на ДОПИСЫВАНИЕ всеми писателями: установщик внутри развёртывания
// пишет в тот же журнал, и позиция у каждого — конец файла, а не своя.
// Страница читает хвост дверью, пока процесс идёт (`tail`).

const { closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, writeFileSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const { dirname, join } = require('node:path')

/** Путь журнала хода: `logs/<kind>-<id>.log` (kind — deploy | preview). */
function logPath(root, kind, id) {
  return join(root, 'logs', `${kind}-${id}.log`)
}

/** Начать журнал заново (одна операция — один журнал). */
function startLog(path, header) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, header ? `${header}\n` : '')
}

/** spawnSync, чей stdout/stderr пишется в журнал по мере работы; `out` — то, что процесс написал за этот запуск. */
function runLive(cmd, args, options, path) {
  mkdirSync(dirname(path), { recursive: true })
  const start = existsSync(path) ? statSync(path).size : 0
  const fd = openSync(path, 'a')
  let r
  try {
    r = spawnSync(cmd, args, { ...options, stdio: ['ignore', fd, fd] })
  } finally {
    closeSync(fd)
  }
  let out = ''
  try { out = readFileSync(path).subarray(start).toString('utf8') } catch { /* журнал исчез — разбирать нечего */ }
  return { rc: r.status ?? 1, out }
}

/** Последние `n` строк журнала без управляющих последовательностей терминала; нет файла — пустой список. */
function tail(path, n = 80) {
  let text = ''
  try { text = readFileSync(path, 'utf8') } catch { return [] }
  // eslint-disable-next-line no-control-regex
  const lines = text.replace(/\u001b\[[0-9;?]*[A-Za-z]/g, '').split(/\r?\n|\r/).filter((l) => l.trim() !== '')
  return lines.slice(-n)
}

module.exports = { logPath, startLog, runLive, tail }
