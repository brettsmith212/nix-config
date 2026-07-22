---
name: gtd-weekly-review
description: Reviews an Obsidian GTD system across next actions, projects, waiting-for, someday/maybe, and areas of focus. Use when asked for a GTD weekly review or to review GTD projects, areas, or commitments.
user_invocable: true
---

# GTD Weekly Review

Run a trusted GTD review without adding unnecessary structure. Read `GTD/How This Works.md` first and treat it as the source of truth. Locate the vault from the current workspace; never hardcode its path.

Use the full workflow when the user asks for a weekly or general GTD review. If the user requests only projects, waiting-for, someday/maybe, or areas, run only that phase plus the finish step. Do not create separate systems or metadata for a problem the current notes already solve.

## Review Standard

- Clarify commitments so the user will not have to reinterpret them later.
- Preserve one canonical checkbox for every action; never copy an action onto the dashboard.
- Every note in `Projects/` is active and has exactly one unchecked next action.
- Future project steps are plain bullets under `## Plan`, not task checkboxes.
- `area` says which ongoing responsibility a project supports. Context tags say where or how an action can be done.
- Never invent a commitment, next action, project outcome, area, or project completion. Present proposed changes and obtain the user's approval first.
- Ask related questions in one compact batch. Avoid walking through obvious items one at a time.

## Read First

- `GTD/How This Works.md`
- `GTD/Next Actions.md`
- `GTD/Projects.md`
- `GTD/Waiting For.md`
- `GTD/Someday Maybe.md`
- `GTD/Areas of Focus.md`
- `Projects/` and `Projects/Project Template.md`
- `Inbox.md`

Do not edit `Dashboard.md` during a review unless the user explicitly asks to change the system itself.

## Full Workflow

### 1. Get Clear

Confirm that daily inbox processing is current. If `Inbox.md` contains unresolved captures left behind, load and follow the `gtd-review-inbox` skill; its clarification and approval rules govern that catch-up work. Do not turn the weekly review into routine inbox processing.

### 2. Get Current: Next Actions

Review `GTD/Next Actions.md` for completed tasks, duplicates, vague wording, and contexts that describe a subject rather than where or how work can be done.

Delete completed tasks. Propose any rewrites, rerouting, or new commitments before editing them.

### 3. Get Current: Projects

Inspect every Markdown note in `Projects/` except `Project Template.md`. Check that each project:

- has a concrete `area` found in `GTD/Areas of Focus.md`;
- has an outcome stated as a finished result;
- has exactly one unchecked, physical next action;
- keeps future or dependent steps as plain bullets;
- still represents an active commitment.

Present exceptions in one compact table. For a project with no next action, propose one only when it follows unambiguously from the plan; otherwise ask what must happen next. For multiple unchecked actions, ask which one is current and convert the others to plan bullets after approval. Ask before declaring, deleting, archiving, pausing, or creating a project.

### 4. Get Current: Waiting For

Review every item in `GTD/Waiting For.md`. Each entry should name who owns the next move and the expected result. Ask whether it is still pending, needs a follow-up action, is complete, or should be dropped. Apply confirmed changes and route any follow-up to the appropriate project or next-actions list.

### 5. Get Creative: Someday/Maybe

Review `GTD/Someday Maybe.md` as possibilities, not commitments. In one batch, ask whether listed items should remain deferred, become active, or be removed. Activating an item still requires explicit approval for the resulting project or next action.

### 6. Get Perspective: Areas of Focus

Review each area in `GTD/Areas of Focus.md`. An area is an ongoing responsibility, not a project and not something to complete. Ask:

> Is this area appropriately maintained, or does something here need a project, next action, calendar entry, or conscious acceptance?

Do not require every area to have an active project. Add, remove, rename, or rewrite an area only with the user's approval.

### 7. Mind Sweep

Ask once whether anything else has the user's attention. Capture new items in `Inbox.md`, then use the `gtd-review-inbox` workflow for those captures. Do not casually route them during the review.

## Finish

Summarize:

- inbox items processed or still unresolved;
- completed actions removed;
- projects advanced, completed, paused, or still missing a next action;
- waiting-for and someday/maybe decisions;
- area concerns discovered;
- calendar items the user still needs to schedule.

Aim for a trusted system, not a cosmetically empty one. If an item remains unclear, leave it unchanged and state the unresolved decision.
