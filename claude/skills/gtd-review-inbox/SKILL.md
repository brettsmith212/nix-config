---
name: gtd-review-inbox
description: Processes Obsidian Inbox.md captures through the GTD decision tree into projects, context-based next actions, waiting-for, Apple Calendar or Reminders, someday/maybe, reference, or trash. Use when asked to process, triage, review, or clear the GTD inbox.
user_invocable: true
---

# GTD Review Inbox

Clarify every inbox capture and put it in the one place where the user will expect to find it.

## Read First

Locate the vault from the current workspace; never hardcode its path. Read:

- `GTD/How This Works.md` as the source of truth
- `Inbox.md`
- `GTD/Next Actions.md`
- `GTD/Waiting For.md`
- `GTD/Someday Maybe.md`
- `Projects/` and `Projects/Project Template.md`
- only the project and support/reference notes relevant to the captures being processed

`GTD/Projects.md` is a generated inventory. Do not edit it when creating or archiving a project.

## Rules

- The user owns every commitment. Obtain explicit approval before creating, materially rewording, routing, scheduling, delegating, or discarding an unresolved item. Ask related questions in one compact batch.
- Clarify what an item means, the desired outcome, and the next physical, visible action before deciding where it belongs.
- A project is a committed outcome requiring more than one action. Every project needs a clear outcome and at least one linked, available action in `GTD/Next Actions.md`.
- Available actions exist only in `GTD/Next Actions.md`, under `## On Phone`, `## At Computer`, `## At Home`, `## Errands`, `## Read / Review`, or `## At Church`. Do not use context tags.
- End every project-related next action with its project link, such as `[[Job Search]]`.
- Project notes contain `## Outcome`, `## Plan`, and `## Support`. Plans are optional future or dependent steps written as plain bullets, never task checkboxes.
- Information belongs in `Reference/` or project support, not in an action list. If a capture contains information and an action, preserve and route each part separately.
- Apple Calendar and Apple Reminders are the hard landscape. Do not add due-date syntax to Obsidian actions.
- Never assign an arbitrary date merely to make an action visible.
- Do not delete an unresolved inbox capture until its full meaning has been preserved or the user confirms that it is complete or unwanted.

## Workflow

1. Read every non-scaffolding entry in `Inbox.md`. Treat unchecked tasks and plain text as captures. A checked task confirms that its action is complete, but preserve any useful information it contains before deleting it.

2. For each unresolved capture, determine:

- What is it?
- Is it actionable?
- If actionable, what completed outcome is wanted?
- Does that outcome require more than one action?
- What is the next physical, visible action?
- Is the action available now, delegated, or required on a specific day or time?

3. Present one compact disposition table covering all captures. Include proposed wording, destination, project, and next-action context when applicable. Ask all remaining clarification questions together and wait for approval before editing or creating external items.

4. Route non-actionable items:

- **Trash:** delete after confirmation when it has no continuing value.
- **Someday/maybe:** add a plain bullet to `GTD/Someday Maybe.md` when it is a possibility without a current commitment or specific reconsideration date.
- **Reference:** create or update a descriptive note in `Reference/`. Avoid duplicate notes.
- **Project support:** preserve the information in an appropriate note and link it under the project's `## Support` section.
- **Incubate to a date:** create an Apple Reminder after the user confirms the exact date. It does not belong in Someday/Maybe or Next Actions.

5. Route actionable items:

- **Do now:** if it truly takes less than two minutes, ask the user to do it. Remove the capture after they confirm completion.
- **Delegate:** after the user confirms delegation, add one concise entry to `GTD/Waiting For.md` naming the person, expected result, and project link when applicable. Use Apple Reminders for a date-specific follow-up.
- **Calendar:** for an appointment, event, or day-specific information, give the user the exact Apple Calendar entry to create. Remove the capture after they confirm it was scheduled.
- **Day-specific action:** create an Apple Reminder after confirming the exact date and any time.
- **Next action:** add one concise checkbox under the appropriate heading in `GTD/Next Actions.md`. The line must start with a visible verb, name the object, have an obvious finish, and include a project link when applicable.

6. For a new project, obtain approval for its name, outcome, first next action, and context. Create `Projects/<name>.md` from this structure:

```markdown
# Outcome-based project name

## Outcome

Describe what being done looks like.

## Plan

- Future or dependent step

## Support

- [[Relevant project-support note]]
```

Add the approved first action to `GTD/Next Actions.md` with a link to the new project. Do not add an action checkbox to the project note. The generated Projects list will update automatically.

7. For an existing project, determine whether the capture is another independently available action, a future/dependent plan item, support material, or a replacement for an obsolete action. Do not turn the project plan into a task list.

8. For an approved Apple Reminder, first confirm its destination list. If necessary, discover available list names with:

```sh
reminders show-lists
```

The CLI requires a list and has no default-list option. After the user confirms the exact list, title, date, and any time, run:

```sh
reminders add <list> <title> --due-date <date>
```

Use `YYYY-MM-DD` for a confirmed date-only reminder; it creates an all-day reminder. When the user confirms a time, pass a single date-and-time value such as `YYYY-MM-DD HH:MM` to `--due-date`. Add `--notes <text>` only when needed. Remove the inbox capture only after the command succeeds. If `reminders` is unavailable, leave the capture until the user confirms manual creation.

Pass every user-provided value as a separate, shell-quoted argument. Never interpolate reminder text into an unquoted shell command.

## Finish

Aim for an empty inbox without sacrificing clarity. Report concise counts by destination, projects created, actions completed, calendar items confirmed, reminders created, items deleted, and anything left unresolved.
