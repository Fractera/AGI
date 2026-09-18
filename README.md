# Fractera Next.js Starter

This repository is a **starter template** that launches from **[fractera.ai](https://www.fractera.ai)** — your own AI coding workspace, deployed onto your own server.

## Run it on your own computer

```bash
npm run serve:start      # start the site (installs pm2 the first time)
npm run serve:status     # is it alive, on which address, which build answers
npm run serve:stop       # stop it
npm run serve:autostart  # bring it up automatically when the computer starts
```

The site runs on **http://localhost:24680**. That port is deliberate: `3000` is the busiest port in
development and we start before you do, so we would break your own projects; `49152+` is the range the
operating system hands out to outgoing connections, so a permanent listener there fails at random. If
24680 is taken, the server moves to the next free port in 24680–24699 and says so — the address it
actually took is written to `logs/runtime.json`.

🛑 **Do not start the server by hand (`node server.js`) once it runs under pm2.** Two servers race for
the same port; the loser dies and the winner may be the stale one, which then answers with an old
build. `npm run serve:status` tells you what is actually running.

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
