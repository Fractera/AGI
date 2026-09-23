// АДРЕС СЛУЖБЫ ВХОДА НА СВОЁМ ДОМЕНЕ ЧЕЛОВЕКА (259-8).
//
// ✗ ОПЛАЧЕНО 2026-09-21: владелец нажал «Войти» на `throughsongs.com` и попал
// на `http://127.0.0.1:24681/register` — адрес СВОЕЙ машины посетителя. Туннель
// вёл наружу только сайт; служба входа жила на петле и снаружи не существовала.
//
// 🔒 ЗНАНИЕ ОДНО, ЧИТАТЕЛЕЙ ТРИ, ПОЭТОМУ ОНО В .cjs: дверь активации домена
// (пишет окружение службы), установщик служб (переустановка обязана дать то же
// самое, иначе она молча вернёт петлю) и прокси узла (куда вести посетителя).
// Две копии формулы разошлись бы в первый же день правки.
//
// 🔒 ИМЯ ВХОДА СТРОИТСЯ ОТ ЗОНЫ, А НЕ ОТ ПОДКЛЮЧЁННОГО ИМЕНИ. Человек может
// подключить `site.example.com`; `auth.site.example.com` бесплатный сертификат
// Cloudflare не покрывает (он выдаётся на `example.com` и `*.example.com`), а
// `auth.example.com` покрывает. Cookie ставится на `.example.com` — его видят и
// сайт, и вход.
//
// Источник один — `logs/domain.json`, который пишет дверь активации. Нет файла —
// домена нет, и всё остаётся на петле: это законное состояние, а не отказ.

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

/**
 * `architectHost` (280-3) — поддомен ЯДРА, когда корень домена отдан сайту (элементу root).
 * `null` — корень ведёт на ядро, как до 280-3.
 * @returns {{ zone: string, siteHost: string, authHost: string, architectHost: string | null } | null}
 */
function publicAuth(root) {
  let d
  try {
    d = JSON.parse(readFileSync(join(root, 'logs', 'domain.json'), 'utf8'))
  } catch {
    return null
  }
  const zone = typeof d.zone === 'string' ? d.zone.trim().toLowerCase() : ''
  const siteHost = typeof d.hostname === 'string' ? d.hostname.trim().toLowerCase() : ''
  if (!zone || !siteHost || !d.authRouted) return null
  const architectHost = typeof d.architectHostname === 'string' && d.architectHostname.trim()
    ? d.architectHostname.trim().toLowerCase()
    : null
  return { zone, siteHost, authHost: `auth.${zone}`, architectHost }
}

/**
 * Значения окружения службы входа, которые домен ПЕРЕКРЫВАЕТ.
 * `null` — домена нет, и установщик пишет петлевые значения, как раньше.
 */
function authEnvOverrides(root, loopbackOrigins) {
  const p = publicAuth(root)
  if (!p) return null
  const origins = new Set([...(loopbackOrigins || []), `https://${p.siteHost}`, `https://${p.authHost}`])
  // 280-3: вход пускает и с поддомена ядра — страницы архитектора живут там.
  if (p.architectHost) origins.add(`https://${p.architectHost}`)
  return {
    // Для элемента root (280-3): куда браузер посетителя идёт входить и где страницы
    // архитектора. Только тем элементам, что объявили эти имена в своём примере.
    NEXT_PUBLIC_AUTH_URL: `https://${p.authHost}`,
    ...(p.architectHost ? { ARCHITECT_URL: `https://${p.architectHost}` } : {}),
    // ✗ ИЗМЕРЕНО 2026-09-21: без этой строки Auth.js отвечает 500 `UntrustedHost`
    // на каждый запрос, пришедший через туннель с именем `auth.<зона>`. Доверять
    // имени здесь безопасно: служба слушает только 127.0.0.1, и снаружи до неё
    // доходит лишь наш туннель, который имя и выставляет.
    AUTH_TRUST_HOST: 'true',
    NEXTAUTH_URL: `https://${p.authHost}`,
    COOKIE_DOMAIN: `.${p.zone}`,
    COOKIE_SECURE: 'true',
    ALLOWED_ORIGINS: [...origins].join(','),
  }
}

module.exports = { publicAuth, authEnvOverrides }
