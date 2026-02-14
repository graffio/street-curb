# Commands Layer Architecture

**Date:** 2026-02-13
**Status:** Implemented

## What We Built

Simplified `commands/` so that `post()` is the only public API. Components call `post(Action.Foo())` for everything — state changes AND side effects.

## Why This Approach

`commands/` had become a renamed `services/`. Components imported `register-page.js`, `file-handling.js`, `keymap-routing.js` directly — the same junk-drawer pattern we dissolved `services/` to fix.

The insight: most "command" functions were thin wrappers that either:
- Computed a value the component already had → inline with existing pure functions
- Called `post()` with a known Action → inline as `post(Action.Foo())`
- Performed async I/O → belongs in `post()` as effect-only Action handlers

## Key Decisions

### 1. Effect-only Actions

New pattern: Actions where the reducer returns state unchanged, but `post()` performs a side effect.

```
InitializeSystem → reads IndexedDB, loads test fixture
OpenFile         → shows file picker, loads entities
ReopenFile       → requests permission, reloads
```

This keeps the exhaustive match pattern intact — every Action appears in both `post()` and `reducer.js`.

### 2. Selector defaults replace init effects

`tableLayoutOrDefault` already provides defaults via the selector. The `ensureTableLayoutEffect` useEffect in RegisterPageView was redundant. Same pattern applies wherever components initialized default state on mount.

### 3. Keymap resolution in @graffio/keymap

`handleKeydown(bindings)` and `toAvailableIntents(bindings, groupNames, activeViewId)` moved to `@graffio/keymap` where `ActionRegistry` already lives. App-specific config (`DEFAULT_BINDINGS`, `GROUP_NAMES`) stays in `src/keymap-config.js`.

### 4. Handler-per-file with dispatch, not post

Effect handlers live in individual files under `commands/handlers/`. Each receives `dispatch` (the Redux dispatch wrapper) as parameter — not `post`. This avoids re-entrant circular calls.

### 5. Module-level state for file handle

`storedHandle` (non-serializable `FileSystemFileHandle`) lives in `commands/data-sources/stored-file-handle.js` with get/set. Managed by `InitializeSystem`, `OpenFile`, and `ReopenFile` handlers. Cannot go in Redux (not serializable).

### 6. Domain-specific storage API

`IndexedDbStorage` exposes `queryTableLayouts()`, `persistTabLayout(value)` etc. instead of generic `get(key)`/`set(key, value)`. Keys are internal constants.

## Final Structure

```
commands/
├── post.js                        # Only public API — dispatch + effects
├── data-sources/
│   ├── focus-registry.js          # DOM focus management (future use)
│   ├── indexed-db-storage.js      # IndexedDB with domain-specific API
│   ├── load-entities-from-file.js # WASM SQLite operations
│   └── stored-file-handle.js      # In-memory FileSystemFileHandle state
└── handlers/
    ├── handle-initialize-system.js # Hydrate stored handle + test fixtures
    ├── handle-load-file.js         # Shared: File → entities → dispatch
    ├── handle-open-file.js         # File picker flow
    └── handle-reopen-file.js       # Reopen stored file flow
```

All component/page imports from `commands/` are `post.js` only (verified by grep). `hydration.js` imports `indexed-db-storage.js` (store-layer infrastructure, acceptable).

## What Got Deleted

- `commands/register-page.js` — all functions inlined or replaced by selectors
- `commands/file-handling.js` — replaced by effect-only Actions in post.js
- `commands/keymap-routing.js` — resolution moved to @graffio/keymap, listener inlined in RootLayout
