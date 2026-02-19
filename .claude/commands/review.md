---
description: Quick quality review of a file or staged changes
argument-hint: "<file path> or 'staged'"
allowed-tools: Bash, Read, Glob, Grep, Task
---

# Review: $ARGUMENTS

Run a quality review on the target. This is a quick check during development, not a full PR review.

## Determine Target

- If `$ARGUMENTS` is `staged` → review all staged JS/JSX files
- Otherwise → review the specified file

## For Staged Files

```bash
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(jsx?)$' | grep -v -e 'src/types/' -e 'type-definitions/' -e 'cli-style-validator/'
```

## Process

1. **Run style validator** on each file:
   ```bash
   node modules/cli-style-validator/src/cli.js <file>
   ```
   Report any violations.

2. **Spawn two review agents in parallel** using Task tool:
    - `jeff-js-reviewer` — judgment calls (naming, layer placement, pattern choice, fail-fast)
    - `code-simplicity-reviewer` — unnecessary abstractions, pointless indirection

3. **Combine results** into a single report:

```markdown
## Review: <target>

### Validator

- <violations or "Clean">

### Style Review (jeff-js-reviewer)

- <blocking / non-blocking findings>

### Simplicity Review (code-simplicity-reviewer)

- <findings>

### Summary

X blocking issues, Y non-blocking. Recommendation: APPROVE / REQUEST CHANGES
```

If no issues found across all three checks, say "Clean" and stop.
