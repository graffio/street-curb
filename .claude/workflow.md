# Workflow Rules

## Constraints

- `current-task.json` is JSON — follow exactly, no improvisation
- Never skip `[CHECKPOINT]` steps without approval
- Never batch all commits to the end — intermediate commits trigger validation
- Read `conventions.md` and `preferences.md` when writing code
- Address blocking issues from subagent reviewers before proceeding
- Always spawn reviewers as specified — don't skip them

## Commands

### review \<file\>
Run all checks on a file:
1. Style validator (mechanical: @sig, line length, file naming, complexity budgets)
2. Complexity review (structural: cohesion grouping, patterns, simplification opportunities)
3. Simplicity review (API design: does each abstraction earn its existence?)

Report all findings together.

### review staged
Run all checks on staged files together:
1. Style validator on each file
2. Complexity review across all staged files (can detect cross-file patterns)
3. Simplicity review on files with new/changed exports

Use before commit to catch issues across related changes.

## Complexity-Budget Failures

When the style validator reports a complexity-budget violation ("exceeds budget"), this is a **CHECKPOINT**, not a quick fix:

1. **Stop** — don't try to "fix" by shuffling code around
2. **Run complexity review** — understand the structural issues
3. **Reassess approach** — might need to:
   - Move logic to its proper architectural layer (React → selectors, selectors → business modules)
   - Use a different pattern (Action, LookupTable, selectors)
   - Revise `current-task.json` with a new approach

   Note: "Split file" means moving logic to where it belongs architecturally, not arbitrarily splitting to reduce line count. Decide together where logic should live.
4. **Get approval** — if the plan changes significantly, confirm with user

Complexity-budget failures often signal architectural issues that require rethinking, not just refactoring.

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
   - **Run style validator** on changed files while developing (catch issues early, before pre-commit rejects)
   - **Run simplicity review** on files with new/changed exports (catch overengineering early)
   - **Spawn code-reviewer subagent** on staged changes — address blocking issues
   - Then commit (pre-commit hook runs style validator as safety net)

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

### complexity-reviewer
**Reads:** Target file, `.claude/pattern-catalog.md`, `.claude/tasks/review-complexity.md`

**When to spawn:**
- Pre-commit hook reports complexity-budget violation
- User requests assessment of a file
- Before planning changes to an existing file over 100 lines

**Checks:**
- Measurements: Lines, style objects, functions against context budgets
- Cohesion: Are all functions in P/T/F/V/A namespace objects? Any uncategorized?
- Patterns: Could existing tactical patterns (LookupTable, TaggedSum, Action) apply?
- Styles: Should style objects become CSS variables or move to shared module?
- Components: Should render functions become actual components?
- Layer: Is business logic in React files? Should it move to selectors or business modules?

**Output format:**
- Observations (what seems off, even if unsure)
- Questions for the Developer (requires global knowledge)
- Clear Wins (unambiguous improvements that pass litmus test)
- Patterns to Investigate (from catalog, flagged for human review)

**Key principle:** Surface concerns and questions rather than prescribe automatic fixes. The human has global context Claude doesn't.

### simplicity-reviewer
**Reads:** Target file(s), `.claude/tasks/review-simplicity.md`

**When to spawn:**
- Before commit for files with new/changed exports
- User requests simplicity assessment
- When a file feels "overengineered"

**Checks:**
- Pointless indirection: wrappers that add nothing, single-use helpers
- API confusion: mixed input types, misleading names (singular/plural mismatch)
- Unnecessary complexity: accumulator params, manual destructuring, explicit null filtering
- Litmus test: does each abstraction earn its existence?

**Output format:**
- Exports list (the API surface)
- Findings by category (pointless/confusing/unnecessary)
- Questions for Developer (patterns that might be intentional)
- Summary (X abstractions reviewed, Y findings)

**Key principle:** An abstraction earns existence when removing it would make code worse, not just different.
