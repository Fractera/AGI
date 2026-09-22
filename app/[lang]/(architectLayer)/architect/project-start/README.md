# `/architect/project-start` — the project start path

**Ported from the admin panel one to one** (step 274): the choice screen, the steps, their words, the
step anatomy and the flow state come from `bridges/app` of `ai-workspace` and are kept in `_launch/`.
This folder holds the wrappers our layer requires.

- `_launch/pages/` — the panel's pages, untouched;
- `_launch/ui/` — the step anatomy, the map, the islands;
- `_launch/flow/` — the words of every step;
- `_launch/server/` — the flow state (`data/node/launch/flow.env`);
- `_launch/shell/` — our replacements for the panel's shell, nav, strings, auth and site address;
- `api/flow/` — the doors of the path.

🛑 **The second path (`custom-fractera-repo`) is copied but NOT wired**: its steps stand on the panel's
slot machinery (`slot-swap`, `ssh-access`, Vercel deploy), which this node does not have.
