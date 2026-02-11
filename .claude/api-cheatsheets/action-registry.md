# ActionRegistry API

Module-level singleton for Command Pattern keyboard dispatch. Components register actions; keymap-routing resolves them by key binding.

**Location:** `modules/keymap/src/action-registry.js`
**Import:** `const { ActionRegistry } = KeymapModule` (from `@graffio/keymap`)

## API

| Method | Signature | Returns | Notes |
|--------|-----------|---------|-------|
| `register` | `(context, actions) -> cleanup` | `() -> void` | Appends actions; cleanup removes only this batch |
| `unregister` | `(context) -> void` | void | Removes ALL actions for a context |
| `resolve` | `(actionId, activeContext) -> action\|null` | `{ id, description, execute, context }` | LIFO — last registered wins |
| `collectForContext` | `(activeContext) -> [action]` | `[{ id, description, context }]` | All actions matching context (includes `null` globals) |
| `clear` | `() -> void` | void | Test-only — empties registry |

## Action Shape

```javascript
{ id: 'navigate:down', description: 'Move down', execute: () => handleMoveDown() }
```

Plain objects. No Tagged type. `id` matches keys in `DEFAULT_BINDINGS`.

## Context Rules

- `context === activeViewId` — actions scoped to a specific view
- `context === null` — global actions (match any activeContext)
- LIFO resolution: later registrations shadow earlier ones for same `id + context`

## DEFAULT_BINDINGS

**Location:** `modules/quicken-web-app/src/services/keymap-routing.js`

Maps normalized key strings to action IDs:

```
ArrowDown/j → navigate:down    a → filter:accounts
ArrowUp/k   → navigate:up      c → filter:categories
Escape      → dismiss           d → filter:date
Enter       → select            ? → toggle-shortcuts
```

## Dispatch Flow

```
keydown event
  → P.isInputElement? skip
  → normalizeKey(event) → key
  → DEFAULT_BINDINGS[key] → actionId
  → ActionRegistry.resolve(actionId, activeViewId) → action
  → action.execute()
```

## Component Pattern

```javascript
const { ActionRegistry } = KeymapModule

// Use handlersRef for stable execute functions that read current props
const handlersRef = useRef({ onMoveDown, onMoveUp })
handlersRef.current = { onMoveDown, onMoveUp }

useEffect(() => {
    if (!actionContext) return undefined
    return ActionRegistry.register(actionContext, [
        { id: 'navigate:down', description: 'Move down', execute: () => handlersRef.current.onMoveDown() },
        { id: 'navigate:up', description: 'Move up', execute: () => handlersRef.current.onMoveUp() },
    ])
}, [actionContext])
```

## KeymapDrawer Integration

`KeymapRouting.collectAvailableIntents(activeViewId)` derives display data:
1. `ActionRegistry.collectForContext(activeViewId)` — all registered actions
2. Reverse `DEFAULT_BINDINGS` — map actionId to key strings
3. Derive group name from action ID prefix (`navigate:` → Navigation, `filter:` → Filters)
