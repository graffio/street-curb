---
name: write-commit-message
description: Write clear, contextual git commit messages that explain problem, solution, and impact. Use when committing code changes, writing commit messages, or organizing commits for PR. Ensures messages are understandable 6 months later without reading the diff.
---

# Write Commit Message

**Goal:** Someone reading this 6 months later should understand why without reading the diff

## Token Efficiency

**Ask first, read code last:**
1. Ask user: "What problem does this solve? What approach did you take?"
2. Run `git status --short` to see which files changed (cheap)
3. Draft message from user's description + file list
4. Only read diffs/files if user can't explain or you need verification

**Token cost:**
- With user input: ~1-5K tokens
- Reading all diffs: ~10-50K tokens (avoid unless necessary)

## Core Principles

1. **Lead with the problem** - Subject line states what problem is solved, not what code changed
2. **Structure: Problem → Solution → Impact** - Reconstruct the missing context
3. **Explain the approach** - Solution should explain HOW, not just list WHAT changed
4. **No jargon without definition** - Future readers may not know your acronyms
5. **Connect to business value** - Why does this matter to users or the business?
6. **Use concrete examples** - "Show a***@domain.com" not "improve redaction"
7. **File-to-purpose mapping** - For complex commits, explain which files serve which purpose
8. **Prefer atomic commits** - One logical change per commit when possible
9. **Self-contained** - Don't assume reader knows the background or discussions
10. **Think git-blame** - This message is the only context someone has

## Template

```
[One-line summary: the problem being solved, ~50 chars]

Problem: What was wrong/missing/broken and why it matters (2-3 sentences)

Solution: Explain the approach with enough detail to understand without
reading the diff. For multi-concern changes, use "Changes by purpose":

Changes organized by purpose:
- Component/directory: What changed and why it's needed
- Component/directory: What changed and why it's needed

Impact: What this enables, prevents, or improves. Connect to user/business value.
```

## When Commits Are Too Large

**Warning signs:**
- Touches >3 subsystems
- Takes >200 words to explain
- "Changes by purpose" has >4 items
- You'd struggle to name it in one sentence

**Consider splitting unless:**
- Changes can't work independently
- Would break the build between commits
- Single atomic refactoring (e.g., rename across codebase)

## Example: Complex Multi-File Commit

```
Refactor submitActionRequest for atomic transactions and centralized logging

Problem: Request handling had three issues: (1) metadata validation happened
outside transactions, creating race conditions where timestamps could be
tampered with between validation and storage, breaking audit trail integrity
for SOC2, (2) logging was scattered across 11 handlers making it hard to
trace request flow, (3) handlers coupled to logging infrastructure.

Solution: Centralize validation and logging at endpoint level. Move metadata
validation inside Firestore transaction to make read-validate-write atomic.
Remove logger from all handlers - they now throw descriptive errors instead.
Add single logger.info() call at endpoint success with full request context.

Changes organized by purpose:
- submit-action-request.js: Move validation inside transaction, add centralized
  logging at endpoint level with PII redaction
- Handlers (handle-*.js): Remove logger parameter, throw errors for failures
- action.js, action.type.js: Add smart PII redaction (a***@domain.com, J*** D***)
- logger-dev.js, logger-production.js: Add info/warn methods, remove flow tracking
- blockface.js: Add toLog() for consistent logging format
- Tests: Update for new error handling pattern

Impact: Eliminates time-of-check-time-of-use vulnerability in metadata validation,
ensuring tamper-proof audit trails. Simplifies debugging with all request context
in single log entry. Reduces logging noise from ~5 entries to 1 per request.
Transaction time increases 10-50ms (acceptable for security guarantee).
```

## Process

1. Identify the problem: Why did this change need to happen?
2. Explain the approach: What did you do and why that way?
3. Map files to purposes: Which files changed for which reason? (if complex)
4. State the impact: What's better now?
5. Check for jargon: Would someone new understand this?

## Common Mistakes

- ❌ "Refactor code" / "Fix bugs" / "Update tests" (says nothing)
- ❌ "WIP" or "Address PR feedback"
- ❌ Listing files changed instead of explaining approach
- ❌ Assuming reader was in meetings or read specs
- ❌ Using jargon without definition
- ❌ No explanation of WHY this change was needed
