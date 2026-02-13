# React Component Style Card

Components are **wiring** between selectors (reads) and actions (writes). No logic beyond show/hide.

## Structure

Config constants → P/T groups (module level) → helper components → exported component(s) LAST.

**Don't over-extract.** Extract when: used 3+ times, a name clarifies non-obvious logic, or indentation forces a line break. Leave self-documenting expressions inline (`MY_SET.has(x)`, `obj.field`).

## Handlers

- Handlers call `post(Action.X(...))` or a command function (e.g. `RegisterPage.updateSorting`). Nothing else.
- No data prep in handlers — if you need to transform before dispatching, that belongs in the command function or reducer.

## Hooks

**The only hook allowed in app components is `useSelector`.** Zero exceptions.

No `useCallback`, `useEffect`, `useRef`, `useMemo`, `useState` in `quicken-web-app/src/**/*.jsx`.

**Exemption:** Design-system wrapper components (`DataTable.jsx`, `KeyboardDateInput.jsx`, `SelectableListPopover.jsx`) may use third-party library hooks (useReactTable, useVirtualizer, useSortable) — these are unavoidable API surfaces.

### Dispatch-Intent Pattern (replaces useCallback)

Handlers call command functions that read state from the store. Component only passes stable identifiers.

```jsx
onSortingChange={updater => RegisterPage.updateSorting(tableLayoutId, updater)}
```

The command function (in a service module) reads current state via `currentStore()`, resolves the updater, and dispatches a data-only Action. No closure over Redux state in the component.

### Selector-with-Defaults (replaces init useEffect)

Selectors return a default when state is empty. No mount-time effects needed.

```jsx
const tableLayout = useSelector(state => S.tableLayoutOrDefault(state, tableLayoutId, columns))
```

### FocusRegistry Ref Callbacks (replaces useRef for DOM)

Register DOM elements via ref callbacks (a JSX attribute, not a hook). FocusRegistry is a plain JS module.

```jsx
<input ref={el => {
    if (el) FocusRegistry.register(`search_${viewId}`, el)
    else FocusRegistry.unregister(`search_${viewId}`)
}} />
```

Keyboard system calls `FocusRegistry.focus(id)` directly.

### Router Page Titles (replaces SetPageTitle useEffect)

Pages don't dispatch their own title. The routing layer handles page title dispatch.

## Actions (Keyboard System)

Interactive components register actions via `ActionRegistry.register()`:
- Accept `actionContext` prop (viewId or null for global)
- Registration and cleanup happen in the service layer, not in React effects
- Never reference specific key names — keybindings live in `DEFAULT_BINDINGS` (keymap-routing.js)

## Layer Check

If you're writing filter/map/reduce chains, conditional logic beyond JSX show/hide, or data transformations — stop. That belongs in a selector or business module.

Keybinding knowledge (specific key names like 'ArrowDown', 'j') is forbidden in components — belongs in `DEFAULT_BINDINGS`.

For LookupTable operations, see `api-cheatsheets/lookup-table.md`.
