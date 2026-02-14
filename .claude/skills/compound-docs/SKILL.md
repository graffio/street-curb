---
name: compound-docs
description: Capture solved problems as categorized documentation with YAML frontmatter for fast lookup
allowed-tools:
  - Read
  - Write
  - Grep
---

# Document a Solution

Capture a non-trivial solved problem in `docs/solutions/` for future sessions.

**Skip for:** typos, obvious syntax errors, trivial one-line fixes.
**Capture when:** investigation took multiple attempts, solution was non-obvious, or future sessions would benefit.

## Process

### 1. Gather Context from Conversation

Extract:
- **Module**: Which module had the problem (e.g., quicken-web-app, functional, keymap)
- **Symptoms**: Exact error messages or observable behavior
- **What didn't work**: Failed investigation attempts and why they failed
- **Root cause**: Technical explanation of the actual problem
- **Solution**: What fixed it (with code)
- **Prevention**: How to catch this early next time

If critical context is missing, ask before proceeding.

### 2. Check for Existing Similar Docs

```
Grep: pattern="[key symptom or error message]" path=docs/solutions/ output_mode=files_with_matches -i=true
```

If a similar doc exists: cross-reference it, don't duplicate.

### 3. Choose Category and Write

Pick the best-fit category directory:

| Category | For |
|----------|-----|
| `architecture/` | Structural patterns, layer violations, decomposition decisions |
| `runtime-errors/` | Exceptions, crashes, unexpected behavior at runtime |
| `test-failures/` | Test infrastructure, flaky tests, test isolation |
| `integration-issues/` | Cross-module problems, external service issues, data flow bugs |
| `workflow-issues/` | Development process, Claude behavior, SDLC lessons |

Create the file at `docs/solutions/{category}/{kebab-case-title}.md` using this structure:

```markdown
---
title: [Clear problem title]
date: YYYY-MM-DD
category: [directory name]
module: [module name]
tags: [keyword1, keyword2, keyword3]
symptoms:
  - [Exact error message or observable behavior]
  - [Second symptom if applicable]
---

# [Title]

## Problem
[1-2 sentences: what was wrong and why it matters]

## Symptoms
- [What you actually saw — exact error messages, unexpected behavior]

## What Didn't Work
**[Attempt 1]:** [What was tried]
- Why it failed: [Technical reason]

## Solution
[The fix, with code examples]

## Why This Works
[Root cause explanation — what was actually wrong and why the fix addresses it]

## Prevention
- [How to catch this early]
- [What to watch for]

## Related
- [Links to related docs/solutions/ files, if any]
```

### 4. Confirm

Report the file path and a one-line summary. Done.

## Quality Checklist

Good docs have: exact error messages, file:line references, failed attempts documented, code examples (before/after), technical "why" explanation, prevention guidance.

Bad docs have: vague descriptions ("something was wrong"), missing code examples, no "why" explanation, no prevention guidance.
