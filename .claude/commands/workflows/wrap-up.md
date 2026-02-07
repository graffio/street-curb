---
name: workflows:wrap-up
description: Finish a feature — commit quality, knowledge capture, architecture decisions, cleanup
argument-hint: "[optional: brief context]"
---

# Wrap Up

Run after completing a feature or fixing a non-trivial bug. Handles everything that happens after code is done.

## Steps

### 1. Commit Quality Check

Review commits since branch diverged from main:

```bash
git log main..HEAD --oneline
```

Check each commit message for Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`).

**If commits lack this format or are disorganized:**
- Present the issue to the user
- Offer to reorganize using interactive rebase
- **[CHECKPOINT]** — get approval before any history rewriting

**If commits look good:** Move to step 2.

### 2. Knowledge Capture

Determine if a non-trivial problem was solved during this work. Trivial = obvious fix, typo, small config change.

**If non-trivial:**

1. Search `docs/solutions/` for existing solutions in the same domain:
   ```bash
   ls docs/solutions/*/
   ```
2. If near-duplicate found: ask "Similar to existing: [path]. Update existing doc, or create new?"
3. If no duplicate: generate a solution doc using the `compound-docs` skill format:
   - File: `docs/solutions/{category}/{slug}.md`
   - YAML frontmatter with tags, category, module, symptoms
   - Sections: Problem, Investigation, Root Cause, Solution, Prevention

**If trivial:** Skip. Not every change needs a solution doc.

### 3. Architecture & Decisions

**If architectural decisions were made during this work:**
- Significant patterns → create doc in `docs/architecture/`
- Quick decisions → append to project-local `docs/decisions.md`:
  ```markdown
  ### YYYY-MM-DD: Title
  Context/Decision/Why (1 sentence each)
  ```

**If no architectural decisions:** Skip.

### 4. Artifact Cleanup

- Delete `.claude/current-task.json`
- Delete `.claude/active-goal.md`
- Ask about stale spec files: "Delete specifications/{spec-used-for-this-work}.md?"

## Rules

- Don't skip the commit quality check — it's how we maintain a readable history
- Knowledge capture is judgment — not every fix deserves a doc
- Always ask before deleting spec files
