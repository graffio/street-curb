# Keyboard System

Command Pattern keyboard dispatch with separated actions and key bindings.

## The Problem

Users want to:
- Navigate and act without touching the mouse
- Use vim-style keys (j/k) alongside arrow keys
- See what keys are available (press `?` to show shortcuts)

The UI has overlapping contexts (register, popover, date input) where the same key means different things. LIFO registration (last registered wins) handles modal stacking.

## Architecture

```
@graffio/functional     - pure FP utilities
        ↑
@graffio/keymap         - ActionRegistry singleton, normalizeKey, formatKey
        ↑
quicken-web-app         - keymap-routing (dispatch), DEFAULT_BINDINGS, wiring
                        - KeymapDrawer (display), components (register via ref callbacks)
```

### Separation of Concerns

| Concern | Location | Example |
|---------|----------|---------|
| **Actions** (what to do) | Components via `ActionRegistry.register()` | `{ id: 'navigate:down', execute: moveDown }` |
| **Bindings** (which key) | `DEFAULT_BINDINGS` in keymap-config.js | `{ ArrowDown: 'navigate:down', j: 'navigate:down' }` |
| **Dispatch** (routing) | `KeymapRouting.handleKeydown` | key → binding → resolve → execute |
| **Display** (shortcuts drawer) | `KeymapDrawer` via `collectAvailableIntents` | Reverse bindings + registered actions |

Components never reference specific key names. Keymap-routing never references specific components.

## ActionRegistry

Module-level singleton. Components register actions on mount; keymap-routing resolves them.

```javascript
// Module-level state + cleanup (React 18 if/else pattern — no cleanup return values)
let chipState = { viewId: null }
let cleanup = null

const registerActions = element => {
    cleanup?.()
    cleanup = null
    if (element)
        cleanup = ActionRegistry.register(chipState.viewId, [
            { id: 'navigate:down', description: 'Move down', execute: () => post(Action.MoveHighlight(chipState.viewId, 1)) },
        ])
}

// Component body updates chipState on each render:
chipState = { viewId }

// In JSX:
<div ref={registerActions}>...</div>
```

- `register(context, actions)` → returns cleanup function (stored in module-level variable)
- `resolve(actionId, activeContext)` → LIFO match or null
- `context: null` = global (matches any activeContext)
- Execute functions read from module-level state at call time — always fresh values

See `.claude/api-cheatsheets/action-registry.md` for full API.

## DEFAULT_BINDINGS

Single source of truth for all key-to-action mappings:

```javascript
const DEFAULT_BINDINGS = {
    ArrowDown: 'navigate:down',    j: 'navigate:down',
    ArrowUp:   'navigate:up',      k: 'navigate:up',
    Escape:    'dismiss',          '?': 'toggle-shortcuts',
    Enter:     'select',           Tab: 'navigate:next-apply',
    a: 'filter:accounts',         c: 'filter:categories',
    d: 'filter:date',             f: 'filter:search',
    // ... etc
}
```

## Dispatch Flow

```
keydown event
  → Input element? → skip (let browser handle)
  → normalizeKey(event) → key string
  → DEFAULT_BINDINGS[key] → actionId (or skip if unmapped)
  → ActionRegistry.resolve(actionId, activeViewId) → action (LIFO)
  → action.execute()
```

## LIFO Conflict Resolution

When multiple components register the same action ID, the last registration wins. This handles modal stacking naturally:

```
1. DataTable registers: navigate:down (context: viewId)
2. Popover opens, registers: navigate:down (context: viewId)
   → ArrowDown now navigates the popover (LIFO)
3. Popover closes, cleanup removes its registration
   → ArrowDown navigates the DataTable again
```

No priority numbers needed — mount/unmount order handles everything.

## Key Normalization

| Event | Normalized |
|-------|-----------|
| `key: 'j'` | `'j'` |
| `key: 'ArrowDown'` | `'ArrowDown'` |
| `key: 's', metaKey: true` | `'cmd+s'` |
| `key: 'S', shiftKey: true, metaKey: true` | `'cmd+shift+s'` |

Modifier order: `alt`, `cmd`, `ctrl`, `shift` (alphabetical).

## KeymapDrawer

Bottom drawer toggled with `?`. Shows available shortcuts grouped by action type:

- **Navigation**: ↓/J Move down, ↑/K Move up, Esc Dismiss
- **Filters**: A Accounts, C Categories, D Date
- **Global**: ? Toggle shortcuts

Data derived from `ActionRegistry.collectForContext()` + reverse `DEFAULT_BINDINGS` map.

## Component Integration Patterns

### DataTable (navigation actions)
Registers `navigate:down`, `navigate:up`, `dismiss` via ref callback on the outer Flex element. Module-level `tableNav` object holds navigation state (highlightedId, focusableIds, rows). Execute functions read from `tableNav` at call time — navigation index computation stays in the component.

### Filter chips (per-chip registration)
Each chip registers its own `filter:*` action via ref callback. Replaces centralized FilterChipRow registration.

### SelectableListPopover (pure presentation)
Renders items, checkboxes, highlights. Does not register actions — the consuming chip handles registration. LIFO stacking still works: chip's popover-specific actions shadow DataTable's navigation.

### KeyboardDateInput (display-only)
Registers date actions with no-op execute. Local `handleKeyDown` handles actual keys (global dispatch skips focused inputs).

## Future: User-Configurable Bindings

The Command Pattern separation enables:
- Store user overrides in IndexedDB
- Merge with `DEFAULT_BINDINGS` at resolution time
- UI for rebinding keys
- Actions stay the same; only bindings change
