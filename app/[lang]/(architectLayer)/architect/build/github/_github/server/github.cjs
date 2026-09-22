// СПРАШИВАЕМ У САМОГО GITHUB, ЧТО УМЕЕТ ЭТОТ КЛЮЧ (273).
//
// 🎯 Слово владельца 2026-09-22: «ты должен проверить, что по данному ключу ты можешь осуществлять доступ…
// пользователь может выбрать ограничения действия ключа, и в этом случае когда-нибудь проблема с
// развёртыванием произойдёт». Именно поэтому здесь не «ключ сохранён», а три отдельных факта: кто вы ·
// виден ли репозиторий · **есть ли право записи**.
//
// 🔒 ПЕРВОИСТОЧНИК, А НЕ ПАМЯТЬ (проверено 2026-09-22):
//   · право записи — поле `permissions.push` ответа «Get a repository» (docs.github.com, REST repos:
//     «permissions: object · admin required · maintain · push required · triage · pull required»);
//   · срок жизни ключа — заголовок ответа `GitHub-Authentication-Token-Expiration` (github.blog,
//     changelog 2021-07-26: «you'll see a new response header… indicating the token's expiration date.
//     You can use this in scripts, for example to log a warning message as the expiration date approaches»).
// 🛑 ЗАГОЛОВКА МОЖЕТ НЕ БЫТЬ — у ключа без срока. Это «бессрочный», а не «неизвестно».
//
// 🛑 УЗКИЙ КЛЮЧ ВЫГЛЯДИТ РАБОЧИМ ДО ПЕРВОЙ ЗАПИСИ. Поэтому «доступ есть» здесь НИКОГДА не выводится из
// кода 200: пока `permissions.push` не true, страница говорит «читать может, писать — нет».
// 🔒 НИЧЕГО НЕ ПИШЕМ: только запросы на чтение. Коммит и пуш — отдельное решение человека.

const API = 'https://api.github.com'
const UA = 'fractera-agi-node'

async function call(token, url) {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': UA,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(15_000),
    })
    const body = await res.json().catch(() => null)
    return { status: res.status, body, expires: res.headers.get('github-authentication-token-expiration') }
  } catch {
    return { status: 0, body: null, expires: null }
  }
}

/**
 * Что умеет ключ по отношению к этому репозиторию.
 * @returns {Promise<{ ok: boolean, error?: string, login?: string|null, expires?: string|null,
 *   repo?: string|null, canRead?: boolean, canWrite?: boolean, visibility?: string|null }>}
 */
async function checkAccess(token, owner, repo) {
  const me = await call(token, `${API}/user`)
  if (me.status === 0) return { ok: false, error: 'github-unreachable' }
  if (me.status === 401) return { ok: false, error: 'token-rejected' }
  if (me.status !== 200 || !me.body?.login) return { ok: false, error: 'github-refused' }

  const answer = {
    ok: true,
    login: me.body.login,
    // Заголовка нет — у ключа нет срока. Это факт, а не пробел.
    expires: me.expires ?? null,
    repo: owner && repo ? `${owner}/${repo}` : null,
    canRead: null,
    canWrite: null,
    visibility: null,
  }
  if (!owner || !repo) return answer

  const r = await call(token, `${API}/repos/${owner}/${repo}`)
  if (r.status === 404) {
    // 🛑 404 У GITHUB ЗНАЧИТ ДВЕ РАЗНЫЕ ВЕЩИ: репозитория нет ИЛИ ключу его не видно. Различить снаружи
    // нельзя, и выдумывать одну из версий нельзя тоже — страница называет обе.
    return { ...answer, canRead: false, canWrite: false, error: 'repo-invisible' }
  }
  if (r.status !== 200 || !r.body) return { ...answer, canRead: false, canWrite: false, error: 'github-refused' }
  return {
    ...answer,
    canRead: true,
    canWrite: r.body.permissions?.push === true,
    visibility: r.body.private ? 'private' : 'public',
    expires: r.expires ?? answer.expires,
  }
}

module.exports = { checkAccess }
