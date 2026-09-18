# development-steps — the project's memory

Three folders and one live-state file. Everything the agent plans, is working on right now, finishes,
and is asked for from the outside lives here.

| Folder | File name | What is inside |
|---|---|---|
| `new-steps/` | `<number>-<6-8-word-description>.md` | the plan for work not yet done |
| `completed-steps/` | `<step>-<substep>.md` and `<step>-main.md` | the compressed outcome of finished work |
| `current-steps.md` | a single file, right here | where the work stands RIGHT NOW: the active group of steps and the conditions for closing them |
| `pre-steps/` | `dd-mm-yyyy_hh-mm-ss.md` | **requests: what is asked for from OUTSIDE** — written by someone other than the agent |

🔒 **THE INBOX DIFFERS FROM THE OTHERS IN WHO WRITES INTO IT.** The plan, the state and the outcome
are written by the agent. **A request is placed there by a page of the project:** the owner clicks the
pencil next to a block, describes in words what they want, and a file appears. This is the only place
where the text is written by a HUMAN and read by an AGENT, which is why the folder has a law of its
own: `pre-steps/README.md`, read before its contents.

🔒 **THIS FOLDER REACHES YOU EMPTY — BY LAW, NOT BY ACCIDENT.** What lives here are the steps of YOUR
project and nothing else. The steps used to build the starter itself are someone else's history: they
name files you do not have and decisions you never made, yet they are read at the start of every
session alongside yours. So the template keeps exactly three explanatory files and an empty
`current-steps.md`; everything else is yours.

**The third file closes the gap between the two folders:** the plan knows what was intended, the
outcome knows what came out, and neither knows where the work was interrupted. It is read first at the
start of a session, rewritten in place, and reset when a group of steps is closed. Its shape is
described inside it.

**A name is a pointer.** A folder listing must be readable without opening files, so a plan carries
six to eight words about the substance of the work in its name — not "step 12" and not "fixes".

**Numbers run continuously and are never reused.** A plan moves into `completed-steps/` under the same
number, losing the description from its name: by then the description lives inside the file, and
repeating it in the name buys nothing.

**A substep closes with its own file:** `12-1.md` … `12-10.md`, while `12-main.md` is the outcome of
the whole step. A single file covering a ten-substep step stops being readable, and nothing in it
helps you find the substep you need.

## 🔒 What happens to a plan once its step is closed

**The plan of a closed step is deleted from `new-steps/`** — the whole folder, if the step was run as
one. `new-steps/` is a **queue of work still ahead**: the plan of finished work sits in it like a
request for something already built, and the next session reads that queue literally.

**The deletion goes in THE SAME commit as the outcome.** Split apart, they produce a state where the
outcome is written but the plan still hangs in the queue — two records of one piece of work that
contradict each other.

**This is only legitimate because a plan is recoverable from git:**

```
git log --diff-filter=D --format=%H -1 -- <path to the plan>   # the commit that deleted the plan
git show <hash>^:<path to the plan>                            # its contents BEFORE that commit
```

Empty output from the first command means no file ever existed at that path — that is its built-in
negative control. The step outcome `<step>-main.md` names the deletion commit so that the search does
not have to start by walking the history.

## What a plan must contain

Enough detail that the work can be continued from a CLEAN context — by another session, another model,
a month later. A step is broken into 2–10 substeps; a substep behaves exactly like a step: its own
plan, its own acceptance, its own outcome.

## What an outcome must contain

What was done · how it was done · what came out of it · **what the mistakes were** · **how the skills
evolved**.

Mistakes are a mandatory part. A step without them reads like work that never happened, and the next
session will repeat them.

The evolution of skills is the second half of closing and may not be skipped: which skills were read,
where they slowed you down, what had to be looked up in the code, what the architect demanded, which
improvement was agreed and applied. Nothing to improve — write that in one line.
