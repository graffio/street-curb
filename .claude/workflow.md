# Workflow Rules

## Constraints

- `current-task.json` is JSON — follow exactly, no improvisation
- Never skip `[CHECKPOINT]` steps without approval
- Never batch all commits to the end — intermediate commits trigger validation
- Read `conventions.md` and `preferences.md` when writing code
- Address blocking issues from subagent reviewers before proceeding
- Always spawn reviewers as specified — don't skip them

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
5. Write `.claude/active-goal.md` (3-5 lines: goal, approach, key decisions)
6. **Spawn plan-reviewer subagent** — wait for feedback, address issues before proceeding
7. Delete any intermediate planning artifacts (but keep `active-goal.md`)

### 3. Implement
**Invoke:** User says "Continue implementing current-task.json" or "Resume at step N"

**Do:**
1. Read `current-task.json`
2. Execute steps in order, marking `done: true` as completed
3. At `[CHECKPOINT]` steps: stop, present options, wait for approval
4. Before each `git commit`:
   - **Spawn code-reviewer subagent** on staged changes — address blocking issues
   - Then commit (style validator runs via pre-commit hook; fix violations if needed)

### 4. Record
**Invoke:** User says "Record completion following .claude/tasks/record-completion.md"

**Do:**
1. Read `tasks/record-completion.md`
2. Add architectural decisions to `docs/architecture/` if any
3. Append summary to `specifications/completed-specifications.md`
4. Delete `current-task.json` and `.claude/active-goal.md`

## Subagent Specifications

### plan-reviewer
**Reads:** `.claude/active-goal.md`, `.claude/current-task.json`, `conventions.md`, `preferences.md`

**Checks:**
- Goal clarity: Is the goal specific and measurable?
- Step completeness: Are steps self-contained? Missing steps?
- Checkpoint placement: Are approval points at significant decisions?
- Testability: Can completion be verified?
- Scope creep: Do steps stay focused on the goal?

**Output:** List of concerns (if any) or "LGTM"

### code-reviewer
**Reads:** `git diff --cached` (staged changes), `.claude/active-goal.md`, `conventions.md`, `preferences.md`

**Checks:**
- Conventions: Does code follow `conventions.md`?
- Intent match: Does implementation match the goal and plan?
- DRY opportunities: Are there duplicate patterns that should be consolidated?
  - Repeated style objects
  - Duplicate helper functions
  - Copy-pasted logic across files
- Edge cases: Obvious error conditions not handled?
- Naming: Are names clear and consistent?
- Complexity: Unnecessary abstraction or over-engineering?

**Output:** List of issues (blocking/non-blocking) or "LGTM"
