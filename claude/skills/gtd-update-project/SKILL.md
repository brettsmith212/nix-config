---
name: gtd-update-project
description: Advances one Obsidian GTD project after a next action is completed by confirming the outcome, selecting the next action, or archiving the project. Use when asked to update or advance a named GTD project, choose its next action, or process a project needing attention.
user_invocable: true
---

# GTD Update Project

Advance one active project without turning its plan into a second task list.

## Read First

Locate the vault from the current workspace; never hardcode its path. Read:

- `GTD/How This Works.md` as the source of truth
- `GTD/Areas of Focus.md`
- `GTD/Waiting For.md`
- the complete named note in `Projects/`
- any note explicitly linked by the project that is necessary to understand its outcome or plan

Never edit `Dashboard.md`. Do not inspect or modify unrelated projects.

If the user did not name a project, ask which project to update. Resolve casual or partial names against `Projects/`; ask if more than one note could match.

## Standard

- The user owns every commitment. Never create, reword, replace, or route an executable action without explicit approval.
- Keep exactly one unchecked executable next action in an active project note.
- Keep the canonical project action in the project note, never in `GTD/Next Actions.md`.
- Keep future or dependent steps as plain bullets under `## Plan`, never as task checkboxes.
- Write each next action as one concise line with a visible action, specific object, obvious finish, and at least one supported context: `#computer`, `#home`, `#errands`, or `#church` when the user must be at church.
- Add or preserve a due date only when the user supplies or confirms it; format it as `📅 YYYY-MM-DD` at the end of the task line, after all context tags. Never infer a due date.
- Preserve completed checkboxes as project history unless the user asks to remove them.
- Never infer project completion solely because its current action is complete.

## Workflow

1. Inspect the project's `area`, `outcome`, current and completed tasks, and `## Plan`. Report malformed metadata or multiple unchecked tasks before proposing another action.

2. Establish the current state in one compact question batch:
   - Confirm which current action was completed if that is not already clear from the note or request.
   - Ask what result, information, or constraint came from that action when it affects what can happen next.
   - Ask whether the stated project outcome is now complete.

3. If the outcome is complete, propose moving the note to `Archive/Projects/`. Archive it only after explicit confirmation. Preserve its outcome, completed tasks, and plan as history. Create the archive directories if needed.

4. If the outcome is not complete, inspect the plan for actions that are available now. Do not promote a blocked or dependent step. When several actions are available, rank them by:
   - removing a blocker or satisfying a prerequisite;
   - reducing the largest relevant uncertainty;
   - making the most direct progress toward the stated outcome;
   - honoring a real deadline or constraint.

5. Present one to three candidate next actions in a compact Markdown table with exact wording, context, source plan item, and a brief reason. Recommend one, but ask the user to approve or revise it. If the plan does not reveal a concrete next action, ask what must happen next instead of guessing.

6. After approval:
   - mark the prior action complete only if the user confirmed completion and it is not already checked;
   - add exactly one approved unchecked action under `## Next action`;
   - remove the corresponding plain bullet from `## Plan` when it was promoted, avoiding duplication;
   - preserve all remaining planning details and completed actions.

7. If someone else owns the next move, propose a `GTD/Waiting For.md` entry naming the person and expected result. Ask whether another independent project action is available; do not invent one merely to remove the project from `Projects Needing Attention`.

## Finish

Report the completed action, the approved new next action and context, any plan item promoted, whether the project was archived, and any unresolved blocker. A successful update leaves an active project with exactly one unchecked action or archives a confirmed completed project.
