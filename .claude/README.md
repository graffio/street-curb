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

To review a file before modifying it (> 100 lines):

```
review <file>
```

To review all staged files before a PR:

```
review staged
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
| `pattern-catalog.md`| Tactical patterns and complexity budgets                     |
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
| `review-complexity.md`         | Complexity assessment         |

## Two Kinds of Code Checks

We have two different tools that serve different purposes:

### Style Validator (mechanical, automatic)

Runs automatically on every commit via pre-commit hook. Checks:
- Line length, @sig documentation, file naming, spacing
- **complexity-budget**: function count, line count, style object count

**When it fails**: Fix the issue and retry commit. Most violations are quick fixes.

**Exception**: complexity-budget failures are different — see below.

### Complexity Review (structural, manual)

Run manually with `review <file>` or `review staged`. Checks:
- **Cohesion grouping**: Are all functions in P/T/F/V/A namespace objects?
- **Layer violations**: Is business logic in React files? Should it move to selectors or business modules?
- **Pattern opportunities**: Could Action, LookupTable, or selectors apply?
- **Simplification strategies**: What to extract, where to move it

**P/T/F/V/A**: Single-letter namespaces for function cohesion types:
- **P** (Predicates): `is*`, `has*`, `should*`, `can*`, `exports*`
- **T** (Transformers): `to*`, `get*`, `extract*`, `parse*`, `format*`
- **F** (Factories): `create*`, `make*`, `build*`
- **V** (Validators): `check*`, `validate*`
- **A** (Aggregators): `collect*`, `count*`, `gather*`, `find*`

Every function goes in a namespace, even if it's the only one of its type. See `conventions.md` for full spec.

**When to run**:
- Before modifying a file > 100 lines (during planning)
- When complexity-budget fails (as a checkpoint)
- Before creating a PR (`review staged`)

### Complexity-Budget Failures = CHECKPOINT

When the style validator reports "exceeds budget", this is NOT a quick fix:

1. **Stop** — don't shuffle code around hoping to pass
2. **Run `review <file>`** — understand the structural issues
3. **Rethink approach** — might need to:
   - Move logic to proper architectural layer (React → selectors → business modules)
   - Apply a different pattern (Action, LookupTable, selectors)
   - Revise the plan with a new approach
4. **Get approval** — if the plan changes, confirm with user

"Split file" means moving logic to where it architecturally belongs, not arbitrarily splitting to reduce line count. This decision is made together.

## Git Hooks

### Pre-commit Hook

`bash/pre-commit-validate.sh`:
1. Finds staged JS/JSX files
2. Runs `cli-style-validator` on each
3. If violations: blocks commit
4. If clean: creates `.claude/.needs-reread` flag

### Reread Reminder Hook

`bash/check-reread-flag.sh` runs on every user message:
1. If `.needs-reread` flag exists: reminds Claude to reread conventions
2. Deletes flag after reminder

## Why JSON for current-task.json?

Markdown allows interpretation. JSON forces structure:
- Steps are enumerable and checkable
- `done` flag is boolean, not prose
- No "wriggle room" for Claude to reinterpret instructions

## Key Principles

1. **Templates are steps, not rules** — If it matters, it's a step in a template
2. **current-task.json is the constraint** — Follow exactly, no improvisation
3. **Intermediate commits trigger validation** — Don't batch to the end
4. **Checkpoints require approval** — Stop and ask at `[CHECKPOINT]` steps
