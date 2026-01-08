# Keymap System

Keyboard-driven interaction with discoverable keybindings.

## The Problem

Users want to:

- Navigate and act without touching the mouse
- Use vim-style keys (j/k) or their own bindings
- See what keys are available (press `?` to show shortcuts)

The UI has overlapping areas (sidebar, register, modals) where the same key means different things. Multiple DataTables may be visible simultaneously - only one should respond.

## Module Architecture

```
@graffio/functional     - pure FP utilities (Tagged, LookupTable)
        ↑
@graffio/keymap         - pure types + functions (Intent, Keymap, resolution, formatKey)
        ↑
@graffio/design-system  - UI components (KeymapDrawer, DataTable with keymap support)
        ↑
quicken-web-app         - wires everything together, manages "active" state
```

**@graffio/keymap** is a pure logic layer:
- No DOM, no React, no browser APIs
- Tagged types with methods
- Pure resolution functions
- Key formatting for display (ArrowDown → ↓, cmd+k → ⌘K)
- Trivially testable with Node TAP

**@graffio/design-system** provides:
- KeymapDrawer component for displaying available keybindings (bottom drawer, grouped by source)
- DataTable accepts keymap callbacks for registration (shortcuts appear in drawer)

**App** is responsible for:
- Tracking which component is "active"
- Attaching global keydown listener (KeymapRouting service)
- Wiring resolution results to actions
- Registering global keymap (`?` to toggle drawer)

## Core Concepts

**Intent** — A semantic keyboard action with one or more trigger keys:
```javascript
Intent.from({ description: 'Move down', keys: ['j', 'ArrowDown'], action: 'ArrowDown' })
Intent.from({ description: 'Delete item', keys: ['Delete'], action: deleteFn })
```

**Keymap** — A component's keybinding registration with priority:
```javascript
Keymap.from({
    id: 'reg_acc_123',           // For unregistration
    name: 'Chase Checking',       // Display name in drawer
    priority: 10,
    activeWhen: activeId => activeId === 'reg_acc_123',
    blocking: false,
    intents: LookupTable([...intents], Intent, 'description'),
})
```

**Action** — What happens when a key is matched:
- String → translate to that key (dispatch synthetic event)
- Function → call it

## Type Definitions

```javascript
// intent.type.js
const Intent = {
    name: 'Intent',
    kind: 'tagged',
    fields: {
        description: 'String',
        keys: '[String]',
        action: 'Any',  // String (translation) or Function (handler)
    },
}

Intent.hasKey = (intent, key) => intent.keys.includes(key)

// keymap.type.js
const Keymap = {
    name: 'Keymap',
    kind: 'tagged',
    fields: {
        id: 'String',           // For unregistration
        name: 'String',         // Display name in drawer
        priority: 'Number',
        blocking: 'Boolean?',
        activeWhen: 'Any?',     // Optional predicate: (activeId) => boolean
        intents: '{Intent:description}',
    },
}

Keymap.isActive = (keymap, activeId) => !keymap.activeWhen || keymap.activeWhen(activeId)
Keymap.findMatchingIntent = (keymap, key) => keymap.intents.find(i => Intent.hasKey(i, key))
Keymap.resolveKey = (keymap, key, activeId) => {
    if (!Keymap.isActive(keymap, activeId)) return null
    const intent = Keymap.findMatchingIntent(keymap, key)
    if (intent) return { description: intent.description, action: intent.action }
    if (keymap.blocking) return { blocked: true }
    return null
}
Keymap.collectIntents = (keymap, activeId, seen) => {
    if (!Keymap.isActive(keymap, activeId)) return []
    return keymap.intents
        .filter(intent => !seen.has(intent.description))
        .map(intent => {
            seen.add(intent.description)
            return { description: intent.description, keys: intent.keys, from: keymap.name }
        })
}
```

## Priority Conventions

| Priority | Use             | Example                          |
|----------|-----------------|----------------------------------|
| 100      | Blocking modals | Confirm dialogs                  |
| 50       | Floating panels | Command palette, shortcuts panel |
| 10       | Views           | Register, sidebar, DataTables    |
| 0        | Global          | cmd+s, cmd+z                     |

## Module Structure

```
modules/keymap/
  src/
    types/
      intent.js           # Generated from type definition
      keymap.js           # Generated from type definition
      index.js            # Export types
    keymap.js             # normalizeKey, resolveKey, collectAvailableKeybindings
    index.js              # Public exports
  type-definitions/
    intent.type.js
    keymap.type.js
  test/
    keymap.tap.js         # Pure function tests
  package.json            # @graffio/keymap
```

## Exported API

```javascript
// Types
export { Intent } from './types/intent.js'
export { Keymap } from './types/keymap.js'

// Functions
export { normalizeKey }              // KeyboardEvent -> String
export { resolveKey }                // (key, keymaps, activeId) -> result | null
export { collectAvailableKeybindings } // (keymaps, activeId) -> [{ description, keys, from }]
```

## Key Normalization

| Event                                              | Normalized      |
|----------------------------------------------------|-----------------|
| `event.key = 'j'`                                  | `'j'`           |
| `event.key = 'ArrowDown'`                          | `'ArrowDown'`   |
| `event.key = 's', metaKey = true`                  | `'cmd+s'`       |
| `event.key = 'S', shiftKey = true, metaKey = true` | `'cmd+shift+s'` |

Modifier order: `alt`, `cmd`, `ctrl`, `shift` (alphabetical).

## Resolution

```javascript
// Find first keymap that handles this key
const resolveKey = (key, keymaps, activeId) =>
    keymaps.reduce((found, km) => found ?? Keymap.resolveKey(km, key, activeId), null)
```

## Testing

All pure functions, tested with Node TAP:

```javascript
test('normalizeKey', t => {
    t.equal(normalizeKey({ key: 'j' }), 'j')
    t.equal(normalizeKey({ key: 's', metaKey: true }), 'cmd+s')
    t.end()
})

test('resolveKey with blocking keymap', t => {
    const modal = Keymap.from({ id: 'modal', priority: 100, blocking: true, intents: ... })
    const result = resolveKey('cmd+s', [modal], null)
    t.same(result, { blocked: true })
    t.end()
})
```

No DOM, no React mocking - just inputs and outputs.

## App Integration

The app wires up the keymap system. This is NOT in the keymap module:

```javascript
// Track which component is active (via clicks, focus, etc.)
const [activeId, setActiveId] = useState(null)

// Maintain keymap registry
const [keymaps, setKeymaps] = useState([])

// Global keydown listener
useEffect(() => {
    const handleKeydown = e => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
        const key = normalizeKey(e)
        const result = resolveKey(key, keymaps, activeId)
        if (result?.blocked) { e.preventDefault(); return }
        if (result?.action) {
            if (typeof result.action === 'string') {
                e.target.dispatchEvent(new KeyboardEvent('keydown', { key: result.action, bubbles: true }))
            } else {
                result.action()
            }
            e.preventDefault()
        }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
}, [keymaps, activeId])
```

## DataTable Keymap Integration

DataTable registers its own keymap for ArrowUp/Down/Escape. Consumer provides registration callbacks:

```javascript
// TransactionRegisterPage
const handleRegisterKeymap = keymap => post(Action.RegisterKeymap(keymap))
const handleUnregisterKeymap = id => post(Action.UnregisterKeymap(id))

<DataTable
    keymapId={viewId}                          // e.g., 'reg_acc_123'
    keymapName={accountName}                   // e.g., 'Chase Checking'
    onRegisterKeymap={handleRegisterKeymap}
    onUnregisterKeymap={handleUnregisterKeymap}
    enableKeyboardNav={isActive}
    onHighlightChange={handleHighlightChange}
    onEscape={handleEscape}
    ...
/>
```

DataTable internally creates a keymap with:
- ArrowDown → calls onHighlightChange (next row)
- ArrowUp → calls onHighlightChange (previous row)
- Escape → calls onEscape

These shortcuts appear in KeymapDrawer under the account name.

**Vim-style synonyms** stay in the consumer's keymap:
```javascript
// TransactionRegisterPage's keymap (separate from DataTable's)
const intents = LookupTable([
    Intent('Move down', ['j'], 'ArrowDown'),  // Dispatches synthetic ArrowDown
    Intent('Move up', ['k'], 'ArrowUp'),      // DataTable's keymap handles it
], Intent, 'description')
```

## Multiple DataTables Example

When multiple DataTables are visible, `activeWhen` ensures only one responds:

```javascript
// Each DataTable's keymap uses activeWhen to check if it's the active view
activeWhen: activeId => activeId === viewId
```

User clicks Account C's table → `activeViewId = 'reg_acc_c'` → only that table's keymap responds.

## Sequence Diagrams

```
User presses 'j' with 3 DataTables visible
│
▼
Global keydown listener (app)
│
├─► Focus in INPUT/TEXTAREA? → let browser handle
│
▼
normalizeKey(event) → 'j'
│
▼
resolveKey('j', keymaps, activeTableId='table-2')
│
├─► table-1 keymap: activeWhen('table-2') → false, skip
├─► table-2 keymap: activeWhen('table-2') → true
│   └─► 'Move down' includes 'j'? → yes
│       └─► return { action: 'ArrowDown' }
│
▼
action is String → dispatch synthetic ArrowDown to table-2
```

```
User presses 'Delete' with modal open
│
▼
resolveKey('Delete', keymaps, activeId)
│
├─► modal keymap (priority 100, blocking: true)
│   └─► No binding for 'Delete'
│       └─► blocking: true → return { blocked: true }
│
▼
blocked → preventDefault, done (key swallowed)
```

## KeymapDrawer (Implemented)

Bottom drawer showing available shortcuts, toggled with `?`:

```javascript
// RootLayout registers global keymap
const globalKeymap = Keymap(GLOBAL_KEYMAP_ID, 'Global', 0, false, null, intents)
// Intent: Toggle shortcuts, keys: ['?'], action: toggleDrawer

// Drawer displays grouped shortcuts
<KeymapDrawer
    open={showDrawer}
    onOpenChange={setShowDrawer}
    intents={Keymap.collectAvailable(keymaps, activeViewId)}
/>
```

Drawer shows shortcuts grouped by source (keymap.name):
- **Global**: ? Toggle shortcuts
- **Chase Checking**: ↓ Move down, ↑ Move up, Esc Dismiss, J Move down, K Move up

## Future: Personalization

User-configurable keybindings (deferred):
- Store user overrides in IndexedDB
- Merge with defaults at resolution time
- UI for rebinding keys (in design-system)
