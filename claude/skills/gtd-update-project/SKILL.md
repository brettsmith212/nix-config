---
name: gtd-update-project
description: Advances one active Obsidian GTD project by processing completed actions, confirming the outcome, choosing linked next actions, handling waiting-for or calendar items, or archiving the project. Use when asked to update, advance, or complete a named GTD project.
user_invocable: true
---

# GTD Update Project

Advance one project while keeping outcomes, actions, and support in their proper places.

## Read First

Locate the vault from the current workspace; never hardcode its path. Read:

- `GTD/How This Works.md` as the source of truth
- `GTD/Next Actions.md`
- `GTD/Waiting For.md`
- the complete named note in `Projects/`
- only linked support notes needed to understand the outcome or plan

If the user did not name a project, ask which one to update. Resolve partial names against `Projects/` and ask if more than one note could match. Do not inspect or modify unrelated projects.

## Rules

- The user owns every commitment. Obtain explicit approval before creating, replacing, rerouting, or deleting an action, or declaring a project complete.
- An active project has a clear completed-state outcome and at least one available action in `GTD/Next Actions.md` that links to it.
- Available actions never live in the project note. Place them under `## On Phone`, `## At Computer`, `## At Home`, `## Errands`, `## Read / Review`, or `## At Church`; do not use context tags.
- More than one linked action is allowed when each is independently available. Do not manufacture parallel actions merely to make a project look active.
- Keep future or dependent steps as plain bullets under the project's `## Plan`.
- Use `GTD/Waiting For.md` when another person owns the next move.
- Put appointments and day-specific information in Apple Calendar. Put actions or follow-ups that must happen or reappear on a specific day in Apple Reminders. Do not add due dates to Obsidian actions.
- Do not infer that the project is complete merely because an action was completed.

## Workflow

1. Inspect the project's outcome, plan, support, all unchecked actions in `GTD/Next Actions.md` that link to the project, and all linked entries in `GTD/Waiting For.md`. Report malformed or missing project sections before proposing changes.

2. Establish the current state in one compact question batch:

- Which action was completed, if not already clear?
- What result, information, or constraint came from it?
- Is the stated project outcome now complete?
- Are the project's other linked actions still available and relevant?

3. When an action is confirmed complete, remove it from `GTD/Next Actions.md`. Do not copy completed actions into the project note by default. Preserve a result only when it is useful project support or reference information.

4. If the outcome is complete:

- identify any remaining linked next actions or waiting-for entries;
- ask whether each should be removed, retained as a standalone commitment, or moved to another project;
- verify that the destination filename does not already exist, resolving any collision with the user rather than overwriting it;
- after approval, move the project note to `Archive/Projects/`;
- do not edit `GTD/Projects.md`; its Dataview list updates from the folder move.

If the outcome is incomplete but no longer an active commitment, ask whether it remains desirable. If so, add the outcome to `GTD/Someday Maybe.md`, resolve its linked actions and waiting-for entries, and archive or remove the project note after approval. If it is no longer desirable, resolve those commitments and remove or archive the note after approval. Check for destination collisions before archiving.

5. If the outcome is not complete, identify what must happen next. Inspect the plan and newly learned information, but do not promote a blocked or dependent step. Rank candidate actions by:

- removing a blocker or satisfying a prerequisite;
- reducing the largest relevant uncertainty;
- making the most direct progress toward the outcome;
- honoring a genuine calendar constraint.

6. Present up to three candidate actions with exact wording, context heading, source plan item, and a short reason. Recommend one, then obtain approval. If the next move cannot be derived safely, ask rather than guessing.

7. Apply the approved disposition:

- **Available now:** add the checkbox to the chosen heading in `GTD/Next Actions.md` and end it with the project link.
- **Future/dependent:** keep it as a plain plan bullet.
- **Delegated:** add the person, expected result, and project link to `GTD/Waiting For.md`; identify an independent project action if one is available. If none exists, do not pretend the project passes the next-action check: ask the user to define an action, defer the project, or explicitly leave the project as an unresolved system gap.
- **Appointment or day-specific information:** give the user the exact Apple Calendar entry and remove any obsolete Obsidian action only after they confirm scheduling.
- **Day-specific action or follow-up:** create an Apple Reminder after confirming the exact date and any time.

When promoting a plan item, remove or revise the corresponding plain bullet so the action is not duplicated.

8. For an approved reminder, first confirm its destination list. If necessary, discover available list names with:

```sh
reminders show-lists
```

The CLI requires a list and has no default-list option. Create the reminder with:

```sh
reminders add <list> <title> --due-date <date>
```

Use `YYYY-MM-DD` for a confirmed date-only reminder; it creates an all-day reminder. When the user confirms a time, pass a single date-and-time value such as `YYYY-MM-DD HH:MM` to `--due-date`. Add `--notes <text>` only when needed. Remove an Obsidian action only after the command succeeds. If `reminders` is unavailable, retain the action until the user confirms manual creation.

Pass every user-provided value as a separate, shell-quoted argument. Never interpolate reminder text into an unquoted shell command.

## Finish

Report the completed or removed action, the project's outcome status, new linked actions and their contexts, waiting-for or calendar changes, plan items promoted, whether the project was archived or deferred, and any unresolved blocker. A successful active project has a clear outcome and at least one linked available action. If it does not, report that invariant as unresolved rather than calling the update successful.
