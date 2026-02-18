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

### 2026-01-16: Pre-built indices for O(1) lookups in selectors
**Context:** Holdings computation did O(n) scans of prices/allocations/transactions for each holding/date.
**Decision:** Build Map<key, Array|LookupTable> indices via `memoizeReduxState`; consume in dependent selectors.
**Why:** Indices rebuild only when source data changes; lookups become O(1); keeps indices as implementation details.

### 2026-02-03: Don't generate transfer counterparts — QIF already has both sides
**Context:** Transfers initially showed only one side. Tried generating mirror "counterpart" transactions during import.
**Decision:** Removed counterpart generation. Real QIF files already export both sides of every transfer. Fixed mock data to match this reality.
**Why:** Counterpart generation was solving a problem that doesn't exist with real data. The mock data was wrong, not the import logic.

### 2026-02-03: Centralize entity ID patterns in FieldTypes module
**Context:** Regex patterns like `/^acc_[a-f0-9]{12}$/` were duplicated across 10+ type definition files.
**Decision:** Created `quicken-type-definitions/field-types.js` with all 8 ID patterns; type definitions reference `FieldTypes.accountId` etc.
**Why:** Single source of truth. Also enables optional regex-validated fields: `{ pattern: FieldTypes.accountId, optional: true }`.

### 2026-02-18: Lazy rest-arg stringify in memoizeReduxStatePerKey
**Context:** Memoizer needed to check `...rest` args but `JSON.stringify` on every selector call is expensive.
**Decision:** Only stringify rest args when the cheap `keyedValue ===` reference check already passes.
**Why:** Short-circuit avoids serialization on the hot path; rest args only matter when the cheaper checks can't distinguish callers.
