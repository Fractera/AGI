# Fractera AGI — your own AI node on your own computer

This repository is a whole node: your site, sign-in, data and an agent for every part of it, running on a computer you own.
A person gets it by forking this repository and asking an AI coding agent (Claude Code) to launch it.

## If you are a person and want to launch this project

You need a GitHub account, a computer that stays on, and Claude Code — the terminal app or Claude Desktop in Code mode.

1. **Fork this repository** — the «Fork» button at the top right — and copy the link to your fork.
2. **Open Claude Code** on your computer, in an empty folder.
3. **Paste the link and write: «launch this».**

That is all. In a few minutes your server is running. The agent asks whether to put the site on the internet — say yes,
and it gets a public address right away. Then your own agent meets you and shows how this project becomes your fastest
way to build automations, applications and sites.

**What you have from the first minute**

- **Sign-in and a database**, already wired together.
- **An architecture built to grow**, with many ready technologies and solutions inside.
- **A site factory.** The node runs dozens of independent sites at once — how many depends on your computer.
- **Blockchain technologies**, when you want them.

Have a good journey.

<p align="center">
  <a href="https://github.com/Fractera/AGI"><img src="public/video/git-star.gif" alt="Star the project on GitHub" height="100"></a>
</p>

## If you are an AI agent and were asked to launch this project

The person pasted a link to this repository (or to their fork of it) and asked you to run it. Do this, in order:

1. **Check the tools.** `git --version` and `node --version` (Node.js 22 is what this node is built and measured on). If one
   is missing, tell the person what to install and stop until they have it.
2. **Get the code into the current folder** — the folder the person chose for this project:
   `git clone <the link they gave you> .` (use their fork's link if they gave one).
3. **Install and build:** `npm install`, then `npm run build`. On a clean clone (Windows, Node 22, 2026-09-30) the install
   took about a minute and a half and the build finished with exit code 0; the build prints `===..._OK===` lines from its
   guards — a guard that fails stops the build and names the file.
4. **Start it:** `npm run serve:start`. The first start also installs the node's elements (sign-in `auth`, data `data`,
   the site `root`) from their own repositories — it takes a few minutes; wait for it.
5. **Make sure it works:** `npm run serve:status` must say the site answers **locally** with 200. Give the person the local
   address it prints (normally `http://localhost:24680`) and tell them it opens only on this computer.
6. **Ask before going public.** Putting the site on the internet is the person's decision, never a side effect of starting.
   Ask: «Put the site on the internet now?» Only on a yes run `npm run serve:publish` and give them the address it prints —
   a temporary Cloudflare address (`https://….trycloudflare.com`). Say plainly that it is temporary: it changes when the
   tunnel restarts, and a permanent address is their own domain, connected later on the node's page
   «Domain and hosting → Domain activation».
7. **Hand over.** From now on the person works with the node itself: its pages, and the agent of each element in its
   terminal or in Telegram. Tell them this chat is no longer needed for the node to run.

Do not start the server by hand (`node server.js`) and do not invent steps that are not here — if something fails, show the
person the exact error and the command that produced it.

## Run it on your own computer

```bash
npm run serve:start      # start the node (installs pm2 and the node's elements the first time)
npm run serve:status     # is it alive, on which address, which build answers
npm run serve:rebuild    # rebuild after you change the code (production serves a BUILD)
npm run serve:stop       # stop it
npm run serve:autostart  # bring it up automatically when the computer starts
```

**The node's elements arrive on the first start.** This repository carries only their list,
`AGI-ITEMS-CONFIG/agi-items.json`: sign-in (`auth`), data (`data`) and the site at the root of your
domain (`root`). Each is its own repository, and `serve:start` clones any that are missing at the
pinned tag into `AGI-ITEMS/core/<id>` (the same as `npm run services:install`). They come from the
Fractera repositories on GitHub; a node that is already installed does not need GitHub to run.

The site runs in **production** on **http://localhost:24680** — pages are pre-built and served in
milliseconds, nothing is compiled while you browse. That is also why changing the code needs
`npm run serve:rebuild`: the running site serves a build, not your source files.

The site runs on **http://localhost:24680**. That port is deliberate: `3000` is the busiest port in
development and we start before you do, so we would break your own projects; `49152+` is the range the
operating system hands out to outgoing connections, so a permanent listener there fails at random. If
24680 is taken, the server moves to the next free port in 24680–24699 and says so — the address it
actually took is written to `logs/runtime.json`.

🛑 **Do not start the server by hand (`node server.js`) once it runs under pm2.** Two servers race for
the same port; the loser dies and the winner may be the stale one, which then answers with an old
build. `npm run serve:status` tells you what is actually running.

## Put it on the internet — and what that address costs

```bash
npm run serve:publish        # put the site on the internet (keeps the address you already have)
npm run serve:publish -- --new  # deliberately swap it for a fresh address
npm run serve:unpublish  # take it back off — the site keeps running for you
```

Going public is a separate decision, never a side effect of starting: `serve:start` runs the site for
the owner of the machine and for nobody else.

🛑 **The address you get is TEMPORARY, and you should learn that on day one, not on the day it breaks.**
It lives as long as the tunnel lives and changes on every restart. Sooner or later the site stops
opening there and Cloudflare shows a page with **error 1016 or 1033**. That means the address went
stale — **your site is intact**, still running on your own computer. Come back to the chat and ask the
agent to refresh the address (or run `npm run serve:publish` yourself); the old link is dead for good.
A permanent address that never goes stale means your own domain.

The address is never remembered, always measured: `npm run serve:status` asks the network and tells you
whether the site is reachable from the internet right now. A watchman inside the tunnel does the same
once a minute and marks the address dead in the log — it never replaces it on its own, because a new
address would silently break the link you already gave to someone.

Two processes are kept alive: the site itself and a health watchdog. The watchdog asks
`/api/health` every 30 seconds and restarts the site after three failures in a row — it exists because
a process can stay alive while every page returns 500, and no process manager can see that.

## See it in action

Take a look at a live deployment: **[aifa.dev](https://aifa.dev)**

## Install it

Fork this repository, open Claude Code in an empty folder, paste the link to your fork and write «launch this». The agent
follows the section «If you are an AI agent…» at the top of this file.

## What this template gives you

- **A light public page** — a clean, ready-to-edit starting point.
- **Auth-ready, role-aware out of the box.** The starter integrates with Fractera's shared auth
  substrate and gates pages by role. Access tiers it enforces today: **`guest` → `user` → `architect`**
  (the architect is the owner / top tier).
- **A demo dashboard** that changes real project state (the included example manages products), built on
  typed, reusable route patterns — the seed an AI uses to grow your app further.

### The full role model

The project recognises a complete set of roles, so you can grow role-specific experiences without
inventing the access model yourself:

| Group | Roles |
|---|---|
| **Access tiers** (enforced) | `guest` · `user` · `architect` |
| **Customer-facing** | `buyer` · `vip_user` · `subscriber_lite` · `subscriber_standard` · `subscriber_max` |
| **Staff / operations** | `manager` · `senior_manager` · `support_manager` · `delivery_manager` · `finance` · `content_editor` |
| **Admin** | `admin` |

### Designed for role-based dashboards

Because the role model and the dashboard patterns are already in place, an AI assistant can scaffold
interactive, per-role experiences for you — for example:

- **Buyer / user** — add items to a cart, simulate checkout, chat with a manager, track delivery, leave a review.
- **Architect / admin** — manage the product catalogue, assign customers to managers.
- **Finance (accountant)** — confirm simulated payments.
- **Manager** — view requests from their own customers, message the customer.
- **Delivery** — view and confirm delivery.

These ready patterns let today's AI models adapt to your app's conventions and extend it to any level you
need **using a fraction of the tokens** — saving tens of millions of tokens over building from scratch,
and, more importantly, giving you an expert-grade architecture that scales at minimal token cost.

## Like it? Star the project ⭐

If you enjoy this starter, please don't forget to give the project a star — it really helps. Thank you so much!

<p align="center">
  <a href="https://github.com/Fractera/AGI"><img src="public/video/git-star.gif" alt="Star the project on GitHub" height="100"></a>
</p>
