# docref — a card that leads somewhere: a document to download or a page to open

**Type:** Navigation. A named destination with one sentence of what is there and one button.

## What it actually draws

A tinted card: a small kicker, the title, a one-line summary and a pill button on the right (below on a phone).
Two modes, and the difference is the whole point of the kind:

- **download (default)** — the button is an `<a download>` with a down-arrow; the kicker defaults to «Full
  documentation». For a `.md` file or any document the visitor saves.
- **navigate (`navigate: true`)** — the button is a `next/link` with a right-arrow; no default kicker. For a card that
  opens a page.

🔒 **A page link is never `download`** — the owner's word (2026-09-24, step 291): «the "open section" button does not
work as a link, it works to download some document». The section index of the architect layer took this kind for its
cards while the link always carried `download`, so the browser saved the page instead of opening it. The architect
section index now passes `navigate: true` and a clean address (no `/architect`, step 285-6).

## When to take it

A list of destinations where each needs a sentence of explanation before the visitor decides — the section index of a
group, «read the full document».

## When NOT to take it

- A plain list of links without explanation — the left menu or a list.
- An action (save, deploy) — a button, not a card.
