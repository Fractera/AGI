# new-steps — plans

`<number>-<6-8-word-description>.md`, for example `12-page-of-login-history-for-architect.md`.

This is work still in progress. Once it is finished, the outcome moves to
`../completed-steps/<number>.md` and this file is deleted: a plan and an outcome never exist at the
same time, or they drift apart.

The deletion goes in **the same commit** as the outcome, and the plan itself is recovered from git
afterwards — the command is in `../README.md`, section "What happens to a plan once its step is
closed". A step that was run as a folder is deleted as a folder.
