# designSection — a design editor of the site element

**Type:** Page material. A working part of the architect layer: one of four editors carried over from
fractera-next-starter — `colors`, `fonts`, `type`, `shape`, chosen by `section`.

## Whose settings it edits

The **site's** (the `root` element's `DESIGN-CONFIG`), not the core's. The owner's law of 2026-09-23:
the site keeps its own settings and stays alive without the core; the core reaches them through the
site's settings door. The editor asks the core door `/api/architect/design-config`, which passes the
request to the site door `/api/settings/design` under the key `SETTINGS_SECRET`. The values are asked in
the browser: the page is prerendered, and settings asked on the server would freeze into its HTML.

Three states, and "the site did not answer" is not "no settings": on refusal the editor is not drawn at
all, so nothing empty can be saved over the real settings.

## Saving does not apply — deploying does

**Decision of the owner, 2026-09-24:** «важно чтобы пользователь не запускал это после каждого изменения:
изменил шрифт сохранил рано запускать развёртывание, изменил цвет сохранил – рано». So **Save** only
writes the settings. After a successful save an orange plate (token `warning`) says the site does not
show it yet and leads to «Build → Deployments», where one deployment applies all the changes at once.
Above the editor a hint: settle the design early — every deployment rebuilds every part of the project
that uses these settings.

Until 280-11a the door rebuilt the site on every save; one such save on 2026-09-24 at 08:12 took the site
down (`kill EPERM` during the build).
