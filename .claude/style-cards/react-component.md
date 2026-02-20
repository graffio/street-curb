# React Component Style Card

Components are **wiring** between selectors (reads) and actions (writes). No logic beyond show/hide.

## Structure

Use section separators to organize files. Canonical order (skip empty sections):

| # | Section            | Contains                                                               |
|---|--------------------|------------------------------------------------------------------------|
| 1 | F (Factories)      | `create*`, `make*`, `build*` (style factories like `makeItemRowStyle`) |
| 2 | Components         | Sub-components (ItemRow, Badge, etc.)                                  |
| 3 | Constants          | `const` values, style objects, config              |
| 4 | Module-level state | `let` vars, `Map`s (hybrid files only)             |
| 5 | Exports            | Exported component(s) + `export` statement         |

No full P/T/F/V/A/E cohesion groups — those are for JS modules with business logic. Components may use F for style
factories. Components are wiring, not logic.

## JSX Single-Line Opening Tags

Every JSX opening tag must fit on a single line within `printWidth: 120`. Fix hierarchy:

1. **Extract subcomponent** — reduces nesting depth → reduces indent → line fits naturally
2. **Extract prop values as consts** — shortens inline expressions (`isHighlighted={highlightedItemId === opt.key}` →
   `isHighlighted={hl}`)
3. **JSX prop spread** — last resort for 5+ props: `<TextField.Root {...fieldProps} />`

## Extract Subcomponents Aggressively

Components should be small and flat. These patterns signal a missing subcomponent:

- **JSX opening tag too long at deep nesting** — the subtree should be its own component, reducing indent depth
- **`{condition && <...>}`** — the child should select its own visibility via `useSelector` and return null when hidden
- **`{x ? <A> : <B>}`** — a single subcomponent selects state and renders the right variant
- **`.map()` with multi-line JSX** — each mapped item is its own component
- **Multiple `useSelector` calls feeding different JSX regions** — each region with its own data dependency is a
  subcomponent

Subcomponents receive business identifiers (`viewId`, `accountId`) and select their own data. This keeps the parent flat
and each subcomponent focused on one piece of state.

## Props — No Prop Drilling

A component must not accept props it does not directly use. If data is only passed through to a child, the child should
select it via `useSelector`.

**What counts as direct use:**

- Component renders or branches on the value (`isFiltering`, `itemLabel`)
- Component passes it to its own `useSelector` call (`viewId`, `accountId`)
- Component invokes the callback itself (`onClick`, `onNext`)
- Static configuration the component consumes (`columns`, `items`)

**What is prop drilling (violation):**

- Selecting data via `useSelector` and passing it to a child that could select it itself
- Accepting a prop only to spread it onto a child component

**Fix:** Wrap the child in a self-selecting component that calls `useSelector` internally. Pass business identifiers (
`viewId`, `accountId`) so children can select their own data.

## Handlers

- Handlers call `post(Action.X(...))`. Nothing else.
- No data prep in handlers — if you need to transform before dispatching, that belongs in the reducer.
- **Inline `post()` calls directly in JSX.** The Action variant name IS the intent — no extraction needed.

## All Writes Go Through `post`

Every state change goes through `post(Action.X(...))`. No exceptions. Components never perform side effects directly —
they call `post` and `post` handles dispatch, persistence, authorization, and rollback.

- `commands/post.js` — routes each Action to Redux dispatch + persistence side effects
- `commands/operations/` — multi-step operations (file loading, initialization)
- `commands/data-sources/` — non-Redux state (IndexedDB, FocusRegistry)

## Hooks

**The only hook allowed in app components is `useSelector`.** Zero exceptions.

No `useCallback`, `useEffect`, `useRef`, `useMemo`, `useState` in `quicken-web-app/src/**/*.jsx`.

**Exemption:** Design-system wrapper components (`DataTable.jsx`, `KeyboardDateInput.jsx`) may use third-party library
hooks (useReactTable, useVirtualizer, useSortable) — these are unavoidable API surfaces.

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
}}/>
```

Keyboard system calls `FocusRegistry.focus(id)` directly.

### Router Page Titles (replaces SetPageTitle useEffect)

Pages don't dispatch their own title. The routing layer handles page title dispatch.

## Actions (Keyboard System)

Interactive components register actions via ref callbacks (React 18 if/else pattern with module-level cleanup):

```jsx
let cleanup = null
const registerActions = element => {
    cleanup?.()
    cleanup = null
    if (element)
        cleanup = ActionRegistry.register(chipState.viewId, [
            {
                id: 'filter:accounts',
                description: 'Accounts',
                execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, 'accounts'))
            },
        ])
}
// In JSX: <div ref={registerActions}>...</div>
```

- Module-level state object updated by component on each render — execute functions read at call time
- Accept `actionContext` prop (viewId or null for global)
- Never reference specific key names — keybindings live in `DEFAULT_BINDINGS` (`keymap-config.js`)

**Exemption:** `KeyboardDateInput.jsx` uses useEffect for action registration (local handleKeyDown, not ref callback).

## Layer Check

If you're writing filter/map/reduce chains, conditional logic beyond JSX show/hide, or data transformations — stop. That
belongs in a selector or business module.

Keybinding knowledge (specific key names like 'ArrowDown', 'j') is forbidden in components — belongs in
`DEFAULT_BINDINGS`.

For LookupTable operations, see `api-cheatsheets/lookup-table.md`.
