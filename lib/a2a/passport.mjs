// A2A STANDARD OF THE NODE — Google A2A v1.0 AgentCard + the Fractera extension (node step 406-3). Read `STANDARD.md`.
// Field names follow `a2a.proto` in camelCase. Plain node module, no dependencies.

import { createHash } from 'node:crypto'

export const EXTENSION_URI = 'https://fractera.ai/a2a/ext/node/v1'
export const CARD_LIMIT = 1500
const KEYS = ['none', 'session', 'X-Data-Secret', 'X-Settings-Key', 'node-key']
const WRITES = ['POST', 'PUT', 'PATCH', 'DELETE']
const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v) => typeof v === 'string' && v.trim() !== ''
const list = (v) => Array.isArray(v) && v.length > 0 && v.every(text)

/** The Fractera extension params of a card, or null. */
export function extensionOf(card) {
  const ext = (card?.capabilities?.extensions ?? []).find((e) => e?.uri === EXTENSION_URI)
  return ext?.params ?? null
}

/** { problems, warnings } of `a2a.card`; problems empty = the card is right. */
export function passportProblems(props) {
  const problems = []
  const warnings = []
  const card = props?.a2a?.card
  if (!isObj(card)) return { problems: ['no `a2a.card` (A2A AgentCard)'], warnings }
  // AgentCard — required by a2a.proto
  for (const f of ['name', 'description', 'version']) if (!text(card[f])) problems.push(`card.${f} is required`)
  if (!isObj(card.capabilities)) problems.push('card.capabilities is required')
  if (!list(card.defaultInputModes)) problems.push('card.defaultInputModes is required (media types)')
  if (!list(card.defaultOutputModes)) problems.push('card.defaultOutputModes is required (media types)')
  if (!Array.isArray(card.skills) || card.skills.length === 0) problems.push('card.skills is required')
  if ('supportedInterfaces' in card) problems.push('card.supportedInterfaces is filled when served, not written in the passport')
  const ids = new Set()
  ;(card.skills ?? []).forEach((s, i) => {
    const at = `skills[${i}]`
    if (!text(s?.id) || !/^[a-z0-9][a-z0-9-]*$/.test(s.id)) problems.push(`${at}.id must be kebab-case`)
    else ids.add(s.id)
    if (!text(s?.name)) problems.push(`${at}.name is required`)
    if (!text(s?.description)) problems.push(`${at}.description is required`)
    if (!list(s?.tags)) problems.push(`${at}.tags is required`)
    if (s?.inputModes !== undefined && !list(s.inputModes)) problems.push(`${at}.inputModes must be media types`)
    if (s?.outputModes !== undefined && !list(s.outputModes)) problems.push(`${at}.outputModes must be media types`)
    if (s?.examples !== undefined && !list(s.examples)) problems.push(`${at}.examples must be strings`)
  })
  // Fractera extension
  const x = extensionOf(card)
  if (!x) { problems.push(`no extension ${EXTENSION_URI} in card.capabilities.extensions`); return { problems, warnings } }
  if (!['node', 'network'].includes(x.visibility)) problems.push('extension.visibility must be node or network')
  ;(x.doors ?? []).forEach((d, i) => {
    const at = `doors[${i}] ${d?.method ?? ''} ${d?.path ?? ''}`.trim()
    if (!ids.has(d?.skill)) problems.push(`${at}: skill «${d?.skill}» is not in card.skills`)
    if (!['http', 'mcp'].includes(d?.protocol)) problems.push(`${at}: protocol must be http or mcp`)
    if (!text(d?.path)) problems.push(`${at}: path is empty`)
    if (d?.protocol === 'http' && !/^(GET|POST|PUT|PATCH|DELETE)$/.test(d?.method ?? '')) problems.push(`${at}: method`)
    if (!KEYS.includes(d?.key)) problems.push(`${at}: key must be one of ${KEYS.join(', ')}`)
    if (!('output' in (d ?? {}))) problems.push(`${at}: output example is missing`)
    if (WRITES.includes(d?.method) && !('input' in d)) problems.push(`${at}: input example is missing for a writing door`)
    if (!Array.isArray(d?.callers) || d.callers.length === 0) problems.push(`${at}: callers is empty (use ["*"])`)
  })
  ;(x.consumes ?? []).forEach((c, i) => { if (!text(c?.skill) || !text(c?.why)) problems.push(`consumes[${i}] needs skill and why`) })
  // 412-7 (owner 2026-10-06: «какие внешние инструменты интегрированы, например … exa.ai … его API … крон»): the element's
  // process carries its outside integrations and its cron. An integration names the KEY'S VARIABLE, never the key — the
  // passport is published; a value here would be a leaked secret. Cron is added only after the person's «yes».
  if (x.process !== undefined && !Array.isArray(x.process)) problems.push('extension.process must be a list')
  ;(Array.isArray(x.process) ? x.process : []).forEach((p, i) => {
    const at = `process[${i}]`
    if (!text(p?.kind) || !text(p?.what)) { problems.push(`${at} needs kind and what`); return }
    if (p.kind === 'integration') {
      if (!text(p.service)) problems.push(`${at}: integration needs service (e.g. exa.ai)`)
      if (p.env !== undefined && !/^[A-Z][A-Z0-9_]{1,63}$/.test(String(p.env))) problems.push(`${at}: env is the NAME of the key's variable (e.g. EXA_API_KEY), never the key itself`)
      if (p.docs !== undefined && !/^https:\/\/\S+$/.test(String(p.docs))) problems.push(`${at}: docs must be an https link to the service's API documentation`)
    }
    if (p.kind === 'cron' && !/^(\S+\s+){4}\S+$/.test(String(p.schedule ?? '').trim())) problems.push(`${at}: cron needs schedule — five fields, e.g. "0 9 * * 1"`)
  })
  if (x.catalog !== null && x.catalog !== undefined && (!isObj(x.catalog) || !text(x.catalog.find) || !text(x.catalog.get))) problems.push('extension.catalog needs find and get (or null)')
  if (x.private !== undefined && !Array.isArray(x.private)) problems.push('extension.private must be a list')
  if (x.a2aEndpoint === undefined) warnings.push('no A2A endpoint: supportedInterfaces will be empty (only the extension doors are offered)')
  else if (!text(x.a2aEndpoint) || !x.a2aEndpoint.startsWith('/')) problems.push('extension.a2aEndpoint must be a path like /api/a2a')
  if (x.a2aSkills !== undefined && (!Array.isArray(x.a2aSkills) || x.a2aSkills.some((id) => !ids.has(id)))) problems.push('extension.a2aSkills must list skill ids of card.skills')
  if (card.securitySchemes !== undefined && typeof card.securitySchemes !== 'object') problems.push('card.securitySchemes must be a map')
  // 406-5: `describe:publish` уносит в реестр верхние `summary` и `provides` — они обязаны совпадать с визиткой.
  if (props.summary !== card.description) problems.push('top-level summary must equal card.description (describe:publish carries it)')
  const prov = Array.isArray(props.provides) ? [...props.provides].sort().join(',') : ''
  if (prov !== [...ids].sort().join(',')) problems.push('top-level provides must list exactly the skill ids of card.skills')
  return { problems, warnings }
}

/** Stable fingerprint of the card: changes exactly when the element's promises change. */
export function fingerprintOf(props) {
  const sort = (v) => (Array.isArray(v) ? v.map(sort) : isObj(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v)
  return createHash('sha256').update(JSON.stringify(sort(props?.a2a?.card ?? null))).digest('hex').slice(0, 16)
}

/** The AgentCard as published at /.well-known/agent-card.json. `interfaces` — real A2A endpoints only (none yet). */
export function publishedCard(props, { origin } = {}) {
  const x = extensionOf(props.a2a.card) ?? {}
  const interfaces = origin && x.a2aEndpoint ? [{ url: origin + x.a2aEndpoint, protocolBinding: 'JSONRPC', protocolVersion: '1.0' }] : []
  return { ...props.a2a.card, supportedInterfaces: interfaces }
}

/** Level-1 registry entry derived from the card. */
export function registryEntryOf(props, { address, cardUrl } = {}) {
  const c = props.a2a.card
  const x = extensionOf(c) ?? {}
  return {
    address: address ?? props.id,
    name: c.name,
    description: c.description,
    skills: (c.skills ?? []).map((s) => ({ id: s.id, tags: s.tags })),
    hasCatalog: Boolean(x.catalog),
    visibility: x.visibility,
    fingerprint: fingerprintOf(props),
    card: cardUrl ?? null,
  }
}

