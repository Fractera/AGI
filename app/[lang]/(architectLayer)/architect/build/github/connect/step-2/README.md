# `/architect/build/github/connect/step-2` — one step of the repository wizard

The visible part is **ported from the admin panel** (step 274) and lives in
`_connect/panel/default-template/step-2/page.tsx`. This folder holds only the wrapper our layer
requires, and `meta.hidden` keeps the step out of the left menu: it is a step of a process, not a
section of its own.

🛑 **Do not edit the ported page here.** Its words live beside it, its anatomy in
`_connect/ui/step-section.tsx`, its state in `_connect/server/launch-flow.ts`, its doors in
`api/connect/`.
