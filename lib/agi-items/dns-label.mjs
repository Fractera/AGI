// ИМЯ, КОТОРОЕ МОЖЕТ СТАТЬ МЕТКОЙ ДОМЕНА (325-7). Слово владельца 2026-09-27: «чтобы валидатор не пропускал домены которые
// не соответствуют требованиям». Правила — из первоисточников, прочитанных целиком (rfc-editor.org):
//   RFC 1035 §2.3.1 — метка: буквы, цифры, дефис; первой — буква, последней — буква или цифра; не длиннее 63; регистр не значим.
//   RFC 1123 §2.1   — первой может быть и цифра (ослабление RFC 952).
//   RFC 5890 §2.3.1, RFC 5891 §4.2.3.1 — «--» на 3-4 местах зарезервировано (метки `xn--` — Punycode); дефис не в начале и
//                     не в конце.
//   RFC 1035 §2.3.4 — имя целиком не длиннее 255 октетов (считается там, где метка соединяется с зоной).
// Подчёркивание, точка, пробел, не-ASCII (кириллица и т. п.) в метке имени хоста не допускаются: IDN живёт только в виде
// `xn--…`, а его мы не принимаем вовсе.
//
// 🔒 `.mjs`: читают и сервер (`element-address.ts`), и прибор `scripts/check-dns-label.mjs`, запускаемый голым `node`.
// 🔒 ДВА УРОВНЯ: `isDnsLabel` — стандарт как он есть; `isElementAddress` — наша политика строже стандарта (первой только
// буква, «--» нигде, 4–24 знака, только строчные: имя хранится в одном регистре, иначе `Shop` и `shop` стали бы двумя).

const LDH = /^[a-z0-9-]+$/

/** Метка DNS по RFC 1035/1123/5891 (строчными). */
export function isDnsLabel(name) {
  if (typeof name !== 'string' || name.length < 1 || name.length > 63) return false
  if (!LDH.test(name)) return false
  if (name.startsWith('-') || name.endsWith('-')) return false
  if (name.length >= 4 && name[2] === '-' && name[3] === '-') return false
  return true
}

export const ADDRESS_MIN = 4
export const ADDRESS_MAX = 24

/** Адрес AGI элемента: метка DNS и политика узла. */
export function isElementAddress(name) {
  return isDnsLabel(name)
    && name.length >= ADDRESS_MIN && name.length <= ADDRESS_MAX
    && /^[a-z]/.test(name)
    && !name.includes('--')
}
