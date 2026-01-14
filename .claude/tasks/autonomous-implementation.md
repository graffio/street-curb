# Autonomous Implementation Protocol

Use this when Jeff asks you to implement a feature autonomously (unsupervised).

## Core Rules

1. **Follow current-task.json exactly** — no improvisation
2. **Run style validator before staging** — `node modules/cli-style-validator/src/cli.js [files]`
3. **NEVER add COMPLEXITY comments** — if validator says "complexity budget exceeded", STOP and ask Jeff
4. **Track status in current-task.json** — not TodoWrite

## Session Resume Checklist

1. Read `.claude/active-goal.md` — what are we building?
2. Read `.claude/current-task.json` — find first `done: false` step
3. Run `git log --oneline -5` — what was recently done?
4. Report: "Resuming at step N. Last commit: [message]."

## Per-Step Protocol

1. State what this step does (one sentence)
2. Do the work
3. Run style validator on changed files
4. **If complexity-budget violation:** STOP, ask Jeff (do NOT add COMPLEXITY comments)
5. If other violations: fix them
6. Run tests if applicable
7. Mark step `done: true`

## Pre-Commit Protocol

1. Style validator passes on all changed files
2. Tests pass
3. Stage with `git add`
4. Commit with Problem/Solution/Impact format

## Hard Stops (Ask Jeff)

- Complexity-budget violation (NEVER add COMPLEXITY comments yourself)
- Tests fail unexpectedly after 2 fix attempts
- Design decision unclear
- Would need permanent COMPLEXITY exemption
