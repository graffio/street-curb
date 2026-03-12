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

### 3. Full-Branch Review

Spawn review agents in parallel against the complete branch diff and brainstorm context:

```bash
git diff main...HEAD
```

Read the brainstorm file (from the task file's `brainstorm` field) so agents have the spec.

**Agents to spawn (all in parallel):**

- **jeff-js-reviewer** — naming, layer placement, pattern choice
- **code-simplicity-reviewer** — unnecessary complexity, YAGNI violations
- **architecture-strategist** — layer boundaries, structural issues
- **performance-oracle** — performance concerns
- **security-sentinel** — security issues

Prompt each agent with: the full diff, the brainstorm's Settled Approach, and "Does the implementation match the spec? Flag deviations and issues."

**After agents return:** Present a combined summary. If any agent flags blocking issues, **[CHECKPOINT]** — resolve before continuing.

### 4. Commit Quality Check

Review commits since branch diverged from main:

```bash
git log main..HEAD --oneline
```

Check each commit message for Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`).

**If commits lack this format or are disorganized:**

- Present the issue to the user
- Offer to reorganize using `.claude/tasks/reorganize-commits.md`
- **[CHECKPOINT]** — get approval before any history rewriting

**If commits look good:** Move to step 5.

### 5. Knowledge Absorption

Read the brainstorm file linked from the task file's `brainstorm` field.

**5a. Execute declared Knowledge Destination**

The brainstorm's `Knowledge Destination` section declares where content goes. Follow it mechanically:

| Destination                   | Action                                                                                                                                           |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `solution:` path (new)        | Create solution doc with YAML frontmatter. Sections in this order: Solution, Prevention, Key Decisions, Problem, Root Cause. Target 50-80 lines. |
| `solution:` path (update)     | Update the specified solution doc with new content from the brainstorm.                                                                          |
| `architecture:` path (update) | Update the specified architecture doc to reflect new system state.                                                                               |
| `decisions:` append           | Append a 3-line entry (Context/Decision/Why) to `docs/decisions.md`.                                                                             |
| `none`                        | Skip — knowledge lives in the code.                                                                                                              |

**5b. Review step notes for gotchas**

Read all step notes from the task file. For any note that isn't "As planned," evaluate whether the deviation or surprise
should be captured in the Knowledge Destination doc. Ask:
"Step {N} noted: {note}. Add to {destination}, or skip?"

**5c. Architecture decisions**

If architectural decisions were made during implementation that aren't covered by the Knowledge Destination:

- Quick decisions → append to `docs/decisions.md`
- If a brainstorm had `none` as destination but significant patterns emerged, ask about creating a solution doc.

### 6. Spike Harvest & Artifact Cleanup

1. Delete the task file (`docs/brainstorms/{name}.task.json`)
2. **Spike harvest & cleanup:** Check for spike worktrees related to this feature (`git worktree list`). For each:
   a. Identify the spike branch name from the worktree listing.
   b. Show non-code changes: `git diff main...<spike-branch> --name-only | grep -v '\.\(js\|jsx\)$'`
   c. If any files changed, ask: "These files changed in the spike. Bring any back to main?"
   d. For selected files: `git restore --source=<spike-branch> -- <paths>`
   e. Stage harvested files for the wrap-up commit (Step 7).
   f. Offer to remove the worktree. Always ask before removing.
3. **Brainstorm file:** Read it. If all sections were implemented and Knowledge Destination was executed, propose
   deletion. If it has unimplemented scope items or is referenced by other brainstorms, say so — Jeff decides.
4. Always ask before deleting brainstorm files.

### 7. Commit Wrap-Up Changes

`git add` and `git commit` any files created, modified, or deleted during wrap-up.

## Rules

- Don't skip the commit quality check — it's how we maintain a readable history
- Knowledge absorption follows the brainstorm's declared destination — not ad-hoc judgment
- If the brainstorm has no Knowledge Destination section, treat it as `none` but flag it: "This brainstorm predates the
  Knowledge Destination convention. Any knowledge worth capturing?"
- Always ask before deleting brainstorm files
