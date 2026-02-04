# Keyboard Accessibility Plan

## Goal
Enable full keyboard navigation for filter chips and other mouse-only interactions.

## Design Decision: FilterChipPopover Component

New design system component that wraps Radix Popover with keyboard navigation plumbing. Prevents each chip from
reimplementing the same keyboard pattern independently.

**What it handles:**
- Chip trigger (label, count badge, clear button)
- Popover open/close
- Keymap registration/unregistration when popover is open
- Arrow key navigation (highlighted index, scrollIntoView)
- Enter to select/toggle, Escape to dismiss
- Optional search input with item filtering

**Phase 1 scope: multi-select only.** Single-select mode added in Phase 3 when needed (YAGNI).

**Popover state management:** Uses controlled `Popover.Root` with explicit `open`/`onOpenChange` so the component
knows when to register/unregister keymaps. CategorySelector manages its own `isOpen` via useState; FilterChipPopover
needs the same awareness but via controlled Radix Popover props.

**Relationship to CategorySelector:** CategorySelector remains independent. FilterChipPopover provides the same
navigable-list-in-a-popover pattern but generalized for any item shape (`{ id, label }` instead of strings). If
duplication becomes a problem later, CategorySelector can be refactored to use FilterChipPopover internally.

### Account chip specifically

AccountFilterChip should work like CategoryFilterChip — a multi-select with search input so users can find accounts by
name when they have many accounts. Currently it's a plain checkbox list that assumes few accounts.

## Scope (Priority Order)

### Phase 1: FilterChipPopover + Account Search

Build the generic component and migrate AccountFilterChip as the first consumer, adding search capability.

**Deliverables:**
- `FilterChipPopover` design system component with keyboard navigation
- AccountFilterChip migrated to use it, with search input
- Keyboard shortcuts visible in drawer when popover is open

**Files:**
- NEW: `modules/design-system/src/components/FilterChipPopover.jsx`
- MODIFY: `modules/quicken-web-app/src/components/FilterChips.jsx` (AccountFilterChip)
- MODIFY: `modules/design-system/src/index.js` (export)

### Phase 2: Remaining Multi-Select Chips

Migrate SecurityFilterChip and ActionFilterChip to FilterChipPopover.

- SecurityFilterChip — searchable (users may have many securities)
- ActionFilterChip — searchable optional (18 static items, but consistent behavior is worth it)

### Phase 3: Single-Select Chips

Migrate GroupByFilterChip and DateFilterChip to FilterChipPopover in single-select mode.

- GroupByFilterChip — Enter selects + closes popover
- DateFilterChip — Enter selects + closes (except "Custom Dates" which keeps popover open)

### Phase 4: Clear Buttons & Badges
- Clear buttons (x) on chips — keyboard handler (Delete or Backspace when focused)
- SelectedBadge removal — make keyboard accessible

### Phase 5: Report Pages
- Add DataTable keyboard nav to CategoryReportPage and InvestmentReportPage
- Add expand/collapse keymaps for tree rows

### Phase 6: TabGroup
- Tab switching via keyboard (Ctrl+Tab or arrow keys)
- Consider: tab reordering via keyboard

### Phase 7: Other
- AccountList section collapse (convert Flex to Button)
- Table header sorting (Enter/Space)
- KeymapDrawer Escape to close

## Design Decisions

### FilterChipPopover API (sketch, subject to checkpoint review)

Phase 1 — multi-select only:

```
FilterChipPopover
  trigger          Chip appearance — label text, selection count, optional clear callback
  items            [{ id, label }] — the navigable options
  selectedIds      [String] — which items are selected
  onToggle         id -> void (toggle an item)
  searchable       Boolean — show search input with item filtering
  renderItem       Optional custom item renderer
  keymapId         String — unique keymap identifier
  keymapName       String — display name in keyboard drawer
  onRegisterKeymap, onUnregisterKeymap — keymap lifecycle
```

Phase 3 will add `selectedId`/`onSelect` for single-select mode.

### Testing strategy

- **Pure logic (TAP):** Keymap factory, item filtering, index wrapping — extracted into cohesion groups
- **Keyboard interactions (agent-browser):** Smoke tests verify arrow keys, Enter, Escape, search filtering end-to-end
- **No React component TAP tests:** No precedent in codebase; CategorySelector has none either

### CheckboxRow keyboard pattern
Current: `<Flex onClick={...}><Checkbox /><Text /></Flex>`
Options:
1. Add onKeyDown to Flex + tabIndex (minimal change)
2. Make entire row a `<label>` wrapping real checkbox input (semantic)
3. Use Radix Checkbox with proper labeling

**Recommendation:** Option 1 for now (matches CategorySelector pattern), option 2 as future improvement.

### SelectableOption keyboard pattern
Current: `<Box onClick={...}>` wrapped in `<Popover.Close>`
Same options as above. Arrow key navigation + Enter to select.
