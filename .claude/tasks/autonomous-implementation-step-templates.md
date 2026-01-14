# Autonomous Implementation Step Templates

Templates for common step types in `current-task.json`. Use these exact patterns.

## TEMPLATE: re-read-with-comprehension

**Purpose:** Refresh context to survive compaction. Verbatim quotes prove reading.

**Action format (MUST include verbatim quote requirements):**
```
Read [specific files]. Quote verbatim (not paraphrase):
(1) [specific rule from file A]
(2) [specific rule from file B]
State: current step number, what previous step accomplished.
```

**Verification:** Output must contain exact quotes from source files.

**Example step:**
```json
{
  "step": 5,
  "action": "Read active-goal.md, current-task.json, conventions.md, autonomous-implementation.md. Quote verbatim: (1) the cohesion group rule from conventions.md, (2) the 'never edit code directly' prohibition from autonomous-implementation.md. State: current step number, what previous step accomplished.",
  "done": false
}
```

## TEMPLATE: spawn-implementer

**Purpose:** Delegate code changes to a subagent.

**Action format (MUST include all parts):**
```
DO NOT make code changes yourself. Spawn implementer subagent:
- Read first: [specific files including conventions.md]
- Task: [specific action with file names]
- Run style validator before returning
Verify subagent's work matches conventions. If violations found, send subagent back with specific corrections.
```

**Verification:** YOU run style validator (don't trust subagent). 0 violations required.

**Example step:**
```json
{
  "step": 8,
  "action": "DO NOT make code changes yourself. Spawn implementer subagent:\n- Read first: conventions.md, specifications/F-qif-import/design-decisions.md\n- Task: Add Transaction Tagged type to modules/quicken-web-app/src/qif/types.js\n- Run style validator before returning\nVerify subagent's work matches conventions. If violations found, send subagent back with specific corrections.",
  "done": false
}
```

## TEMPLATE: run-validations

**Purpose:** Gate before staging/committing.

**Action format (MUST include failure path):**
```
Run validation gates:
1. Style validator: [exact command]
2. Tests: [exact command]
If EITHER fails, STOP — return to step N to fix via subagent.
```

**Verification:** Both commands exit 0. "Fix" means send subagent back, never edit yourself.

**Example step:**
```json
{
  "step": 12,
  "action": "Run validation gates:\n1. Style validator: node modules/cli-style-validator/src/cli.js modules/quicken-web-app/src/qif/types.js\n2. Tests: yarn tap:file modules/quicken-web-app/src/qif/types.tap.js\nIf EITHER fails, STOP — return to step 11 to fix via subagent.",
  "done": false
}
```

## TEMPLATE: spawn-code-reviewer

**Purpose:** Get review before commit.

**Action format:**
```
Stage changes and spawn code-reviewer subagent:
- git add [files]
- Reviewer reads: git diff --cached, active-goal.md, conventions.md
- Address blocking issues before proceeding
- Log outcome in implementation-log.md
```

**Verification:** Reviewer returns LGTM or all blocking issues resolved.

**Example step:**
```json
{
  "step": 13,
  "action": "Stage changes and spawn code-reviewer subagent:\n- git add modules/quicken-web-app/src/qif/types.js modules/quicken-web-app/src/qif/types.tap.js\n- Reviewer reads: git diff --cached, active-goal.md, conventions.md\n- Address blocking issues before proceeding\n- Log outcome in implementation-log.md",
  "done": false
}
```

## TEMPLATE: commit-with-logging

**Purpose:** Commit and update progress log.

**Action format:**
```
Commit: "[message]"
Update implementation-log.md with commit hash and summary.
```

**Verification:** `git log -1` shows expected message. Log file updated.

**Example step:**
```json
{
  "step": 14,
  "action": "Commit: \"Add Transaction Tagged type with validation\"\nUpdate implementation-log.md with commit hash and summary.",
  "done": false
}
```

## Anti-Patterns

**Do NOT write steps like these:**

| Bad Step | Problem | Better |
|----------|---------|--------|
| "Implement the parser" | Too vague, no verification criteria | "Spawn implementer: Add parseQifDate to parser.js, verify with test case '01/15/2024'" |
| "Fix any issues" | Unbounded scope | "If style validator fails on X, fix violation Y" |
| "Review the code" | No specific action | "Spawn code-reviewer on staged changes" |
| "Update types" | Which types? What update? | "Add field `amount: Number` to Transaction type in types.js" |
| "Make it work" | No success criteria | "Tests in parser.tap.js pass (specifically: 'parses date format')" |
| "Clean up" | Vague, invites scope creep | Remove — cleanup belongs in a separate task |
