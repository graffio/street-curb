# React Component Style Card

Components are **wiring** between selectors (reads) and actions (writes). No logic beyond show/hide.

## Structure

Config constants → P/T groups (module level) → helper components → exported component(s) LAST.

**Don't over-extract.** Extract when: used 3+ times, a name clarifies non-obvious logic, or indentation forces a line break. Leave self-documenting expressions inline (`MY_SET.has(x)`, `obj.field`).

## Handlers

- Handlers call `post(Action.X(...))` or `setState()`. Nothing else.
- No data prep in handlers — if you need to transform before dispatching, that's a selector or `from{InputType}`.
- Complex effects: use E group at module level, pass setters as parameters for testability.

## Hooks

- `useSelector` — all state reads. Derived state belongs in selectors, not here.
- `useCallback` — only for simple `() => post(Action.X)` or `() => set(value)` bodies.
- `useRef` — DOM refs and action-execute stability refs (for ActionRegistry callbacks that need current state).
- `useEffect` — wiring only (subscriptions, layout effects). No business logic.
- `useState` — requires `// EXEMPT: reason` comment. Valid: drag, hover, focus, file-handling, drawer, loading.

## Updater Pattern (TanStack Table etc.)

When a library passes updater functions: resolve the updater, then dispatch.

```javascript
const handleChange = useCallback(
    updater => {
        const next = typeof updater === 'function' ? updater(current) : updater
        post(Action.SetValue(viewId, next))
    },
    [viewId, current],
)
```

## Actions (Keyboard System)

Interactive components register actions via `ActionRegistry.register()` in a mount effect:
- Accept `actionContext` prop (viewId or null for global)
- Return the cleanup function from `register()` as the effect cleanup
- Use `handlersRef` pattern when execute functions need current callback values
- Never reference specific key names — keybindings live in `DEFAULT_BINDINGS` (keymap-routing.js)

## Layer Check

If you're writing filter/map/reduce chains, conditional logic beyond JSX show/hide, or data transformations — stop. That belongs in a selector or business module.

Keybinding knowledge (specific key names like 'ArrowDown', 'j') is forbidden in components — belongs in `DEFAULT_BINDINGS`.

For LookupTable operations, see `api-cheatsheets/lookup-table.md`.
