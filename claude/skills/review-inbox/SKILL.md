---
name: review-inbox
description: Processes the user's Obsidian GTD Inbox.md — matches lines to existing projects (with confirmation), defaults unmatched items to Next Actions, applies the two-minute rule, and keeps the inbox empty. Use when the user asks to process their inbox, clear their inbox, or run GTD triage.
user_invocable: true
---

You process the user's GTD inbox at:
`/Users/brettsmith/Library/Mobile Documents/iCloud~md~obsidian/Documents/vault/Inbox.md`

Vault layout:
- `Inbox.md` (root) — capture list you process
- `GTD/Next Actions.md` — single-action tasks
- `GTD/Waiting For.md` — blocked on someone else
- `GTD/Someday Maybe.md` — not now, kept for later
- `Projects/<name>.md` — multi-step outcomes; each has an `Outcome:` line and a `## Next actions` section
- `Dashboard.md` — context views, do not edit

Context tags (pick exactly one per action, by where it gets done): `#church`, `#office`, `#home`, `#computer`. If unclear, omit and add `⚠ #tag`.

## Procedure

For each unchecked `- [ ]` line in Inbox.md, top to bottom:

1. **Two-minute check.** If the action is clearly under two minutes and not part of a project, leave it in the inbox but prepend `⚡ do now — `. Skip to next line. The user does these themselves.

2. **Project reference.** If the bullet explicitly names a project (e.g. "for X project", "→ Project Name", "[[Project Name]]"), and a matching `Projects/<name>.md` exists, append the bullet (cleaned up, with one context tag) to that project's `## Next actions`. Do not fuzzy-match; only honor explicit references. If the named project file does not exist, treat as no project.

3. **Waiting / someday keywords.** "waiting on", "needs <x> first", "from <person>" → append to `GTD/Waiting For.md`. "someday", "maybe", "one day", "consider" → append to `GTD/Someday Maybe.md`.

4. **Default — Next Actions.** Append to `GTD/Next Actions.md` with one context tag inferred from wording. This is where most items go. If you guessed the tag, append ` ⚠ #tag`.

5. **Delete the line from Inbox.md** once moved. The inbox should end empty except for ⚡ do-now items.

## Hard rules

- Never edit `Dashboard.md`.
- Never create a new project automatically. If a bullet explicitly names a project that does not exist, leave it in Next Actions with `⚠ needs project: <name>` and let the user create the project later.
- One context tag per action. No priority tags. No dates.
- Make wording concrete before moving: rewrite "stuff for trip" as "Book flights for trip". If you reworded, append ` ⚠ reworded` so the user can verify.
- Do not check off items. Moving is not doing.

## Closing

Report one line: counts of items moved to each destination, and ⚡ do-now count. Nothing else.