---
title: FilterChips directory extraction — validator lessons
date: 2026-02-17
category: architecture
tags:
  - style-validator
  - file-extraction
  - complexity-todo
  - function-ordering
module: modules/quicken-web-app
symptoms:
  - Pre-commit fails after extracting monolithic file into directory
  - COMPLEXITY-TODO not suppressing violations after split across lines
  - function-declaration-ordering violations in React components
  - Exported function defined inside cohesion group
severity: medium
---

# FilterChips Directory Extraction — Validator Lessons

## Root Causes

### 1. COMPLEXITY-TODO parser is line-by-line

The COMPLEXITY-TODO comment was split across two lines for readability:
```js
// COMPLEXITY-TODO: react-redux-separation
// — useEffect for ActionRegistry lifecycle (expires 2026-04-01)
```

The parser uses `parseSingleComplexityComment` per line. Line 1 matches the base pattern but finds no reason after the rule name. Line 2 is not recognized as a COMPLEXITY comment at all.

**Fix:** Single line, shorten the reason text:
```js
// COMPLEXITY-TODO: react-redux-separation — ActionRegistry useEffect awaits non-React mechanism (expires 2026-04-01)
```

### 2. Exported functions cannot live in cohesion groups

`makeChipTriggerStyle` was inside an `F = { ... }` group, then re-exported via `ChipStyles`. Validator rule: exported functions must be at module level, cohesion groups are for internal helpers only.

**Fix:** Move function to module level, reference directly in namespace export.

### 3. function-declaration-ordering: functions before ANY non-function statement

The rule scans each block top-to-bottom. Once it encounters any non-function statement (`const POPOVER_ID = 'search'`), ALL subsequent function declarations are violations — even if they appear before hooks.

**Fix:** For components with multi-line handlers that can't be inlined: put handlers at the very top of the component body, inline the popover ID string directly. For components where all handlers are one-liners: inline them in JSX props (no named handler declarations needed).

### 4. `select` is a vague verb prefix

`selectHighlighted` was flagged by function-naming. The validator treats `select/get/extract/derive/fetch` as vague prefixes.

**Fix:** Use a more specific verb — `applyHighlightedDateRange`.

## Prevention

- When splitting files, run `node modules/cli-style-validator/src/cli.js <file>` on each new file before attempting commit
- COMPLEXITY-TODO comments must always be single-line
- When extracting components with named handlers, prefer inlining one-line handlers in JSX props to avoid function-declaration-ordering issues

## Problem

Extracting an 813-line monolithic `FilterChips.jsx` into a `filter-chips/` directory (one file per chip) caused multiple validator failures that weren't present in the original file.
