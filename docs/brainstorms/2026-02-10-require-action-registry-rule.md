# Require ActionRegistry Validator Rule

**Date:** 2026-02-10
**Status:** Brainstorm
**Scope:** `modules/cli-style-validator/src/lib/rules/`

## Problem

Two keyboard accessibility gaps have no mechanical enforcement:

1. **Mouse-only components** — A component has `onClick` but no keyboard equivalent. Users who navigate by keyboard can't access that interaction.
2. **Hardcoded key names** — A component references specific keys (`'ArrowDown'`, `'Escape'`, etc.) directly instead of going through `ActionRegistry` / `DEFAULT_BINDINGS`. Users can't remap these.

Both violations share the same fix: migrate to `ActionRegistry.register()`.

## Rule Design

**Rule name:** `require-action-registry`
**File scope:** `*.jsx` only (skip test files via `PS.isTestFile`)
**One rule, two violation types.**

### Check 1: onClick without keyboard equivalent

**AST signal:** File contains JSX attribute `onClick` but no `ActionRegistry.register` call.

**Detection:** File-level scan.
- Collect all JSX attributes named `onClick`
- Scan all call expressions for `ActionRegistry.register`
- If onClick found AND no ActionRegistry found → flag each onClick location

**Message:**
```
onClick at line {N} without ActionRegistry. FIX: Register keyboard equivalent via ActionRegistry.register().
```

**Current impact (as of 2026-02-18):** 8 files would flag:
- TabGroup.jsx
- AccountList.jsx
- SearchChip.jsx
- FileOpenDialog.jsx
- ReportsList.jsx
- KeymapDrawer.jsx
- CellRenderers.jsx
- InvestmentReportColumns.jsx

5 files already have ActionRegistry and would pass: SearchFilterChip, DateFilterChip, FilterChipPopover, RootLayout, DataTable.

### Check 2: Hardcoded key names

**AST signal:** String literal matching a known key name, or `event.key` / `event.code` member expression, outside of `DEFAULT_BINDINGS` definition or `ActionRegistry` callback.

**Key name set:**
```
ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
Enter, Escape, Tab, Home, End, PageUp, PageDown, ' ' (space)
```

Plus any single alphabetic character used in a `=== event.key` or `case` context (for letter shortcuts).

**Detection:** Node-level walk.
- Find string literals matching the key name set
- For each match, check if ancestor is a `DEFAULT_BINDINGS` object or inside an `ActionRegistry.register` callback
- If neither → flag

**Message:**
```
Hardcoded key name '{keyName}' bypasses keymap system. FIX: Move to DEFAULT_BINDINGS and use ActionRegistry.register().
```

**Current impact (as of 2026-02-18):** SearchChip.jsx would flag (`'Escape'`, `'Enter'` key checks, no ActionRegistry). SearchFilterChip.jsx has `'Escape'` — needs verification whether it's inside an ActionRegistry callback (exempt) or not. DataTable.jsx has `'ArrowDown'`, `'ArrowUp'` inside ActionRegistry execute functions — exempt.

## Exemption Mechanism

Standard `COMPLEXITY: require-action-registry — {reason}` comment at file level (same as all other rules via `FS.withExemptions`).

**Valid exemption reasons:**
- `focused-input handling` — Component manages keystrokes within a focused text input (e.g., KeyboardDateInput)
- `native form control` — Browser handles keyboard behavior (form submit on Enter)

## Implementation Shape

Follows existing rule conventions (section separators, `withExemptions` wrapper). Matches `check-react-redux-separation.js` export pattern (bare function, not namespace object):

```
P = { isOnClickJSXAttribute, isOnKeyDownJSXAttribute, isActionRegistryCall, isHardcodedKeyLiteral, isEventKeyAccess }
T = { toKeyNameFromLiteral }
F = { createOnClickWithoutKeyboardViolation, createOnKeyDownWithoutRegistryViolation, createHardcodedKeyViolation }
V = { check }
A = { hasActionRegistry, collectOnClickViolations, collectOnKeyDownViolations, collectHardcodedKeyViolations }

const checkRequireActionRegistry = FS.withExemptions('require-action-registry', V.check)
export { checkRequireActionRegistry }
```

## Resolved Questions

1. **`onKeyDown` without ActionRegistry** — Yes, flag it. Adds a third check: bare `onKeyDown` handler with no `ActionRegistry.register` in the file.
2. **Design-system scope** — Moot. Design-system package dissolved; components moved to quicken-web-app. All .jsx files in scope.
3. **Priority** — 7.
