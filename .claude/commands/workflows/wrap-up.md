---
name: workflows:wrap-up
description: Finish a feature — commit quality, knowledge capture, architecture decisions, cleanup
argument-hint: "[brainstorm file path or brief context]"
---

# Wrap Up

Run after completing a feature or fixing a non-trivial bug. Handles everything that happens after code is done.

## Steps

### 1. Identify Task File

Find the active task file from the argument or by scanning `docs/brainstorms/*.task.json`.

If multiple task files exist, ask which one to wrap up.

### 2. Integration Test Verification

If the work modified `.jsx` files in `quicken-web-app/src/`, run affected integration tests before reviewing commits.

**Discovery order:**
1. If the task file has an `integration_tests` array, run those files.
2. Otherwise, grep ABOUTME comments for the affected component names:
   ```bash
   cd modules/quicken-web-app
   grep -l 'ComponentName' test/*.integration-test.js
   ```

```bash
cd modules/quicken-web-app
yarn tap:file test/{feature}.integration-test.js
```

**If no `.jsx` files were modified:** Skip to step 3.

### 3. Commit Quality Check

Review commits since branch diverged from main:

```bash
git log main..HEAD --oneline
```

Check each commit message for Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`).

**If commits lack this format or are disorganized:**
- Present the issue to the user
- Offer to reorganize using `.claude/tasks/reorganize-commits.md`
- **[CHECKPOINT]** — get approval before any history rewriting

**If commits look good:** Move to step 4.

### 4. Knowledge Absorption

Read the brainstorm file linked from the task file's `brainstorm` field.

**4a. Execute declared Knowledge Destination**

The brainstorm's `Knowledge Destination` section declares where content goes. Follow it mechanically:

| Destination | Action |
|-------------|--------|
| `solution:` path (new) | Create solution doc with YAML frontmatter. Sections in this order: Solution, Prevention, Key Decisions, Problem, Root Cause. Target 50-80 lines. |
| `solution:` path (update) | Update the specified solution doc with new content from the brainstorm. |
| `architecture:` path (update) | Update the specified architecture doc to reflect new system state. |
| `decisions:` append | Append a 3-line entry (Context/Decision/Why) to `docs/decisions.md`. |
| `none` | Skip — knowledge lives in the code. |

**4b. Check for implementation gotchas**

Review the implementation for gotchas or patterns not anticipated in the brainstorm. If found, ask:
"Implementation revealed {gotcha}. Add to {destination doc}, or skip?"

**4c. Architecture decisions**

If architectural decisions were made during implementation that aren't covered by the Knowledge Destination:
- Quick decisions → append to `docs/decisions.md`
- If a brainstorm had `none` as destination but significant patterns emerged, ask about creating a solution doc.

### 5. Artifact Cleanup

1. Delete the task file (`docs/brainstorms/{name}.task.json`)
2. **Brainstorm file:** Read it. If all sections were implemented and Knowledge Destination was executed, propose deletion. If it has unimplemented scope items or is referenced by other brainstorms, say so — Jeff decides.
3. Always ask before deleting brainstorm files.

### 6. Commit Wrap-Up Changes

`git add` and `git commit` any files created, modified, or deleted during wrap-up.

## Rules

- Don't skip the commit quality check — it's how we maintain a readable history
- Knowledge absorption follows the brainstorm's declared destination — not ad-hoc judgment
- If the brainstorm has no Knowledge Destination section, treat it as `none` but flag it: "This brainstorm predates the Knowledge Destination convention. Any knowledge worth capturing?"
- Always ask before deleting brainstorm files
