---
name: workflows:wrap-up
description: Finish a feature — commit quality, knowledge capture, architecture decisions, cleanup
argument-hint: "[optional: brief context]"
---

# Wrap Up

Run after completing a feature or fixing a non-trivial bug. Handles everything that happens after code is done.

## Steps

### 1. Integration Test Verification

If the work modified `.jsx` files in `quicken-web-app/src/`, run affected integration tests before reviewing commits:

```bash
cd modules/quicken-web-app
grep -l 'ComponentName' test/*.integration-test.js  # find the right test file
yarn tap:file test/{feature}.integration-test.js
```

Find the right test file by grepping ABOUTME comments for the component name. Each test file's ABOUTME lists the components it covers.

**If no `.jsx` files were modified:** Skip to step 2.

### 2. Commit Quality Check

Review commits since branch diverged from main:

```bash
git log main..HEAD --oneline
```

Check each commit message for Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`).

**If commits lack this format or are disorganized:**
- Present the issue to the user
- Offer to reorganize using `.claude/tasks/reorganize-commits.md`
- **[CHECKPOINT]** — get approval before any history rewriting

**If commits look good:** Move to step 3.

### 3. Knowledge Capture

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

### 4. Architecture & Decisions

**If architectural decisions were made during this work:**
- Significant patterns → create doc in `docs/architecture/`
- Quick decisions → append to project-local `docs/decisions.md`:
  ```markdown
  ### YYYY-MM-DD: Title
  Context/Decision/Why (1 sentence each)
  ```

**If no architectural decisions:** Skip.

### 5. Artifact Cleanup

- Delete `.claude/current-task.json`
- Ask about stale spec files: "Delete specifications/{spec-used-for-this-work}.md?"
- Check for brainstorm files linked from the spec or current-task.json (`docs/brainstorms/`). Delete if fully consumed; keep if unresolved ideas remain. Always ask before deleting.

## Rules

- Don't skip the commit quality check — it's how we maintain a readable history
- Knowledge capture is judgment — not every fix deserves a doc
- Always ask before deleting spec or brainstorm files
- After all steps complete, `git add` and `git commit` any files created, modified, or deleted during wrap-up
