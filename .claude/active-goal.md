# Active Goal: Keymap Module

**Goal:** Create `@graffio/keymap` module for keyboard-driven interaction with priority-based resolution.

**Approach:** Pure logic layer - Tagged types + functions, no DOM/React. App wires up listeners and active tracking.

**Key decisions:**
- Separate module (not design-system) - sits between functional and design-system
- Types: Intent, Keymap with methods attached via `Any`
- Pure functions: normalizeKey, resolveKey, collectAvailableKeybindings
- UI (KeymapPanel) deferred to design-system
- Active component tracking is app responsibility
