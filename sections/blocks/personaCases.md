# personaCases — one deal, told three times

**Type:** How it works (3). Its neighbours are `flow` and `problemSolution`.

## What it actually draws

A titled section with a row of three person cards on top — a round avatar on the left, the name and
the role on the right — and, underneath, the six cases of whoever is selected. Picking a person
changes the container: the card gains a border, a tinted background and a glow.

🔒 **Switching is radio inputs plus CSS, not an island.** All eighteen cases sit in the markup, so a
search engine reads them and a person with JavaScript off still sees the whole story. An island would
give the opposite: the text would travel to the browser and the section would be empty without a
script. The rules live in `styles/globals.css` (`.pc-*`) — a `:checked ~` relation belongs to the
link between elements and cannot be written as a utility on one of them.

🔒 **Exactly three people, exactly six cases each.** This is not a list of people: it is one story
told from three sides. A fourth person would turn a scenario into a catalogue, and the type refuses
it.

## When to take it

One process that touches several parties, where the interesting part is that the same events look
different to each of them: a client, a provider and a validator in one deal.

## When NOT to take it

- A process with an order and no second point of view — that is `flow`, and it takes exactly three
  steps (the owner's rule, 2026-09-21).
- Two states of one process, before and after — that is `problemSolution`.
- Equal pieces with no order and no people — that is `cards`.
