---
tags: [commands, post, dispatch, handlers, effects]
category: architecture
module: quicken-web-app
symptoms:
  - re-entrant post() calls
  - circular dependency in commands/
  - generic storage API leaking keys
---

# Handler-per-file dispatch pattern

## Solution

1. **Handlers receive `dispatch`, not `post`** — `dispatch` is the inner function that sends to Redux. Handlers call
   `dispatch(Action.SetLoadingStatus(...))` directly.

2. **One handler per file** — `handle-initialize-system.js`, `handle-open-file.js`, `handle-reopen-file.js`. Each
   file has a single exported function that takes `dispatch` as first param.

3. **Shared loading via `handleLoadFile`** — common `File → entities → dispatch` pattern extracted to its own module,
   called by both open and reopen handlers.

4. **post.js stays thin** — just the match router + persistence. Effect-only actions delegate:
   ```js
   InitializeSystem : () => handleInitializeSystem(dispatch),
   OpenFile         : () => handleOpenFile(dispatch),
   ```

5. **Domain-specific storage API** — `IndexedDbStorage` exposes `queryTableLayouts()`, `persistTabLayout(value)` etc.
   instead of generic `get(key)`/`set(key, value)`. Keys are internal constants.

## Prevention

- Handlers should never import `post` — if they need to dispatch, they receive `dispatch` as a parameter
- Storage modules should expose domain methods, not generic CRUD — keeps keys internal and API self-documenting

## Problem

Effect handlers in post.js grew large and called `post()` re-entrantly — a handler triggered by post's match arm
would call `post(Action.SetLoadingStatus(...))` which re-entered the same match block. This created:
- Circular dependencies when handlers were extracted to separate files
- Confusing control flow (post calling post)
- Tight coupling between handlers and post's routing

## Investigation

`SetLoadingStatus`, `LoadFile`, `SetShowReopenBanner` are all dispatch-only actions in post — no persistence side
effects. Handlers don't need `post`; they need `dispatch`.

## Root Cause

The original design passed `post` to handlers because it was the only way to dispatch. But `post` does two things:
routing + side effects. Handlers only need the routing part (dispatch to Redux).
