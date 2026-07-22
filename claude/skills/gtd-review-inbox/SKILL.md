---
name: gtd-review-inbox
description: Clarifies and processes Obsidian Inbox.md items into GTD next actions, projects, waiting-for, someday/maybe, or non-actions. Use when asked to process, triage, or clear the GTD inbox.
user_invocable: true
---

Locate the vault from the current workspace and process its `Inbox.md`. Read these first; never hardcode the vault path:

- `GTD/How This Works.md` — source of truth
- `GTD/Next Actions.md`, `GTD/Waiting For.md`, `GTD/Someday Maybe.md`, and `GTD/Areas of Focus.md`
- `GTD/Projects.md` — generated project-health map
- `Projects/` and `Projects/Project Template.md`

Never edit `Dashboard.md`.

## Standard

Clarify now so future-you does not have to think again. Every task must be one concise line with a visible action, specific object, and an obvious finish. It should be clear enough that another person could understand how to start and what “done” means. The user owns every new commitment: never create, reword, or route an executable action without their explicit approval.

Never move a vague capture, guess missing details, or turn a task into a paragraph. If one line contains several actions, do not automatically create a project. Ask the user whether they want a project created; if yes, create one from `Projects/Project Template.md` with the next action. If no, add each action as a separate single next action to `GTD/Next Actions.md` with the appropriate context tag.

## Workflow

1. Read every non-scaffolding entry in `Inbox.md`, not only unchecked tasks. Treat unchecked tasks and plain text as captures. A checked task (`- [x]`) is confirmed complete: delete it without further clarification or follow-up. Inspect candidate projects' outcomes and current next actions.

2. Before editing files, propose a disposition for every unresolved capture in one compact Markdown table with its proposed wording, destination, and context tag. Ask focused questions for all uncertainties in one numbered batch. Obtain explicit approval to create, reword, or route every executable action, even when the intent seems clear. Wait for the answers; ask a follow-up only when an item is still not actionable.

3. Classify each clarified item:
   - **Do now:** a standalone action that truly takes under two minutes. Put it in a temporary `Do now` batch at the end of the review, not in a persistent list. Leave it in the inbox until the user confirms completion; otherwise route it as a next action.
   - **Next action:** one executable action → `GTD/Next Actions.md`.
   - **Project:** an outcome requiring multiple actions. Ask the user whether to create a project. If yes → an existing or new `Projects/<name>.md`, containing concrete `area` and `outcome` properties, exactly one executable next action, and optional planning notes. Record future or dependent steps as plain bullets under `## Plan`, never as task checkboxes. If no → add each action as a separate single next action to `GTD/Next Actions.md` with the appropriate context tag.
   - **Waiting for:** someone else owns the next move → `GTD/Waiting For.md`, naming the person and expected result.
   - **Someday/maybe:** intentionally deferred → `GTD/Someday Maybe.md`.
   - **No action:** delete it, or ask where to file it as reference if it is worth keeping.
   - **Calendar:** must occur at a particular date or time, rather than merely having a due date → tell the user what should be scheduled and remove it only after they confirm scheduling.

4. Always ask before creating a new project, even when the multi-action intent is unambiguous. Include the proposed project name, area, and outcome in the clarification batch and confirm before editing. For a new project, derive a short outcome-based name and create it from `Projects/Project Template.md`. Use an existing area from `GTD/Areas of Focus.md`; ask before introducing a new area. If an existing project already has a current next action, ask whether the inbox item replaces it or belongs in the project's `## Plan`; do not add a second executable next action.

   Preserve the template structure exactly. State `outcome` as the completed result, not the work to perform:

   ```markdown
   ---
   area: Existing area name
   outcome: Description of the completed result
   ---

   # Outcome-based project name

   ## Next action

   - [ ] Physical, visible action. #context

   ## Plan

   - Future or dependent step
   ```

5. Add at least one dashboard-supported context tag to each executable next action: `#computer`, `#home`, or `#church` when the user must be at church. Choose where or how the action can actually be done, not its subject. Preserve an existing context tag only if it fits where the clarified action can be done; do not treat an area or subject prefix as a context. If a different context would be useful, propose the context and corresponding dashboard change instead of silently introducing it. If uncertain, ask instead of guessing. Waiting-for and someday/maybe entries need no context tag.

6. After clarification and confirmation, make all moves. Preserve task syntax (`- [ ]`), avoid duplicates, and remove empty placeholder tasks. Keep each executable task to one line, but preserve all material details—links, dates, names, constraints, and useful project notes—in the destination or a user-chosen reference note. Delete a checked inbox task immediately. Delete any other inbox entry only after its complete content was preserved or the user confirmed it done, scheduled, or discarded; leave unresolved captures unchanged.

## Finish

Aim for an empty inbox, but never sacrifice clarity to empty it. Report concise counts by destination, projects created, items completed/scheduled/deleted, and anything still awaiting clarification.
