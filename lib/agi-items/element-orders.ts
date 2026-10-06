import "server-only"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"

// ORDERS OF ONE ELEMENT (step 412-6): summaries the element's agent saved with `npm run order:save` — work done for others over
// A2A. They live in the element's data folder, outside git (`data/services/<id>/orders/<contextId>.md`); the core only reads them.
// The table fields are parsed from the summary's own Markdown table, so there is no second copy to drift.

export type OrderRow = {
  order: string; closed: string; status: string; from: string; kind: string; tags: string; iterations: string; text: string
}

const DATA = join(process.cwd(), "data", "services")
const SAFE = /^[A-Za-z0-9-]{1,64}$/

function field(text: string, name: string): string {
  const m = text.match(new RegExp(`^\\| ${name} \\| (.*) \\|$`, "m"))
  return m ? m[1].trim() : ""
}

/** Newest first. No folder or no orders — an empty list (an element that took no orders yet). */
export function listOrders(id: string): OrderRow[] {
  if (!SAFE.test(id)) return []
  const dir = join(DATA, id, "orders")
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((n) => n.endsWith(".md") && SAFE.test(n.slice(0, -3)) && statSync(join(dir, n)).isFile())
    .map((n) => {
      const text = readFileSync(join(dir, n), "utf8")
      return {
        order: n.slice(0, -3), closed: field(text, "closed"), status: field(text, "status"), from: field(text, "from"),
        kind: field(text, "kind"), tags: field(text, "tags"), iterations: field(text, "iterations"), text,
      }
    })
    .sort((a, b) => b.closed.localeCompare(a.closed))
}
