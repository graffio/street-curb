# Drawer-Hover Highlight

**Date:** 2026-02-27
**Status:** Brainstorm

## What We're Building

When the `?` keyboard shortcuts drawer is open, hovering a drawer row highlights the corresponding UI element (e.g., the filter chip that the shortcut controls). This helps users learn the spatial mapping between shortcuts and their targets.

## Why This Matters

The drawer lists shortcuts by category, but users must mentally map each entry to its UI element. Highlighting bridges that gap — you hover "Accounts (a)" in the drawer and the Accounts chip lights up. This is the missing "where does this go?" signal.

## Settled Decisions

- **Drawer-hover highlighting only** — no inline badges, no always-visible hints
- **Spike scope: filter chips only** — they have known trigger elements and action IDs; expand later if the pattern works
- **Visual style: designer's choice** — spike something that looks good (pulse, glow, outline), judge from result
- **Drawer rows are not clickable** — read-only reference for now (command-palette behavior deferred)

## Key Technical Observations

- `showDrawer` is a Redux boolean — any component can subscribe via `useSelector(S.showDrawer)`
- ActionRegistry holds action IDs but no DOM references
- Filter chip trigger buttons use ref callbacks keyed by `triggerId + '\t' + viewId`
- `toReverseBindings` exists in `keymap-routing.js` (actionId -> keys) but is not exported
- The gap: no mechanism to look up a DOM element from an action ID. The spike needs to introduce one — likely a lightweight element registry or data attributes on trigger elements.

## Spike Approach

The spike should determine whether drawer-hover highlighting feels useful and whether the DOM-lookup mechanism is clean enough to keep.

Candidate approaches for the spike:
1. **Data attributes** — put `data-action-id="filter:accounts"` on trigger buttons, query the DOM on hover
2. **Element registry** — lightweight Map of actionId -> DOM element, populated by existing ref callbacks
3. **Event-based** — drawer row emits a custom event, chip listens and highlights itself

## Knowledge Destination

- `none` — spike validation only; if promoted, architecture doc gets written during implementation

## Open Questions

- Does the highlight feel useful enough to ship, or is the drawer alone sufficient?
- Should non-filter elements (search, table nav) get this treatment later?
- If we go with data attributes, is querying the DOM on hover acceptable or too imperative?
