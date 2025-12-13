# Workflow Rules

## Phases

### 1. Brainstorm
Discuss freely. No templates.

### 2. Plan
**Invoke:** User says "Generate current-task.json from [source] following .claude/tasks/plan-feature.md"

**Do:**
1. Read `tasks/plan-feature.md`
2. Read source (plan file or conversation context)
3. Read relevant `tasks/*.md` templates
4. Write `current-task.json` with:
   - Specific, self-contained steps
   - `[CHECKPOINT]` prefix on steps needing approval
   - Intermediate `git add` + commit steps after logical chunks
5. Delete any intermediate planning artifacts

### 3. Implement
**Invoke:** User says "Continue implementing current-task.json" or "Resume at step N"

**Do:**
1. Read `current-task.json`
2. Execute steps in order, marking `done: true` as completed
3. At `[CHECKPOINT]` steps: stop, present options, wait for approval
4. On `git commit`: style validator runs via pre-commit hook; fix violations before continuing

### 4. Record
**Invoke:** User says "Record completion following .claude/tasks/record-completion.md"

**Do:**
1. Read `tasks/record-completion.md`
2. Add architectural decisions to `docs/architecture/` if any
3. Append summary to `specifications/completed-specifications.md`
4. Delete `current-task.json`

## Constraints

- `current-task.json` is JSON — follow exactly, no improvisation
- Never skip `[CHECKPOINT]` steps without approval
- Never batch all commits to the end — intermediate commits trigger validation
- Read `conventions.md` and `preferences.md` when writing code
