---
title: Fixing cohesion group leaks — flat module export pattern
date: 2026-02-12
category: architecture
tags:
  - cohesion-groups
  - export-structure
  - refactoring
  - style-validator
module: modules/quicken-web-app
symptoms:
  - "export { E as FileHandling }" — cohesion group exported directly with rename
  - "const X = { P, T, E }; export { X }" — object wrapping cohesion group letters
  - Consumers see internal P/T/E structure (FileHandling.openFile is really E.openFile)
  - Callers destructure with "const { T, E } = RegisterPage"
severity: medium
---

# Fixing Cohesion Group Leaks — Flat Module Export Pattern

## Problem

Two patterns leak internal cohesion group structure through the module boundary:

**Pattern 1 — Direct rename:**
```js
const E = { openFile, reopenFile, loadStoredHandle }
export { E as FileHandling }
```

**Pattern 2 — Object wrapping groups:**
```js
const RegisterPage = { P, T, E }
export { RegisterPage }
// Caller: const { T, E } = RegisterPage; T.toTableLayoutId(...)
```

Both expose P/T/E to consumers, coupling them to internal organization. If a function moves between groups
(e.g., T → E because it gains a side effect), all callers break.

## Solution

Mechanical recipe applied 5 times (register-page.js, file-handling.js, keymap-routing.js, storage.js,
hydration.js):

### Step 1: Identify external vs internal functions

Read all callers. Functions accessed as `Module.functionName(...)` are external. Functions only called within
the file (by other P/T/E members) are internal.

### Step 2: Move external functions to module level

```js
// Before: inside E group
const E = {
    openFile: async (store) => { ... },
    reopenFile: async (store) => { ... },
}

// After: module level
const openFile = async (store) => { ... }
const reopenFile = async (store) => { ... }
```

### Step 3: Keep internal helpers in cohesion groups

```js
const P = {
    isTestMode: () => new URLSearchParams(window.location.search).has('testFile'),
}
const T = {
    toTestFixtureUrl: () => `test-fixtures/${...}`,
}
```

### Step 4: Create flat export object

```js
const FileHandling = { openFile, reopenFile, loadStoredHandle, openNewFile, loadTestFileIfPresent }
export { FileHandling }
```

### Step 5: Update callers (if needed)

If callers destructured groups (`const { T, E } = RegisterPage`), change to flat access:
```js
// Before
const { T, E } = RegisterPage
T.toTableLayoutId('account', id)
E.navigateToMatch(data, matches, id, viewId, 1)

// After
RegisterPage.toTableLayoutId('account', id)
RegisterPage.navigateToMatch(data, matches, id, viewId, 1)
```

If callers already used `Module.functionName(...)`, no changes needed.

## Key Details

- **Internal cross-references**: When a module-level function calls another module-level function, drop the
  group prefix. `E.openNewFile` calling `E.openFile` becomes `openNewFile` calling `openFile` directly.
- **Validator detection**: The export-structure rule detects both patterns — checks `localName` on export
  specifiers for direct renames, and checks property names on exported objects for group letters.
- **No caller changes when export name is stable**: If the module already exported as `FileHandling` and
  callers used `FileHandling.openFile(...)`, the flat refactoring is invisible to consumers.
