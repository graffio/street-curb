# Decisions

Quick decisions that don't warrant full architecture docs. For patterns, see `docs/architecture/`.

---

### 2025-12-13: Removed HydrateFromLocalStorage action
**Context:** Tab layout had both `HydrateFromLocalStorage` action and `getInitialState()` hydration.
**Decision:** Removed the action; hydration happens in `getInitialState()`.
**Why:** Lazy hydration is simpler—state ready before first render, no action dispatch needed.

### 2025-12-13: Renamed Group actions to TabGroup
**Context:** Action names (`CreateGroup`, `CloseGroup`, etc.) were ambiguous.
**Decision:** Renamed to `CreateTabGroup`, `CloseTabGroup`, `SetActiveTabGroup`, `SetTabGroupWidth`.
**Why:** Clarity—"Group" could mean many things; "TabGroup" is specific.

### 2025-12-27: Lots loaded into Redux for historical holdings computation
**Context:** Investment Holdings report needs "as of date" filtering with instant response.
**Decision:** Load all lots into Redux state; compute holdings in JS via selector filtering.
**Why:** Avoids database round-trip on each date change; selector memoization gives instant updates.

### 2026-01-07: Keymap integration via Redux state
**Context:** Need keyboard shortcuts (j/k) for navigation without coupling to specific components.
**Decision:** Keymaps stored in Redux; components register/unregister on mount; global listener resolves keys.
**Why:** Components own their keymaps; priority-based resolution; translations forward to existing handlers.
