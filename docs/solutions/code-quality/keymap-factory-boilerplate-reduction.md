---
title: Consolidate keymap factory boilerplate with KeymapModule.fromBindings
date: 2026-02-04
category: code-quality
tags:
  - keymap
  - factory-pattern
  - boilerplate-elimination
  - naming-collision
module: modules/keymap
symptoms:
  - Repeated Intent/Keymap/LookupTable construction in every keymap site
  - Per-component factory functions with identical structure
  - Naming collision requiring FilterChipPopoverLogic alias in design-system exports
severity: medium
---

# Keymap Factory Boilerplate Reduction

## Problem

Every keymap creation in the codebase repeated 4 identical boilerplate steps:
1. Destructure `{ Intent, Keymap }` from KeymapModule
2. Create Intent objects manually
3. Wrap in `LookupTable([...], Intent, 'description')`
4. Call `Keymap(id, name, priority, blocking, activeForViewId, intents)`

This led to 6 per-component factory functions that were structurally identical:
- `F.createCategorySelectorKeymap` in CategorySelector.jsx
- `F.createDateInputKeymap` in KeyboardDateInput.jsx
- `F.createKeymap` in filter-chip-popover.js
- `F.createDataTableKeymap` in DataTable.jsx
- `F.createGlobalKeymap` in RootLayout.jsx
- `F.createRegisterKeymap` in tab-layout.js reducer

The `filter-chip-popover.js` file also caused a naming collision requiring the awkward `FilterChipPopoverLogic` alias in design-system exports.

## Root Cause

No centralized factory existed for keymap creation. Each component independently implemented the same plumbing, leading to code duplication and one naming collision.

## Solution

Added `KeymapModule.fromBindings()` factory to `modules/keymap/src/index.js`:

```javascript
const F = {
    // Creates a Keymap from a plain array of binding specs
    // @sig fromBindings :: (String, String, [{ description, keys, action }], Options?) -> Keymap
    fromBindings: (id, name, bindings, { priority = 10, blocking = false, activeForViewId = null } = {}) => {
        const intents = LookupTable(
            bindings.map(({ description, keys, action }) => Intent(description, keys, action)),
            Intent,
            'description',
        )
        return Keymap(id, name, priority, blocking, activeForViewId, intents)
    },
}
```

Priority defaults to 10 (view-level) since 4 of 5 call sites use that. Global keymap passes `{ priority: 0 }`.

Migrated all 6 call sites, then deleted `filter-chip-popover.js` and its test (dead code).

## Key Code Changes

**Before** (each component had its own factory):
```javascript
const F = {
    createCategorySelectorKeymap: (keymapId, keymapName, moveDown, moveUp, toggle, dismiss) => {
        const { Intent, Keymap } = KeymapModule
        const intents = LookupTable([
            Intent('Move down', ['ArrowDown'], moveDown),
            Intent('Move up', ['ArrowUp'], moveUp),
            Intent('Toggle', ['Enter'], toggle),
            Intent('Dismiss', ['Escape'], dismiss),
        ], Intent, 'description')
        return Keymap(keymapId, keymapName, 10, false, null, intents)
    },
}
```

**After** (inline, no factory needed):
```javascript
return KeymapModule.fromBindings(keymapId, keymapName, [
    { description: 'Move down', keys: ['ArrowDown'], action: moveDown },
    { description: 'Move up', keys: ['ArrowUp'], action: moveUp },
    { description: 'Toggle', keys: ['Enter'], action: toggleCategory },
    { description: 'Dismiss', keys: ['Escape'], action: dismiss },
])
```

**Files modified:**
- `modules/keymap/src/index.js` -- Added `fromBindings` to F group and KeymapModule export
- `modules/design-system/src/components/CategorySelector.jsx` -- Removed F group, inline `fromBindings`
- `modules/design-system/src/components/KeyboardDateInput.jsx` -- Removed F group, inline `fromBindings`
- `modules/design-system/src/components/DataTable.jsx` -- Removed F group, inline `fromBindings`
- `modules/quicken-web-app/src/components/FilterChips.jsx` -- Replaced `FilterChipPopoverLogic.createKeymap`
- `modules/quicken-web-app/src/components/RootLayout.jsx` -- Extracted T.toGlobalKeymap, use `fromBindings`
- `modules/quicken-web-app/src/store/reducers/tab-layout.js` -- Replaced factory with `fromBindings`

**Files deleted:**
- `modules/design-system/src/components/filter-chip-popover.js` (dead code)
- `modules/design-system/src/components/filter-chip-popover.tap.js` (test for deleted module)

## Prevention

**Signal to watch for:** If you see `Keymap(id, name, priority, blocking, viewId, intents)` being constructed manually, or a new `F.create*Keymap` factory, use `KeymapModule.fromBindings()` instead.

**For new interactive components:**
1. Create binding specs: `[{ description, keys, action }]`
2. Call `KeymapModule.fromBindings(id, name, bindings, options)`
3. Register via Redux Action

No custom factory needed.

## API Quick Reference

```javascript
KeymapModule.fromBindings(id, name, bindings, options?)
```

- `id` (String) -- Unique keymap identifier
- `name` (String) -- Display name for KeymapDrawer
- `bindings` ([{ description, keys, action }]) -- Array of binding specs
- `options.priority` (Number, default 10) -- 10 = view-level, 0 = global
- `options.blocking` (Boolean, default false) -- Prevents event propagation
- `options.activeForViewId` (String, default null) -- View ID for scoped keymaps

## Related

- `docs/architecture/keymap-system.md` -- Full keymap module design
- `docs/solutions/architecture/migrate-component-state-to-redux.md` -- SelectableListPopover Redux migration
- `specifications/keyboard-accessibility/component-owned-keymaps.md` -- Next phase: components own their keymap lifecycle
- `specifications/keyboard-accessibility/plan.md` -- Overall keyboard accessibility plan
