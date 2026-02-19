# KeyboardDateInput Refactor

**Status:** Deferred — use the component first, identify UX issues, then let those drive the refactor.
**COMPLEXITY-TODOs expire:** 2026-04-01

## Context

- 40+ validator violations hidden behind 6 COMPLEXITY-TODO comments
- Keyboard navigation state machine is tangled with React rendering (useState, setTimeout, event handlers all interleaved)
- Component works but is hard to reason about

## Key Decisions (settled)

- **One active input at a time** — singleton slot, keyed by actionContext (viewId)
- **Redux owns the state** — keyboard mode, active part, typing buffer, date parts all belong in Redux
- **TDD** — write state machine tests before extracting

## Architecture: Effects as Data

The state machine should be a pure function:

```
(state, event) → { state, effects }
```

Effects are descriptions, not executions:
- `{ type: 'SET_TIMER', delay: 400, action: 'APPLY_BUFFER' }`
- `{ type: 'CLEAR_TIMER' }`
- `{ type: 'APPLY', value: 2023 }`

This makes every test pure input → output. No fake timers, no mocking.

A thin interpreter in `post()` reads effect descriptions and executes them (setTimeout, clearTimeout, dispatch). Analogous to how post.js already handles debounced table layout persistence.

## Debouncing Notes

- KeyboardDateInput's typing timeout is **not debounce** — it's a state machine disambiguation timer ("is the user typing `23` or `2025`?")
- SearchChip's debounce (input → dispatch rate-limiting) and post.js's debounce (dispatch → persistence rate-limiting) are correctly placed where they are
- No need to centralize debouncing

## When to Revisit

After using the date picker enough to articulate specific UX complaints. The refactor scope should be driven by behavior changes, not code aesthetics.
