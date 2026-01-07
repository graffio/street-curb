# Keymap System

Keyboard-driven interaction with user-configurable keybindings.

## The Problem

Users want to:

- Navigate and act without touching the mouse
- Use vim-style keys (j/k) or their own bindings
- See what keys are available

The UI has overlapping areas (sidebar, register, modals) where the same key means different things. Multiple DataTables may be visible simultaneously - only one should respond.

## Module Architecture

```
@graffio/functional     - pure FP utilities (Tagged, LookupTable)
        ↑
@graffio/keymap         - pure types + functions (Intent, Keymap, resolution)
        ↑
@graffio/design-system  - UI components (KeymapPanel, DataTable)
        ↑
quicken-web-app         - wires everything together, manages "active" state
```

**@graffio/keymap** is a pure logic layer:
- No DOM, no React, no browser APIs
- Tagged types with methods
- Pure resolution functions
- Trivially testable with Node TAP

**@graffio/design-system** provides:
- KeymapPanel component for displaying available keybindings
- DataTable accepts keymap configuration (replaces baked-in keyboard handling)

**App** is responsible for:
- Tracking which component is "active"
- Attaching global keydown listener
- Wiring resolution results to actions

## Core Concepts

**Intent** — A semantic keyboard action with one or more trigger keys:
```javascript
Intent.from({ description: 'Move down', keys: ['j', 'ArrowDown'], action: 'ArrowDown' })
Intent.from({ description: 'Delete item', keys: ['Delete'], action: deleteFn })
```

**Keymap** — A component's keybinding registration with priority:
```javascript
Keymap.from({
    id: 'register-123',
    priority: 10,
    activeWhen: activeId => activeId === 'register-123',
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
        id: 'String',
        priority: 'Number',
        blocking: 'Boolean?',
        activeWhen: 'Any?',  // Optional predicate: (activeId) => boolean
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
            return { description: intent.description, keys: intent.keys, from: keymap.id }
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

## Multiple DataTables Example

```javascript
// InvestmentReport with expandable account holdings
const [activeTableId, setActiveTableId] = useState(null)

// Each DataTable registers its keymap and tracks activation
<DataTable
    id="root"
    onFocus={() => setActiveTableId('root')}
    keymapPriority={10}
    keymapActiveWhen={id => id === 'root'}
/>

{expandedAccounts.map(account => (
    <DataTable
        key={account.id}
        id={account.id}
        onFocus={() => setActiveTableId(account.id)}
        keymapPriority={10}
        keymapActiveWhen={id => id === account.id}
    />
))}
```

User clicks Account C's holdings table → `activeTableId = 'account-c'` → only that table's keymap responds to `j`.

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

## Future: Personalization

User-configurable keybindings (deferred):
- Store user overrides in IndexedDB
- Merge with defaults at resolution time
- UI for rebinding keys (in design-system)

## Future: KeymapPanel

Display component (lives in design-system):
```javascript
// Uses collectAvailableKeybindings from @graffio/keymap
const KeymapPanel = ({ keymaps, activeId }) => {
    const bindings = collectAvailableKeybindings(keymaps, activeId)
    return (
        <Panel>
            {bindings.map(b => (
                <Row key={b.description}>
                    <span>{b.description}</span>
                    <kbd>{b.keys.join(', ')}</kbd>
                </Row>
            ))}
        </Panel>
    )
}
```
