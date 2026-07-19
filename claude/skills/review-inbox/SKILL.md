---
name: review-inbox
description: Clarifies and processes Obsidian Inbox.md items into GTD next actions, projects, waiting-for, someday/maybe, or non-actions. Use when asked to process, triage, or clear the GTD inbox.
user_invocable: true
---

Process `$VAULT_ROOT/Inbox.md` into the user's GTD system. Read these first; never hardcode the vault path:

- `GTD/How This Works.md` — source of truth
- `GTD/Next Actions.md`, `GTD/Waiting For.md`, and `GTD/Someday Maybe.md`
- `Projects/` and `Projects/Project Template.md`

Never edit `Dashboard.md`.

## Standard

Clarify now so future-you does not have to think again. Every task must be one concise line with a visible action, specific object, and an obvious finish. It should be clear enough that another person could understand how to start and what “done” means.

Never move a vague capture, guess missing details, or turn a task into a paragraph. If one line contains several actions, do not automatically create a project. Ask the user whether they want a project created; if yes, create one from `Projects/Project Template.md` with the next action. If no, add each action as a separate single next action to `GTD/Next Actions.md` with the appropriate context tag.

## Workflow

1. Read every non-scaffolding entry in `Inbox.md`, not only unchecked tasks. Treat unchecked tasks as captures; clarify the disposition of plain-text or checked entries instead of silently skipping them. Inspect candidate projects' outcomes and current next actions.

2. Before editing files, resolve only uncertainties that affect the wording, destination, project, or context tag. Ask focused questions for all unclear items in one numbered batch and suggest a concise rewrite when the likely intent is evident. Wait for the answers; ask a follow-up only when an item is still not actionable.

3. Classify each clarified item:
   - **Do now:** a standalone action that truly takes under two minutes. Ask the user to do it. Remove it only after they confirm completion; otherwise route it as a next action.
   - **Next action:** one executable action → `GTD/Next Actions.md`.
   - **Project:** an outcome requiring multiple actions. Ask the user whether to create a project. If yes → an existing or new `Projects/<name>.md`, containing a concrete `Outcome:` and only the immediate next action. If no → add each action as a separate single next action to `GTD/Next Actions.md` with the appropriate context tag.
   - **Waiting for:** someone else owns the next move → `GTD/Waiting For.md`, naming the person and expected result.
   - **Someday/maybe:** intentionally deferred → `GTD/Someday Maybe.md`.
   - **No action:** delete it, or ask where to file it as reference if it is worth keeping.
   - **Calendar:** must occur at a particular date or time, rather than merely having a due date → tell the user what should be scheduled and remove it only after they confirm scheduling.

4. Always ask before creating a new project, even when the multi-action intent is unambiguous. Include the proposed project name and outcome in the clarification batch and confirm before editing. For a new project, derive a short outcome-based name and create it from `Projects/Project Template.md`. If an existing project already has a current next action, ask whether the inbox item replaces it or belongs in project notes; do not add a second next action.

5. Add exactly one context tag to each executable next action: `#church`, `#office`, `#home`, or `#computer`. Choose where the action can actually be done, not its subject. Preserve an existing context tag only if it fits where the clarified action can be done; do not treat an area or subject prefix as a context. If uncertain, ask instead of guessing. Waiting-for and someday/maybe entries need no context tag.

6. After clarification and confirmation, make all moves. Preserve task syntax (`- [ ]`), avoid duplicates, and remove empty placeholder tasks. Keep each executable task to one line, but preserve all material details—links, dates, names, constraints, and useful project notes—in the destination or a user-chosen reference note. Delete an inbox entry only after its complete content was preserved or the user confirmed it done, scheduled, or discarded; leave unresolved captures unchanged.

## Finish

Aim for an empty inbox, but never sacrifice clarity to empty it. Report concise counts by destination, projects created, items completed/scheduled/deleted, and anything still awaiting clarification.
