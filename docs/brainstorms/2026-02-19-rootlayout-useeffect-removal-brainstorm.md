# Remove useEffect from RootLayout

**Date:** 2026-02-19
**Status:** Brainstorm

## What We're Building

Move the two remaining `useEffect` calls in RootLayout.jsx into `main.jsx` bootstrap, eliminating the last React lifecycle hooks from the app shell.

The two effects:
1. `useEffect(() => post(Action.InitializeSystem()), [])` — mount-time init (IndexedDB file handle recovery + test fixture loading)
2. `useEffect(keydownEffect, [])` — global keydown listener setup

Neither has any React dependency. Both only need the Redux store, which exists before React renders.

## Why This Matters

- RootLayout is the last app component with `useEffect` (excluding design-system exemptions and per-view register pages)
- Completes the `less-react` brainstorm goal for the app shell
- Removes the COMPLEXITY exemption comment
- Init runs earlier (before first render instead of after mount)

## Settled Approach

**Move both calls to `main.jsx` bootstrap chain.** In the existing `.then()` after `initializeStore()` resolves:

1. Call `post(Action.InitializeSystem())` — fire-and-forget, dispatches to store directly
2. Set up `window.addEventListener('keydown', handler)` — handler reads state via `currentStore().getState()`, no cleanup needed (app-lifetime)

No new files, no new abstractions. Lines move from RootLayout to main.jsx.

InitializeSystem stays bundled (file handle recovery + test fixture loading) — not worth splitting.

`registerToggleShortcuts` also moves to bootstrap — it's app-lifetime, never unmounts, and doesn't need a DOM element (ActionRegistry.register takes null for global actions). Remove the ref callback from the Flex element.

E cohesion group cleanup is out of scope — don't touch it beyond removing the moved functions.

## Knowledge Destination

- `architecture:` docs/architecture/app-bootstrap.md (update) — if it exists, document that init + keyboard setup happen pre-React
- `none` — if no bootstrap architecture doc exists, knowledge lives in main.jsx (self-documenting)

## Open Questions

None — all resolved.
