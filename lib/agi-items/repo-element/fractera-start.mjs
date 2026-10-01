// Fractera node launcher — added by the node when this repository was born as an AGI element (step 367-4).
// The node's process manager (pm2) runs THIS file; it reads `.env.fractera` (written by the node's installer), then starts the
// project in the mode the node recognised. Do not edit by hand: the node writes it at birth. Delete the element to remove it.
//
//   node fractera-start.mjs next           — Next.js: `next start` in this process on the node's port
//   node fractera-start.mjs node:<file>    — a Node server started as `node <file>`; it must read PORT from the environment
//   node fractera-start.mjs static:<dir>   — a built static site: served from <dir>, /api/health answers 200

import { createReadStream, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
process.chdir(here)

// `.env.fractera`: KEY=VALUE lines; values already in the environment win.
try {
  for (const line of readFileSync(join(here, '.env.fractera'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2]
  }
} catch { /* no file — the environment of the process manager only */ }

const port = Number(process.env.PORT) || 3000
const host = '127.0.0.1'
const mode = process.argv[2] ?? ''

if (mode === 'next') {
  // In-process: the CLI reads process.argv. No child process — a killed launcher leaves no orphan on the port.
  process.argv = [process.argv[0], 'next', 'start', '-p', String(port), '-H', host]
  await import(pathToFileURL(join(here, 'node_modules', 'next', 'dist', 'bin', 'next')).href)
} else if (mode.startsWith('node:')) {
  process.env.PORT = String(port)
  process.env.HOST ??= host
  await import(pathToFileURL(resolve(here, mode.slice(5))).href)
} else if (mode.startsWith('static:')) {
  const root = resolve(here, mode.slice(7))
  const types = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
  }
  const file = (p) => { try { return statSync(p).isFile() ? p : null } catch { return null } }
  createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? '/').split('?')[0])
    if (path === '/api/health') {
      res.writeHead(200, { 'content-type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, pid: process.pid }))
    }
    const target = normalize(join(root, path))
    if (!target.startsWith(root)) { res.writeHead(403); return res.end() }
    // The file itself · <path>.html · <path>/index.html · the site's index.html (single-page apps route in the browser).
    const hit = file(target) ?? file(`${target}.html`) ?? file(join(target, 'index.html'))
    const spa = file(join(root, 'index.html'))
    const found = hit ?? (extname(path) ? null : spa)
    if (!found) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Not found') }
    res.writeHead(200, { 'content-type': types[extname(found).toLowerCase()] ?? 'application/octet-stream' })
    createReadStream(found).pipe(res)
  }).listen(port, host, () => console.log(`[fractera] static ${root} on http://${host}:${port}`))
} else {
  console.error(`[fractera] unknown mode «${mode}» — expected next | node:<file> | static:<dir>`)
  process.exit(1)
}
