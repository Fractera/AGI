// A2A STANDARD — PASSPORT FORM, CARD, PROJECTIONS (node step 406-3). Read `lib/a2a/STANDARD.md` first.
// Plain node module with no dependencies: the core, the installer and every element's guard load it as it is.

import { createHash } from 'node:crypto'

export const CARD_LIMIT = 1500
const KEYS = ['none', 'session', 'X-Data-Secret', 'X-Settings-Key', 'node-key']
const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE']
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v) => typeof v === 'string' && v.trim() !== ''

/** Problems of the `a2a` section of a passport; an empty list means the form is right. */
export function passportProblems(props) {
  const out = []
  const a = props?.a2a
  if (!isObj(a)) return ['no `a2a` section']
  if (a.version !== 1) out.push('a2a.version must be 1')
  if (!text(a.summary)) out.push('a2a.summary is empty')
  if (!['node', 'network'].includes(a.visibility)) out.push('a2a.visibility must be node or network')
  const caps = Array.isArray(a.capabilities) ? a.capabilities : []
  if (caps.length === 0) out.push('a2a.capabilities is empty')
  const names = new Set()
  caps.forEach((c, i) => {
    if (!text(c?.name) || !/^[a-z0-9][a-z0-9-]*$/.test(c.name)) out.push(`capabilities[${i}].name must be kebab-case`)
    else names.add(c.name)
    if (!text(c?.words)) out.push(`capabilities[${i}].words is empty`)
    if (!Array.isArray(c?.tags) || c.tags.length === 0) out.push(`capabilities[${i}].tags is empty`)
  })
  const doors = Array.isArray(a.doors) ? a.doors : []
  doors.forEach((d, i) => {
    const at = `doors[${i}] ${d?.method ?? ''} ${d?.path ?? ''}`.trim()
    if (!names.has(d?.capability)) out.push(`${at}: capability «${d?.capability}» is not declared`)
    if (!['http', 'mcp'].includes(d?.protocol)) out.push(`${at}: protocol must be http or mcp`)
    if (!text(d?.path)) out.push(`${at}: path is empty`)
    if (d?.protocol === 'http' && !/^(GET|POST|PUT|PATCH|DELETE)$/.test(d?.method ?? '')) out.push(`${at}: method`)
    if (!KEYS.includes(d?.key)) out.push(`${at}: key must be one of ${KEYS.join(', ')}`)
    if (!('output' in (d ?? {}))) out.push(`${at}: output example is missing`)
    if (WRITES.includes(d?.method) && !('input' in d)) out.push(`${at}: input example is missing for a writing door`)
    if (!Array.isArray(d?.callers) || d.callers.length === 0) out.push(`${at}: callers is empty (use ["*"])`)
  })
  if (Array.isArray(a.consumes)) a.consumes.forEach((c, i) => { if (!text(c?.capability) || !text(c?.why)) out.push(`consumes[${i}] needs capability and why`) })
  if (a.catalog !== null && a.catalog !== undefined) {
    if (!isObj(a.catalog) || !text(a.catalog.find) || !text(a.catalog.get)) out.push('a2a.catalog needs find and get (or null)')
  }
  if (a.private !== undefined && !Array.isArray(a.private)) out.push('a2a.private must be a list')
  return out
}

/** Stable fingerprint of the `a2a` section: changes exactly when the passport's promises change. */
export function fingerprintOf(props) {
  const sort = (v) => (Array.isArray(v) ? v.map(sort) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v)
  return createHash('sha256').update(JSON.stringify(sort(props?.a2a ?? null))).digest('hex').slice(0, 16)
}

/** Level-1 card derived from a passport. `passport` — where the full passport is fetched from. */
export function cardOf(props, { address, passport } = {}) {
  const a = props.a2a
  const tags = [...new Set((a.capabilities ?? []).flatMap((c) => [c.name, ...(c.tags ?? [])]))]
  return {
    address: address ?? props.id,
    kind: 'element',
    title: props.name ?? props.id,
    words: a.summary,
    tags,
    parent: null,
    hasChildren: Boolean(a.catalog),
    obtain: { how: 'call' },
    visibility: a.visibility,
    fingerprint: fingerprintOf(props),
    passport: passport ?? null,
  }
}

/** M2M projections — described only; nothing is sent anywhere. */
export function projectionsOf(props) {
  const a = props.a2a
  return {
    nostrTags: [...new Set((a.capabilities ?? []).flatMap((c) => [c.name, ...(c.tags ?? [])]))].map((t) => ['t', t]),
    lightragText: [a.summary, ...(a.capabilities ?? []).map((c) => `${c.name}: ${c.words}`)].join('\n'),
  }
}
