# This repository is an AGI element of a Fractera node

The node added this file when the repository was born as an element. It does not replace the project's own instructions — it
adds how the project lives inside the node. Answer the person in their language.

## How the node runs this project
- `fractera-start.mjs` is the process the node keeps alive. It reads `.env.fractera` (written by the node) and starts the
  project in the mode written in `OWN-SERVICE-PROPS.json` → `runtime.entryArgs`. Take the port from `PORT`; never hard-code one.
- `OWN-SERVICE-PROPS.json` is the passport: how to install, build, start and check health. Change it only when the person asks to
  change how the project is built or started — the node reads it on every install.
- Do not edit `fractera-start.mjs`, `.env.fractera` or `env.fractera.example`: the node owns them.

## What the node offers, and how to use it (only when the person asks)
- Sign-in: the node's auth element. `NEXT_PUBLIC_AUTH_URL` is its address; `GET <auth>/api/session/verify` with the visitor's
  cookie answers 204 (signed in) or 401. Works when this element lives on a subdomain of the same zone as sign-in.
- Data: the node's data element at `REMOTE_DATA_URL` — HTTP requests with the node's key. Never open a database file of your own.
- Design and CONFIG of the project are not followed by this element: it was born independent.

## Where updates go
- This element's own repository is `ELEMENT_REPO_URL` (the person's GitHub account — the node allows only the person's own
  repository). Pushing needs a GitHub key: if the person has not added one, send them to this element's «GitHub» page — it
  shows the repository and explains how to get the key. Never push with credentials of your own.

## How work is delivered
- Commit your change. Then rewrite `TASK-REPORT.json` in the same commit: `task` (the request in one sentence, in the person's
  language), `done` (what changed), `check` (steps to see it), `path` (page where it shows, "" for home), `anchor` ("" if none).
- Send the person to this element's «Deployments» page: Preview builds the commit beside the running version; Accept switches.
- Keep steps in `development-docs/` (current state in `development-docs/current-steps.md`).
