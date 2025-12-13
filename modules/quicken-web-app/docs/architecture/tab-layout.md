# Tab Layout Architecture

## Overview

Tab groups enable side-by-side viewing of multiple registers/reports, similar to IDE split views.

```
┌─────────────────────────────────────────────────────────────────┐
│ TabGroupContainer                                               │
│ ┌─────────────────────┬───┬─────────────────────┐              │
│ │ TabGroup (50%)      │ ← │ TabGroup (50%)      │              │
│ │ ┌─────┬─────┬─────┐ │ R │ ┌─────┬─────┐       │              │
│ │ │Tab 1│Tab 2│ + ▸ │ │ E │ │Tab 3│ + ▸ │       │              │
│ │ └─────┴─────┴─────┘ │ S │ └─────┴─────┘       │              │
│ │                     │ I │                     │              │
│ │  View Content       │ Z │  View Content       │              │
│ │  (Register/Report)  │ E │  (Register/Report)  │              │
│ │                     │   │                     │              │
│ └─────────────────────┴───┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

Users can drag tabs between groups, resize groups, and create/close groups (max 4). Layout persists to localStorage.

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| TabLayout | `type-definitions/tab-layout.type.js` | Root state: groups, active group, counter |
| TabGroup | `type-definitions/tab-group.type.js` | Group of views with active view tracking |
| View | `type-definitions/view.type.js` | TaggedSum: Register, Report, Reconciliation |
| TabGroupContainer | `src/components/TabGroupContainer.jsx` | Renders groups with resize handles |
| TabGroup | `src/components/TabGroup.jsx` | Tab bar + View.match() content |

## State Structure

```javascript
// TabLayout in Redux state
{
  id: 'tl_main',
  tabGroups: {                    // LookupTable<TabGroup>
    'tg_1': {
      id: 'tg_1',
      views: {                    // LookupTable<View>
        'reg_acc_checking': { id: 'reg_acc_checking', accountId: 'checking', title: 'Checking' }
      },
      activeViewId: 'reg_acc_checking',
      width: 50                   // percentage
    },
    'tg_2': { ... }
  },
  activeTabGroupId: 'tg_1',
  nextTabGroupId: 3               // monotonic counter for new group IDs
}
```

**ID Patterns** (in `type-definitions/field-types.js`):
- View IDs derived from content: `reg_acc_{accountId}`, `rpt_{reportType}`, `rec_{accountId}`
- TabGroup IDs monotonic: `tg_1`, `tg_2`, etc.

## Lazy Hydration Pattern

State hydrates synchronously in `getInitialState()`, eliminating null guards:

```
┌──────────────────────────────────────────────────────────────┐
│ App Startup                                                  │
│                                                              │
│  1. store/hydration.js reads localStorage                    │
│     └─ hydrateTabLayout() reconstructs Tagged types          │
│                                                              │
│  2. reducer.js getInitialState() returns hydrated state      │
│     └─ tabLayout is NEVER null in Redux                      │
│                                                              │
│  3. Components can assume tabLayout exists                   │
│     └─ No null checks, no loading states for layout          │
└──────────────────────────────────────────────────────────────┘
```

Implementation: `src/store/hydration.js`

## Nested State Updates

The `updatePath` helper handles nested LookupTable updates while preserving Tagged types:

```javascript
// Update activeViewId inside a specific group
updatePath(tabLayout, ['tabGroups', groupId, 'activeViewId'], viewId)

// Update with function (for addItemWithId)
updatePath(tabLayout, ['tabGroups', groupId, 'views'], vs => vs.addItemWithId(view))
```

This rebuilds LookupTables and Tagged types along the path, maintaining immutability.

Implementation: `src/store/reducer.js:50`

## Trade-offs

**Enables:**
- Multiple registers/reports visible simultaneously
- Drag-and-drop tab organization
- Layout persistence across sessions
- Exhaustive View rendering via TaggedSum.match()

**Constraints:**
- Max 4 groups (performance, screen real estate)
- Synchronous hydration blocks initial render (acceptable: localStorage is fast)
- View IDs must be deterministic (can't have two tabs for same account)

**When to revisit:**
- If adding view types that need non-deterministic IDs
- If hydration becomes slow (many tabs persisted)
- If need server-synced layouts (currently localStorage only)
