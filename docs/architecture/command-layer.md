---
summary: Command layer routes Tagged Actions through post() to Redux dispatch plus persistence and processing side effects
keywords: post, commands, dispatch, Action, intent keys, IndexedDB
module: quicken-web-app
---

# Command Layer

## Overview

All state changes flow through `post(Action.X(...))`. The command layer routes each Tagged Action to Redux dispatch plus
any side effects (persistence, state-dependent computation).

```
Page / Keyboard / Component
        │
        │ post(Action.SetViewUiState(viewId, { navigateSearch: 1 }))
        ▼
┌─────────────────────────────────────────────────────┐
│ commands/post.js                                    │
│                                                     │
│  action.match({                                     │
│    SetViewUiState  : handleSetViewUiState,          │
│    SetTableLayout  : handleSetTableLayout,          │
│    OpenView        : handleTabLayoutAction,         │
│    InitializeSystem: handleInitializeSystem,        │
│    ...             : () => dispatch(action),        │
│  })                                                 │
│                                                     │
│  Three handler patterns:                            │
│  1. dispatch(action) — pass-through to Redux        │
│  2. dispatch(action) + persist — Redux + IndexedDB  │
│  3. read state → compute → dispatch(NEW action)     │
│     (intent key resolution)                         │
└────────┬───────────────────────────────┬────────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐          ┌─────────────────────┐
│ Redux Store     │          │ IndexedDB           │
│ (state)         │          │ (table layouts,     │
│                 │          │  tab layout,        │
│                 │          │  account list prefs) │
└─────────────────┘          └─────────────────────┘
```

### Key Components

| File | Role |
|------|------|
| `commands/post.js` | Routes Actions via `.match()` to dispatch + side effects |
| `commands/operations/` | Multi-step operations (file loading, initialization) |
| `commands/data-sources/indexed-db-storage.js` | IndexedDB read/write for persistence |
| `commands/data-sources/focus-registry.js` | DOM element registry for imperative focus/access |

### Intent Key Pattern

Pages send lightweight intent actions instead of pre-computing state. Post.js handlers resolve intent keys into
concrete state values before dispatching to Redux.

```
Page sends:     post(Action.SetViewUiState(viewId, { navigateSearch: 1 }))
                                                      ▲ intent key

Handler reads:  state → sorted data, search matches, highlighted row
Handler computes: target row index via RegisterNavigation
Handler dispatches: Action.SetViewUiState(viewId, { currentRowIndex: 42 })
                                                      ▲ resolved value
```

The original action with intent keys is never dispatched to Redux. Handlers always create a NEW action with resolved
values. This prevents intent keys from leaking into reducer state.

Current intent keys: `navigateSearch` (direction), `highlightRow` (transactionId), `initDateRange` (boolean).

Implementation: `commands/post.js` — T.toRegisterContext, E.handleNavigateSearch, E.handleHighlightRow,
E.handleInitDateRange.

## Trade-offs

**What this enables:**
- Pages are purely presentation — zero state computation, zero Redux reads outside useSelector
- Processing logic is testable without React rendering
- Intent keys are extensible — add new keys without changing page code

**What this constrains:**
- Post.js grows as more intent keys are added — acceptable while handler count stays under ~10
- Handlers must read fresh state on every call (no caching) — acceptable for user-initiated actions
- DOM mutations (clearing input values) stay page-side since they're presentation concerns

**When to revisit:**
- If post.js exceeds 300 lines, consider splitting handlers into `commands/operations/` files
- If intent key resolution needs async operations, consider a middleware pattern
