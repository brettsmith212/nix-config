---
name: gtd-weekly-review
description: Runs a GTD Weekly Review across the Obsidian inbox, context-based next actions, active projects, waiting-for, someday/maybe, and the Apple Calendar and Reminders hard landscape. Use when asked for a weekly GTD review or a review of GTD commitments.
user_invocable: true
---

# GTD Weekly Review

Restore trust in the system by getting clear, current, and creative. Locate the vault from the current workspace; never hardcode its path.

Use the full workflow for a weekly or general GTD review. If the user requests only one list, run that phase plus the finish step.

## Read First

- `GTD/How This Works.md` as the source of truth
- `Inbox.md`
- `GTD/Next Actions.md`
- `GTD/Projects.md`
- `GTD/Waiting For.md`
- `GTD/Someday Maybe.md`
- every Markdown note directly inside `Projects/` except `Project Template.md`
- project support notes only when needed to clarify a project's state

## Review Standard

- The user owns every commitment. Present proposed changes and obtain approval before creating, materially rewriting, rerouting, scheduling, deleting, or archiving commitments.
- Ask related questions in compact batches rather than reviewing obvious items one at a time.
- `Projects/` is the active project inventory. `GTD/Projects.md` is generated and should not be manually edited.
- Every active project has a clear outcome and at least one incomplete action in `GTD/Next Actions.md` that links to it.
- Available actions exist only in `GTD/Next Actions.md` under the five established context headings. Project notes contain outcomes, plans, and support, not executable checkboxes.
- Apple Calendar and Apple Reminders are the hard landscape. Do not keep date-bound commitments or due-date syntax in Obsidian Next Actions.
- Future and dependent steps are plain project-plan bullets, not commitments presented as available work.
- Aim for a trusted system, not a cosmetically empty one. Leave unclear items unchanged and state what remains unresolved.

## Full Workflow

### 1. Get Clear

Check `Inbox.md`. If unresolved captures remain, follow the `gtd-review-inbox` workflow to clarify and process them. Do not silently route captures during the review.

Ask whether there are loose papers, notes, messages, or other collection points that still need to be captured in `Inbox.md` before continuing.

### 2. Review The Hard Landscape

Ask the user to review upcoming Apple Calendar and Apple Reminders items. Confirm that:

- appointments, events, and day-specific information are current;
- reminders represent actions or follow-ups that must happen or reappear on a specific day;
- completed or obsolete items are removed;
- any newly discovered commitments are captured for clarification.

Do not move ordinary available actions onto a date merely to make them visible.

### 3. Review Next Actions

Review `GTD/Next Actions.md` for:

- completed or obsolete tasks;
- duplicates;
- vague wording without a visible action, specific object, or obvious finish;
- actions under the wrong context heading;
- project actions missing their project link;
- date-bound items that belong in Apple Calendar or Reminders.

Remove confirmed completed tasks. Propose any rewrite or rerouting before applying it.

### 4. Review Projects

Inspect every note directly inside `Projects/` except `Project Template.md`. For each project, verify that it:

- states a concrete outcome as a completed result;
- remains an active commitment;
- has at least one incomplete action in `GTD/Next Actions.md` linking to it;
- keeps future or dependent steps as plain bullets under `## Plan`;
- links useful project material under `## Support`.

Also identify linked next actions whose project note does not exist.

Present all exceptions in one compact table. For a project without a next action, first ask whether its outcome is complete. If it remains active, derive candidate actions from its outcome and plan only when safe; otherwise ask what must happen next. Use the `gtd-update-project` workflow to advance or archive it.

If an incomplete project is no longer an active commitment but remains desirable, move its outcome to `GTD/Someday Maybe.md`, resolve its linked actions and waiting-for entries, and archive or remove its project note after approval.

Move a confirmed completed project to `Archive/Projects/` only after resolving its remaining linked actions and waiting-for entries. Before any archive move, verify that the destination filename does not exist and resolve collisions with the user rather than overwriting an existing note. The generated Projects list requires no manual update.

### 5. Review Waiting For

Review every entry in `GTD/Waiting For.md`. Each should name who owns the next move, the expected result, and the related project when applicable. Ask whether it:

- is still pending;
- needs a follow-up action or date-specific Apple Reminder;
- is complete;
- is obsolete.

Apply confirmed changes. Route an available follow-up action to the appropriate Next Actions context with its project link.

### 6. Review Someday/Maybe

Review `GTD/Someday Maybe.md` as possibilities, not commitments. In one batch, ask which items should remain deferred, be removed, become standalone next actions, or become committed projects. Activating an item requires a clarified outcome and explicit approval.

### 7. Get Creative

Ask once: "What else has your attention?"

Capture each answer in `Inbox.md`, then follow the `gtd-review-inbox` workflow. Do not casually add unclarified ideas to Projects or Next Actions.

## Finish

Summarize:

- inbox items processed or unresolved;
- calendar or reminder changes still needed;
- completed or obsolete actions removed;
- actions clarified, rerouted, or linked to projects;
- projects advanced, archived, or still missing a next action;
- waiting-for decisions and follow-ups;
- someday/maybe decisions;
- new captures and unresolved questions.
