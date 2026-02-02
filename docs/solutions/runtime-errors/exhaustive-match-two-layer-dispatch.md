---
title: Exhaustive match missed in command dispatch layer on new action variants
category: runtime-errors
module: quicken-web-app
tags: [tagged-sum, action-dispatch, exhaustive-matching, post-js, reducer]
symptoms:
  - "Uncaught TypeError: Constructors given to match didn't include: ToggleAccountFilter"
date: 2026-02-02
---

# Two-layer exhaustive matching in Redux action dispatch

## Problem

Adding 5 new Tagged Sum action variants caused a runtime crash on any action dispatch:

```
Uncaught TypeError: Constructors given to match didn't include: ToggleAccountFilter
```

The reducer's exhaustive `action.match()` was updated correctly. The crash came from a different file.

## Root Cause

Actions route through two independent exhaustive `match()` statements:

1. **`src/commands/post.js`** — command dispatch layer, routes actions for persistence side effects (IndexedDB writes for table layouts, tab layout, account prefs)
2. **`src/store/reducer.js`** — root reducer, handles state transformation

`post.js` runs first. Its match rejected the new variants before they reached Redux.

## Solution

Added the 5 missing variants to `post.js`'s `action.match()` as dispatch-only handlers:

```javascript
ToggleAccountFilter    : () => dispatch(action),
ToggleSecurityFilter   : () => dispatch(action),
ToggleActionFilter     : () => dispatch(action),
AddCategoryFilter      : () => dispatch(action),
RemoveCategoryFilter   : () => dispatch(action),
```

No persistence needed for filter toggles — they just forward to Redux.

## Why this was missed

- `post.js` isn't obviously a "second match site" — it's a command layer, not a reducer
- The error message doesn't indicate *which file's* match is failing
- The `add-redux-action.md` task template covered `reducer.js` but not `post.js`

## Prevention

- When adding Action variants, grep for `action.match(` to find ALL exhaustive match sites
- Updated mental model: Action variants must be added to **both** `reducer.js` and `post.js`
- Consider adding an integration test that dispatches every Action variant end-to-end

## Related

- [Tab layout architecture](../../modules/quicken-web-app/docs/architecture/tab-layout.md) — documents TaggedSum exhaustive matching patterns
- [Decisions log](../../modules/quicken-web-app/docs/decisions.md) — action naming conventions
