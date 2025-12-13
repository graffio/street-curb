# How We Work

The rules Claude follows are in **`workflow.md`** (imported into CLAUDE.md). This document explains the protocol for
humans.

## Quick Start

To start a new feature:

```
Generate current-task.json from [plan source] following .claude/tasks/plan-feature.md
```

To resume implementation:

```
Continue implementing current-task.json
```

To finish:

```
Record completion following .claude/tasks/record-completion.md
```

## Why This Protocol Exists

Claude needs constraints to stay on track. Without them, it:

- Improvises instead of following the plan
- Batches commits to the end (skipping validation)
- Interprets instructions loosely

The protocol addresses this with:

- **JSON task spec** — Enumerable steps, no room for interpretation
- **Intermediate commits** — Triggers style validator hook during work
- **Checkpoints** — Forces explicit approval at decision points

## Workflow Phases

### 1. Brainstorm

Free discussion about what to build. No templates, no structure. Output: shared understanding.

### 2. Plan

Generate `current-task.json` from a plan source (markdown file or conversation).

Claude reads `tasks/plan-feature.md` and produces a JSON file with:

- Specific, self-contained steps
- `[CHECKPOINT]` markers for decisions needing approval
- Intermediate commit steps after logical chunks

### 3. Implement

Claude follows `current-task.json` exactly, marking steps done as completed.

Enforcement:

- `git add` triggers `cli-style-validator` via hook
- Violations block until fixed
- `[CHECKPOINT]` steps require explicit approval

### 4. Record

Archive the work using `tasks/record-completion.md`:

- Architectural decisions → `docs/architecture/`
- Summary → `specifications/completed-specifications.md`
- Delete `current-task.json`

## Files

| File                | Purpose                                                      |
|---------------------|--------------------------------------------------------------|
| `CLAUDE.md`         | Entry point, imports workflow.md + conventions + preferences |
| `workflow.md`       | Rules for Claude (short, actionable)                         |
| `conventions.md`    | Code style (mechanical rules)                                |
| `preferences.md`    | Architectural preferences (judgment calls)                   |
| `current-task.json` | Active task spec                                             |
| `tasks/*.md`        | Templates for specific activities                            |
| `settings.json`     | Claude hook configuration                                    |

## Task Templates

| Template                       | When                          |
|--------------------------------|-------------------------------|
| `plan-feature.md`              | Creating `current-task.json`  |
| `commit-changes.md`            | Writing commit messages       |
| `record-completion.md`         | Archiving completed work      |
| `implementation-checkpoint.md` | Handling `[CHECKPOINT]` steps |
| `add-redux-action.md`          | Adding Redux actions          |
| `write-tests.md`               | Writing tests                 |
| `debug-issue.md`               | Debugging                     |
| `start-work.md`                | Session startup checks        |

## Enforcement Mechanisms

### Style Validator (Git Pre-commit Hook)

`bash/pre-commit-validate.sh` runs as a git pre-commit hook:

1. Finds staged JS/JSX files
2. Runs `cli-style-validator` on each
3. If violations: blocks commit with error output
4. If clean: creates `.claude/.needs-reread` flag

### Reread Reminder (Claude UserPromptSubmit Hook)

`bash/check-reread-flag.sh` runs on every user message:

1. Checks if `.claude/.needs-reread` flag exists
2. If yes: outputs reminder to reread conventions, deletes flag
3. If no: exits silently

This ensures Claude rereads conventions after every successful commit.

### Why JSON for current-task.json?

Markdown allows interpretation. JSON forces structure:

- Steps are enumerable and checkable
- `done` flag is boolean, not prose
- No "wriggle room" for Claude to reinterpret instructions

## Key Principles

1. **Templates are steps, not rules** — If it matters, it's a step in a template
2. **current-task.json is the constraint** — Follow exactly, no improvisation
3. **Intermediate commits trigger validation** — Don't batch to the end
4. **Checkpoints require approval** — Stop and ask at `[CHECKPOINT]` steps
