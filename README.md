# Fractera Next.js Starter

This repository is a **starter template** that launches from **[fractera.ai](https://www.fractera.ai)** — your own AI coding workspace, deployed onto your own server.

## Run it on your own computer

```bash
npm run serve:start      # start the site (installs pm2 the first time)
npm run serve:status     # is it alive, on which address, which build answers
npm run serve:rebuild    # rebuild after you change the code (production serves a BUILD)
npm run serve:stop       # stop it
npm run serve:autostart  # bring it up automatically when the computer starts
```

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

Go to **[fractera.ai](https://www.fractera.ai)**, start a deployment, and choose **Next.js** as the starter. Fractera clones this repository onto your server and brings it up for you.

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

![Star the project on GitHub](public/video/git-star.gif)
