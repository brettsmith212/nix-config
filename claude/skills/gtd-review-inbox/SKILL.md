---
name: gtd-review-inbox
description: Clarifies and processes Obsidian Inbox.md items through the GTD decision tree into two-minute actions, projects, next actions, waiting-for, calendar, Apple Reminders, someday/maybe, reference, or trash. Use when asked to process, triage, or clear the GTD inbox.
user_invocable: true
---

Locate the vault from the current workspace and process its `Inbox.md`. Read these first; never hardcode the vault path:

- `GTD/How This Works.md` — source of truth
- `GTD/Next Actions.md`, `GTD/Waiting For.md`, `GTD/Someday Maybe.md`, and `GTD/Areas of Focus.md`
- `GTD/Projects.md` — generated project-health map
- `Projects/` and `Projects/Project Template.md`
- `Reference/` notes relevant to an inbox capture, when needed to avoid duplication or link project support; do not read the entire folder

Never edit `Dashboard.md`.

## Standard

Clarify now so future-you does not have to think again. Every task must be one concise line with a visible action, specific object, and an obvious finish. It should be clear enough that another person could understand how to start and what “done” means. The user owns every new commitment: never create, reword, or route an executable action without their explicit approval.

If the user supplies or confirms a due date, preserve it when routing the action and append `📅 YYYY-MM-DD` at the end of the task line, after all context tags. Never infer a due date.

For any capture containing a date or relative date, do not infer whether it belongs in Obsidian or Apple Reminders. Unless the user already named the destination, ask: "Would you like this captured in Obsidian or as an Apple Reminder?" Require the user to supply or confirm the exact date. For Apple Reminders, add `--time HH:MM` only when the user supplies or confirms a specific time; never infer one. A date without a time must remain an all-day reminder. For Obsidian actions, append the confirmed date as `📅 YYYY-MM-DD`. An explicit request to create a reminder or add an Obsidian action does not require asking again.

Never move a vague capture, guess missing details, or turn a task into a paragraph. If a desired outcome requires multiple actions, ask whether the user is committed to that outcome. If yes, it is a project and requires a project note. If not, clarify whether any individual action is independently desired, or whether the item belongs in Apple Reminders, `GTD/Someday Maybe.md`, `Reference/`, or trash. Never split a committed multi-action outcome into unrelated standalone actions merely to avoid creating a project.

Reference notes hold useful information, not commitments. Route non-actionable information worth retaining to `Reference/`. Route information supporting an active project to `Reference/` and link it under that project's `## Reference` section. If a capture contains both information and an action, preserve the information in reference and route the action separately.

## Workflow

1. Read every non-scaffolding entry in `Inbox.md`, not only unchecked tasks. Treat unchecked tasks and plain text as captures. A checked task (`- [x]`) is confirmed complete: delete it without further clarification or follow-up. Inspect candidate projects' outcomes and current next actions.

2. Before editing files or creating reminders, propose a disposition for every unresolved capture in one compact Markdown table with its proposed wording, destination, and a context tag when applicable. Ask focused questions for all uncertainties in one numbered batch. Obtain explicit approval to create, reword, or route every executable action and to create every Apple Reminder, even when the intent seems clear. Wait for the answers; ask a follow-up only when an item is still unclear.

3. Process each clarified item in decision-tree order:
   - **What is it?** State what the capture means before deciding where it belongs. Separate useful information from any commitment embedded in the same capture.
   - **Is it actionable? No:** choose one non-actionable disposition.
     - **Trash:** no continuing value → delete it after confirmation.
     - **Someday/maybe:** a possibility worth reviewing, with no specific reconsideration date → `GTD/Someday Maybe.md`.
     - **Incubate until a date:** not actionable now but should return for reconsideration on a specific date → ask whether the user wants it in Obsidian or Apple Reminders unless they already specified the destination. If they choose Apple Reminders, create it with `gtd-reminder` after approval.
     - **Reference:** useful information → a descriptive note in `Reference/`. If it supports an active project, link the note under that project's `## Reference` section. Ask before creating, naming, or combining reference notes.
   - **Is it actionable? Yes:** define the desired outcome before routing the next action.
     - **Project:** a committed outcome requiring multiple actions → an existing or approved new `Projects/<name>.md` with concrete `area` and `outcome` properties, exactly one executable next action, and optional planning notes. Keep future or dependent steps as plain bullets under `## Plan`, never as task checkboxes.
     - **Next action:** identify the next physical, visible action whether the outcome is standalone or a project.
     - **Do now:** if that next action truly takes under two minutes, put it in a temporary `Do now` batch and leave it in the inbox until the user confirms completion. If it belongs to a project, continue tracking the project unless completing the action also completed the outcome.
     - **Delegate:** if someone else should act, confirm that the user delegated it, then record the person and expected result in `GTD/Waiting For.md`.
     - **Calendar:** if the action must occur on a particular date or at a particular time, tell the user what should be scheduled and remove it only after they confirm scheduling. Do not put ordinary next actions on the calendar merely because they have a due date.
     - **Defer:** otherwise route a standalone action to `GTD/Next Actions.md` or keep the action in its project note.

Only active projects belong in `Projects/`. Completed project notes belong in `Archive/Projects/`, outside the active tree so Dataview queries do not include them.

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

   ## Reference

   - [[Relevant project-support note]]
   ```

5. Add at least one dashboard-supported context tag to each executable next action: `#computer`, `#home`, `#errands`, or `#church` when the user must be at church. Choose where or how the action can actually be done, not its subject. Preserve an existing context tag only if it fits where the clarified action can be done; do not treat an area or subject prefix as a context. If a different context would be useful, propose the context and corresponding dashboard change instead of silently introducing it. If uncertain, ask instead of guessing. Waiting-for and someday/maybe entries need no context tag.

6. After clarification and confirmation, make all moves. Preserve task syntax (`- [ ]`), avoid duplicates, and remove empty placeholder tasks. Keep each executable task to one line, but preserve all material details—links, dates, names, constraints, and useful project notes—in the destination or an approved note in `Reference/`. For an approved Apple Reminder, run `gtd-reminder --title <title> --date YYYY-MM-DD`; omit `--time` to create an all-day reminder, or add `--time HH:MM` only when the user supplied or confirmed that time. Optional arguments are `--notes <text>` and `--list <name>`. Use the default Reminders list unless the user names another list. Remove the inbox capture only after the command succeeds. If `gtd-reminder` is unavailable, give the user the exact reminder details and remove the capture only after they confirm creating it manually. Delete a checked inbox task immediately. Delete any other inbox entry only after its complete content was preserved or the user confirmed it done, scheduled, or discarded; leave unresolved captures unchanged.

## Finish

Aim for an empty inbox, but never sacrifice clarity to empty it. Report concise counts by destination, projects created, items completed/scheduled/deleted, and anything still awaiting clarification.
