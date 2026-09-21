# API map

> **Собирается командой `npm run build:api-map` — не правьте руками.** Имена живут в самих маршрутах
> первой строкой (`// @api …`), потому что рядом с кодом они не расходятся с ним. Написанное здесь
> вручную исчезнет при следующей сборке.

Имя маршрута — то, чем его находят: 6–12 слов, глагол первым. Правило проверяется `npm run check:api`,
который стоит в `prebuild` — маршрут без имени роняет сборку.

Всего маршрутов: **20**

| Адрес | Методы | Что делает | Продукт |
|---|---|---|---|
| `/api/auth/providers/google` | GET, POST, DELETE | read and set the Google sign-in keys of this node's auth service | — |
| `/api/config-image/[slot]` | GET | serve a settings image slot at one stable address | — |
| `/api/domain/activate` | POST | create the named tunnel and the DNS record, then remember what happened | — |
| `/api/domain/check` | POST | check publicly whether the domain already points at Cloudflare nameservers | — |
| `/api/domain/key` | POST | accept the Cloudflare API token and remember it on the node | — |
| `/api/domain/state` | GET | state of the own-domain connection: what is done and what is next | — |
| `/api/health` | GET | report liveness and which build of this application answers | — |
| `/api/i18n/translate` | POST | translate one record's fields without exposing the model key | — |
| `/api/me` | GET | tell the browser who is signed in and with which roles | — |
| `/api/media-proxy/[...path]` | GET | proxy media files the browser cannot reach directly | — |
| `/api/media/[id]/file` | GET | stream one stored media file to the visitor | — |
| `/api/media/icons/[setId]/file/[name]` | GET | stream one generated application icon from its set | — |
| `/api/media/upload` | POST | upload a file into the platform media store | — |
| `/api/openai-models` | GET | list the live model names this key can actually use | — |
| `/api/project-types/[lang]/[id]` | GET | describe one project direction for the home page window | — |
| `/api/revalidate` | POST | rebuild public pages after the owner changes app settings | — |
| `/api/services` | GET | report which service blocks this node carries and on which ports | — |
| `/api/transcribe` | POST | turn a recorded voice fragment into written text | — |
| `/api/users` | GET | list user accounts from the auth service for the administration page | — |
| `/api/users/[id]` | PATCH | change the roles of one user account through the auth service | — |

## Как этим пользоваться

- **Ищете, куда писать данные?** Читайте столбец «что делает», а не имена папок: адрес говорит, где
  маршрут лежит, имя — что он делает, и это разные вопросы.
- **Заводите свой маршрут?** Первой строкой файла — `// @api <6–12 слов>`, затем `npm run build:api-map`.
- **Адрес не переименовывают ради красоты.** URL — публичный контракт: он в браузере, в журналах и в
  чужих интеграциях. Меняется имя в заголовке, оно ничего не ломает.
