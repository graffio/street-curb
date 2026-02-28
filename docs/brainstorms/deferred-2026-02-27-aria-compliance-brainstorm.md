# ARIA Compliance Foundation

**Date:** 2026-02-27
**Status:** Brainstorm (deferred)

## What We're Building

Mechanical ARIA enforcement via `eslint-plugin-jsx-a11y` plus fixes for 3 known interactive element gaps. Foundation
work — no urgent user need, but prevents a massive retrofit later.

## Why This Matters

The codebase has zero ARIA enforcement. Explicit ARIA attributes exist only in CurbTable (~10 instances). Radix provides
implicit ARIA for dialogs/popovers/menus, but custom interactive elements (clickable divs, sortable headers, collapsible
sections) have no semantic markup. The architecture doc (`docs/architecture/keyboard-interaction.md`) prescribes ARIA
patterns that aren't implemented or enforced.

## Current State

- **Explicit ARIA:** `aria-sort` and `aria-label` in CurbTable/Table only. Zero `aria-expanded`, `aria-selected`,
  `aria-checked`, `aria-pressed`, `aria-live`, `aria-hidden` anywhere in project code.
- **Implicit ARIA:** 25 files use Radix primitives (Dialog, Popover, ContextMenu, Select, Tabs) which provide built-in
  ARIA.
- **Enforcement:** None. No `eslint-plugin-jsx-a11y`, no accessibility tests, no validator rules.
- **Keyboard handlers:** 7 files with `onKeyDown` — none add corresponding ARIA attributes.

## Settled Approach

### Enforcement: eslint-plugin-jsx-a11y with selective promotion

1. Install `eslint-plugin-jsx-a11y`
2. Enable all rules as **warnings**
3. Run once to triage — count violations per rule
4. Promote high-value rules to **errors** immediately:
   - `click-events-have-key-events` — clickable divs must have keyboard handlers
   - `no-static-element-interactions` — divs with handlers need role
   - `role-has-required-aria-props` — roles must have their required attributes
5. Exempt existing violations with COMPLEXITY-TODO (expiry TBD based on triage count)
6. New code must comply from day one

### Fix 3 known interactive element gaps

Absorbed from `specifications/keyboard-accessibility/add-keyboard-to-interactive-elements.md`:

| Element | File | Fix |
|---------|------|-----|
| AccountList section headers | AccountList.jsx | `role="button"` + `tabIndex={0}` + `onKeyDown` + `aria-expanded` |
| DataTable sortable column headers | DataTable.jsx | `role="button"` + `tabIndex` + `onKeyDown` + `aria-sort` |
| Filter chip clear buttons | FilterChips.jsx | Convert to `<button>` + `aria-label="Clear {name} filter"` |

### Out of scope

- **Inline keybinding hints** — separate concern (visual discoverability), kept as its own spec
- **WCAG 2.1.4 key remapping UI** — acknowledged gap in architecture doc, separate work
- **Runtime accessibility testing (axe-core)** — future enhancement after eslint foundation is stable
- **Keyboard filter clearing** — separate spec (`add-keyboard-filter-clearing.md`), different concern

## Knowledge Destination

architecture: docs/architecture/keyboard-interaction.md (update) — add enforcement section documenting eslint-plugin-jsx-a11y setup and rule promotion strategy

## Open Questions

1. **Which eslint rules to promote first?** Triage needed — run the plugin and count violations before deciding.
   The 3 listed above are likely candidates but the full list depends on violation count.
2. **COMPLEXITY-TODO expiry for existing violations?** Depends on triage count. If <20 violations, short deadline.
   If 100+, phased deadlines per rule.
3. **AccountList section headers** — still worth fixing? AccountList UI is planned to change. The section collapse
   toggle was previously deemed low-value for ActionRegistry. ARIA fix is simpler (just add attributes to existing
   element) but may be throwaway work.
