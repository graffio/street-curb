# Cohesion Group Migration

**Date:** 2026-02-10
**Status:** Brainstorm
**Scope:** `modules/quicken-web-app/src/`

## What We're Building

Migrate all component and page files to comply with the style cards (especially `react-component.md`). The core rule:
components are **wiring** between selectors and actions — no transforms, no domain logic, no data derivation beyond
show/hide.

The cohesion group system (P/T/F/V/A/E) is sound. The problem is **layer violations**: ~14 functions live in components
that should live in selectors, utilities, or business modules.

## Why This Matters

- Pre-style-card files teach bad patterns — new code copies what it sees
- T groups in components are catch-all buckets because they contain misplaced logic
- Register page duplication (8 identical functions) is the most concrete debt

## Findings

### Group-level assessment

| Group                           | Cohesion                                                                                                                       | Verdict                                               |
|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **P** (9 functions, 6 files)    | Strong — every function is a pure boolean predicate with consistent naming                                                     | No changes needed                                     |
| **T** (~50 functions, 15 files) | Weak in components, strong in utility/service files — T is "everything else" in components because misplaced logic inflates it | Move ~14 functions out of components                  |
| **F** (8 functions, 5 files)    | Moderate — `create*` (domain objects) vs `make*` (style objects) is a real but small split                                     | No structural change needed                           |
| **A** (4 functions, 2 files)    | Moderate — orchestrators that compose P/T/F. Tiny group.                                                                       | Leave as-is                                           |
| **E** (~25 functions, 8 files)  | Moderate — "has side effects" conflates async I/O, dispatchers, event handlers, effect factories                               | Tolerable; the shared property (impure) is meaningful |
| **V** (0 functions)             | N/A — validation handled by P (guards) and Tagged constructors                                                                 | No group needed                                       |

### Files that opt out of cohesion groups

These use standalone exports instead of P/T/F/A/E namespaces. This correlates with "flat utility API" modules vs "
single-namespace domain" modules — pragmatic, not inconsistent.

- `utils/formatters.js` — 7 standalone formatting functions
- `utils/table-layout.js` — 5 standalone transform functions
- `utils/category-tree.js` — mixed standalone functions
- `commands/post.js` — single export, explicitly noted as not fitting P/T/F/V/A
- `store/selectors.js` — uses domain namespaces (UI, Transactions, Holdings, Accounts)
- `services/storage.js` — utility API, explicitly exempted

## Complete Function Disposition Table

### Legend

- **STAY** — already compliant with style cards
- **MOVE** — clear violation, must relocate
- **RECLASS** — right file, wrong cohesion group
- **DEDUP** — extract to shared module (identical code in multiple files)
- **BORDER** — judgment call needed from Jeff

### store/index.js

| Group | Function             | Description                              | Disposition |
|-------|----------------------|------------------------------------------|-------------|
| P     | `isTestMode`         | Check if running in test mode            | STAY        |
| T     | `toTestModePromises` | Build promises for test mode empty state | STAY        |

### store/reducers/transaction-filters.js

| Group | Function     | Description                      | Disposition |
|-------|--------------|----------------------------------|-------------|
| T     | `toTodayIso` | Today's date as ISO string       | STAY        |
| T     | `toggleItem` | Toggle item in list (add/remove) | STAY        |

### store/reducers/tab-layout.js

| Group | Function               | Description                         | Disposition |
|-------|------------------------|-------------------------------------|-------------|
| T     | `toNextActiveViewId`   | Find next active view after removal | STAY        |
| T     | `toLayoutWithoutGroup` | Remove group, resize remaining      | STAY        |
| F     | `createResizedGroup`   | Copy group with new width           | STAY        |

### store/selectors.js

Uses domain namespaces (UI, Transactions, Holdings, Accounts, Categories) — deliberate deviation documented with
COMPLEXITY comment. The `T` namespace is aliased as `Transactions`.

| Group | Function                | Description                           | Disposition |
|-------|-------------------------|---------------------------------------|-------------|
| T     | `enriched`              | Memoized enriched transactions        | STAY        |
| T     | `filtered`              | Memoized filtered transactions        | STAY        |
| T     | `forAccount`            | Transactions for one account          | STAY        |
| T     | `filteredForAccount`    | Filtered transactions for one account | STAY        |
| T     | `filteredForInvestment` | Investment transactions with filters  | STAY        |
| T     | `highlightedId`         | Highlighted transaction ID            | STAY        |
| T     | `highlightedIdForBank`  | Highlighted ID for bank register      | STAY        |
| T     | `searchMatches`         | Search match IDs                      | STAY        |
| T     | `sortedForBankDisplay`  | Sorted bank register rows             | STAY        |
| T     | `sortedForDisplay`      | Sorted investment register rows       | STAY        |

### services/account-organization.js

| Group | Function                  | Description                                | Disposition |
|-------|---------------------------|--------------------------------------------|-------------|
| P     | `hasZeroBalance`          | Account balance within 1 cent of zero      | STAY        |
| T     | `toAlphabetized`          | Sort accounts alphabetically               | STAY        |
| T     | `toSortedByAmount`        | Sort accounts by balance descending        | STAY        |
| T     | `toSectionId`             | Section label to kebab-case ID             | STAY        |
| T     | `toSectionLabel`          | Account type to section label              | STAY        |
| T     | `toGroupedByType`         | Group accounts by section label            | STAY        |
| F     | `createSection`           | Construct AccountSection                   | STAY        |
| F     | `createZeroBalanceByType` | Construct nested $0 sections               | STAY        |
| A     | `collectByTypeSections`   | Orchestrate ByType section creation        | STAY        |
| A     | `collectSections`         | Entry point: accounts → organized sections | STAY        |

### services/file-handling.js

| Group | Function                | Description                       | Disposition                      |
|-------|-------------------------|-----------------------------------|----------------------------------|
| P     | `isTestMode`            | Check URL param for test mode     | STAY                             |
| T     | `hydrateFileHandle`     | Store handle + show reopen banner | **RECLASS → E** (calls `post()`) |
| T     | `toTestFixtureUrl`      | Build URL for test fixture file   | STAY                             |
| E     | `loadFromHandle`        | Load entities from file handle    | STAY                             |
| E     | `openFile`              | Open file picker and load         | STAY                             |
| E     | `reopenFile`            | Request permission and reopen     | STAY                             |
| E     | `loadStoredHandle`      | Load handle from IndexedDB        | STAY                             |
| E     | `openNewFile`           | Dismiss banner + open picker      | STAY                             |
| E     | `loadFromUrl`           | Fetch and load from URL           | STAY                             |
| E     | `loadTestFileIfPresent` | Load test fixture if in test mode | STAY                             |

### services/keymap-routing.js

| Group | Function                  | Description                           | Disposition                                            |
|-------|---------------------------|---------------------------------------|--------------------------------------------------------|
| P     | `isInputElement`          | Check if element is text input        | STAY                                                   |
| T     | `toActiveViewId`          | Get active view from tab layout       | STAY                                                   |
| T     | `toReverseBindings`       | Invert key→action to action→keys      | STAY                                                   |
| T     | `toGroupName`             | Action ID prefix to group name        | STAY                                                   |
| T     | `toUniqueActions`         | Deduplicate actions by ID             | STAY                                                   |
| T     | `toIntent`                | Action to display intent (curried)    | STAY                                                   |
| T     | `toAvailableIntents`      | Collect display intents from registry | STAY                                                   |
| E     | `keydownEffect`           | Create keydown listener effect        | STAY                                                   |
| E     | `handleKeydown`           | Resolve keypress to action            | STAY                                                   |
| E     | `collectAvailableIntents` | Alias for `T.toAvailableIntents`      | **RECLASS → remove** (pure transform, redundant alias) |

### financial-computations/holdings.js

| Group | Function                | Description                                | Disposition |
|-------|-------------------------|--------------------------------------------|-------------|
| P     | `isLotOpenOnDate`       | Check if lot was open on date              | STAY        |
| T     | `toPreviousDay`         | Previous calendar day as ISO string        | STAY        |
| T     | `toAllocationsAsOf`     | Filter allocations to on-or-before date    | STAY        |
| T     | `toRemainingQuantity`   | Quantity after allocations                 | STAY        |
| T     | `toRemainingCostBasis`  | Cost basis after allocations               | STAY        |
| T     | `toLotKey`              | Account+security grouping key              | STAY        |
| T     | `toLotTotals`           | Accumulate quantity and cost from lot      | STAY        |
| T     | `toAggregatedLots`      | Aggregate group of lots into summary       | STAY        |
| T     | `toCashBalanceAsOf`     | Cash balance from transactions as of date  | STAY        |
| T     | `toHolding`             | Enrich aggregated lot into Holding         | STAY        |
| F     | `createCashHolding`     | Cash pseudo-holding for investment account | STAY        |
| A     | `findPriceAsOf`         | Most recent price for security as of date  | STAY        |
| A     | `collectAggregatedLots` | Filter and aggregate open lots             | STAY        |

### utils/holdings-tree.js

| Group | Function              | Description                        | Disposition |
|-------|-----------------------|------------------------------------|-------------|
| T     | `toHoldingsAggregate` | Plain object to HoldingsAggregate  | STAY        |
| T     | `toHoldingNode`       | Holding to tree leaf node          | STAY        |
| T     | `toGroupNode`         | Aggregated node to tree group node | STAY        |

### components/AccountList.jsx

| Group | Function                      | Description                                 | Disposition                                                                       |
|-------|-------------------------------|---------------------------------------------|-----------------------------------------------------------------------------------|
| T     | `toFormattedBalance`          | Currency with near-zero and negative parens | **MOVE** → `utils/formatters.js` or `EnrichedAccount.type.js`                     |
| T     | `toFormattedDayChange`        | Day change with sign prefix                 | **MOVE** → same                                                                   |
| T     | `toDayChangeColor`            | Green/red based on sign                     | **MOVE** → same                                                                   |
| E     | `handleSortModeChange`        | Dispatch sort mode change                   | STAY                                                                              |
| E     | `handleSectionToggle`         | Dispatch toggle section collapsed           | STAY                                                                              |
| E     | `handleAccountClick`          | Open register view for account              | STAY                                                                              |
| —     | SectionHeader inline `reduce` | Computes subtotals in component             | **MOVE** → `_organizedAccounts` selector (precompute subtotals on AccountSection) |

### components/FilterChipRow.jsx

| Group | Function              | Description                                 | Disposition                                        |
|-------|-----------------------|---------------------------------------------|----------------------------------------------------|
| T     | `toFilterActions`     | Build action-registration array from config | STAY — wiring (ActionRegistry config construction) |
| E     | `filterActionsEffect` | Register filter-focus actions               | STAY                                               |

### components/FilterChips.jsx

| Group | Function               | Description                            | Disposition         |
|-------|------------------------|----------------------------------------|---------------------|
| T     | `toCurrentOption`      | Find option from list by value         | **MOVE** → selector |
| T     | `toItems`              | `{value,label}` → `{id,label}`         | **MOVE** → selector |
| T     | `toSelectedItems`      | Filter items by ID                     | **MOVE** → selector |
| F     | `makeChipTriggerStyle` | Chip trigger style with width/active   | STAY                |
| F     | `makeOptionStyle`      | Option style with selected/highlighted | STAY                |
| E     | `handleToggleCategory` | Dispatch add/remove category filter    | STAY                |

### components/TabGroup.jsx

| Group | Function               | Description                       | Disposition                             |
|-------|------------------------|-----------------------------------|-----------------------------------------|
| P     | `isInvestmentAccount`  | Check account type                | **MOVE** → `Account.type.js`            |
| T     | `toViewColor`          | View type → accent color          | **MOVE** → utility or selector          |
| T     | `toDragData`           | Parse drag event JSON             | STAY — wiring (DataTransfer API)        |
| T     | `toTabStyle`           | Compute tab styling from state    | **MOVE** → utility or reclassify to F   |
| T     | `toSerializedDragData` | Serialize IDs for drag transfer   | STAY — wiring (DataTransfer API)        |
| T     | `toTabProps`           | Assemble props for Tab child      | STAY — wiring (prop assembly for child) |
| F     | `createRegisterPage`   | Return correct register component | STAY                                    |

### components/TabGroupContainer.jsx

| Group | Function             | Description                           | Disposition               |
|-------|----------------------|---------------------------------------|---------------------------|
| T     | `toClampedWidths`    | Clamp widths to min percentage        | **MOVE** → utility module |
| E     | `persistGroupWidths` | Calculate and dispatch new widths     | STAY                      |
| E     | `handleDragCleanup`  | Reset drag state, remove listeners    | STAY                      |
| E     | `handleDragInit`     | Initialize drag, attach listeners     | STAY                      |
| E     | `persistHandleColor` | Update handle background for feedback | STAY                      |

### components/RootLayout.jsx

| Group | Function                | Description                             | Disposition |
|-------|-------------------------|-----------------------------------------|-------------|
| E     | `toggleShortcutsEffect` | Register global toggle-shortcuts action | STAY        |

### pages/CategoryReportPage.jsx

| Group | Function      | Description                    | Disposition         |
|-------|---------------|--------------------------------|---------------------|
| P     | `canExpand`   | Check if tree row has children | STAY                |
| T     | `toChildRows` | Extract children for DataTable | **MOVE** → selector |

### pages/TransactionRegisterPage.jsx

| Group | Function                    | Description                    | Disposition                        |
|-------|-----------------------------|--------------------------------|------------------------------------|
| P     | `shouldInitializeDateRange` | Check if date range needs init | **DEDUP** → shared register module |
| T     | `toTableLayoutId`           | `cols_account_${id}`           | **DEDUP** → shared register module |
| T     | `toRowIndex`                | Find transaction index by ID   | **DEDUP** → shared register module |
| T     | `toDefaultDateRange`        | Last 12 months date range      | **DEDUP** → shared register module |
| E     | `dispatchHighlightChange`   | Resolve ID to index, dispatch  | **DEDUP** → shared register module |
| E     | `initDateRangeIfNeeded`     | Init date range if not set     | **DEDUP** → shared register module |
| E     | `clearSearch`               | Clear search query and index   | **DEDUP** → shared register module |
| E     | `ensureTableLayoutEffect`   | Ensure table layout exists     | **DEDUP** → shared register module |

### pages/InvestmentRegisterPage.jsx

| Group | Function                    | Description                                   | Disposition                     |
|-------|-----------------------------|-----------------------------------------------|---------------------------------|
| P     | `shouldInitializeDateRange` | (identical to TransactionRegisterPage)        | **DEDUP**                       |
| T     | `toTableLayoutId`           | `cols_investment_${id}` (only prefix differs) | **DEDUP** (parameterize prefix) |
| T     | `toRowIndex`                | (identical)                                   | **DEDUP**                       |
| T     | `toDefaultDateRange`        | (identical)                                   | **DEDUP**                       |
| E     | `dispatchHighlightChange`   | (identical)                                   | **DEDUP**                       |
| E     | `initDateRangeIfNeeded`     | (identical)                                   | **DEDUP**                       |
| E     | `clearSearch`               | (identical)                                   | **DEDUP**                       |
| E     | `ensureTableLayoutEffect`   | (identical)                                   | **DEDUP**                       |

### pages/InvestmentReportPage.jsx

| Group | Function               | Description                        | Disposition |
|-------|------------------------|------------------------------------|-------------|
| E     | `dispatchTreeExpanded` | Resolve TanStack updater, dispatch | STAY        |
| E     | `dispatchColumnSizing` | Resolve TanStack updater, dispatch | STAY        |

## Effort Estimate

| Work item                                           | Time           | Risk    |
|-----------------------------------------------------|----------------|---------|
| Extract shared register module (8 functions, dedup) | 45 min         | Low     |
| Move AccountList T (3 functions) to formatters/type | 30 min         | Low     |
| Move TabGroup `toViewColor` + `toTabStyle`          | 20 min         | Low     |
| Move TabGroupContainer `toClampedWidths`            | 10 min         | Low     |
| Reclass `file-handling.js` T→E                      | 5 min          | Low     |
| Remove `keymap-routing.js` alias                    | 5 min          | Low     |
| Update imports, run tests                           | 30 min         | Low     |
| **Clear violations total**                          | **~2.5 hours** | **Low** |

Borderlines are resolved — see decisions below. Total scope increases by ~1.5 hours.

## Resolved Decisions

1. **Display formatters → `utils/formatters.js`** — they're presentation logic, not business logic on the type. Consider
   reifying "formatting" as a broader concept in the style cards.

2. **map/filter/find in components → move to selectors.** Even trivial shape conversions should be centralized. Leaving
   transforms in components loses abstraction opportunities, even small ones. FilterChips `toCurrentOption`, `toItems`,
   `toSelectedItems` all move.

3. **selectors.js splitting → not yet.** Revisit after the migration — if new `@graffio/functional` utilities absorb
   repeated patterns, it may shrink.

4. **All BORDER items resolved now.** Borderlines are where the best simplifying patterns emerge. Decisions:

| Function               | File               | Decision | Destination                                                          |
|------------------------|--------------------|----------|----------------------------------------------------------------------|
| `toCurrentOption`      | FilterChips        | **MOVE** | Selector                                                             |
| `toItems`              | FilterChips        | **MOVE** | Selector                                                             |
| `toSelectedItems`      | FilterChips        | **MOVE** | Selector                                                             |
| `toFilterActions`      | FilterChipRow      | **STAY** | Wiring (ActionRegistry config construction)                          |
| `isInvestmentAccount`  | TabGroup           | **MOVE** | `Account.type.js`                                                    |
| `toDragData`           | TabGroup           | **STAY** | Wiring (DataTransfer JSON parse)                                     |
| `toSerializedDragData` | TabGroup           | **STAY** | Wiring (DataTransfer JSON stringify)                                 |
| `toTabProps`           | TabGroup           | **STAY** | Wiring (prop assembly for child)                                     |
| `toChildRows`          | CategoryReportPage | **MOVE** | Selector                                                             |
| SectionHeader `reduce` | AccountList        | **MOVE** | Selector (`_organizedAccounts` includes subtotals on AccountSection) |

5. **SectionHeader inline computation → fix.** Clear violation — business logic (summing balances) inline in a
   component. Move to `_organizedAccounts` selector so AccountSection includes precomputed subtotals.

---

## Selectors Assessment (`store/selectors.js`)

496 lines. Uses domain namespaces (UI, Transactions, Holdings, Accounts, Categories) instead of P/T/F/V/A/E — documented
via COMPLEXITY comment.

### 1. Naming Quality

**Good patterns:**

- Pure state accessors (`accounts`, `categories`, `tabLayout`) — clean, match state shape
- Entity lookups (`accountName`, `securityName`) — `{entity}{field}` pattern, clear
- UI namespace accessors follow Redux field names exactly — zero translation cost
- Holdings namespace (`asOf`, `tree`) — terse, context-supplied by namespace

**Weak patterns:**

- Transaction selectors use inconsistent adjective-vs-compound-noun patterns: `enriched`, `filtered` (adjective) vs
  `sortedForDisplay`, `filteredForAccount` (compound). The adjective style requires you to know what's being described (
  transactions) from namespace context alone.
- `_highlightedId` / `_highlightedIdForBank` — the "ForBank" suffix means "bank register" but reads like "for a bank
  entity". Would be clearer as `_highlightedIdBank` to mirror the `_sortedForBankDisplay` / `_sortedForDisplay` pair
  pattern.
- `_filterPopoverData` — "data" is vague. It computes popover *navigation state* (highlight index, prev/next, filtered
  items). Something like `_filterPopoverNav` would be more precise.
- `_filterCounts` — the function also returns `isFiltering`, so it's not purely counts. It's a filter *summary*.

**Private naming:**

- Underscore-prefixed `_` functions are the raw (unmemoized) versions. The memoized versions go on the namespace object.
  This is consistent and mechanical — works well.

### 2. Natural Cohesion Groups

The selectors don't use P/T/F/V/A/E. If we look at what they *are*, there are four natural clusters:

| Cluster                  | Members                                                                                                                                                                                                                                             | Shared trait                                                                |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Accessors**            | 14 pure state accessors + 4 entity lookups + UI namespace field accessors                                                                                                                                                                           | `state => state.x` or `state.x.get(id).field` — zero derivation             |
| **Derived (per-key)**    | `_filtered`, `_enriched`, `_forAccount`, `_filteredForAccount`, `_filteredForInvestment`, `_sortedForDisplay`, `_sortedForBankDisplay`, `_highlightedId`, `_highlightedIdForBank`, `_searchMatches`                                                 | Compose other selectors + delegate to business modules, memoized per viewId |
| **UI-derived (per-key)** | `_accountFilterData`, `_securityFilterData`, `_actionFilterData`, `_categoryFilterData`, `_filterPopoverData`, `_dateChipData`, `_categoryChipData`, `_accountChipData`, `_securityChipData`, `_actionChipData`, `_searchChipData`, `_filterCounts` | Pre-join filter state + entity data for chip/popover display                |
| **Indexes**              | `priceIndex`, `allocationIndex`, `transactionIndex`                                                                                                                                                                                                 | Build lookup structures for downstream computation                          |

The domain namespaces (UI, Transactions, Holdings, Accounts, Categories) are better for consumers than these internal
clusters. The clusters describe *how* selectors work; the namespaces describe *what domain question* they answer. Keep
the domain namespaces.

### 3. Which Functions Do Too Much

**`_filterPopoverData`** (lines 186–222) — performs 4 distinct operations in one body:

1. Source item lookup via `POPOVER_ITEM_SOURCES[popoverId]`
2. Text filtering via `containsIgnoreCase`
3. Highlight index arithmetic (clamp, next, prev, wrap-around)
4. Output object construction

The highlight arithmetic is pure math independent of Redux state. Extracting it to a utility (e.g.,
`toWrappingHighlight(index, count) → { highlighted, next, prev }`) would make this testable without Redux.

**`_filterCounts`** (lines 277–287) — does three things:

1. Applies filter to get filtered transactions
2. Optionally scopes to account
3. Computes count + isFiltering boolean

The `isFiltering` check duplicates knowledge about what "unfiltered" means (`dateRangeKey !== 'all'`,
`filterQuery?.length > 0`). This could be `TransactionFilter.isActive(f)`.

**`_sortedForDisplay` / `_sortedForBankDisplay`** (lines 417–434) — these are identical except for which filter selector
they call (`filteredForInvestment` vs `filteredForAccount`). Should be parameterized.

**`_highlightedId` / `_highlightedIdForBank`** (lines 423–442) — same: identical logic, different sort selector. Should
be parameterized.

**`_organizedAccounts`** (lines 338–343) — calls `Holdings.asOf` with a hardcoded view ID (`ACCOUNT_LIST_VIEW_ID`). This
couples the account list to a specific view slot. Not necessarily "too much" but the coupling is worth noting.

### 4. `@graffio/functional` Migration Opportunities

**Already using well:**

- `applySort` — used correctly in sort selectors
- `containsIgnoreCase` — used for popover text filtering
- `memoizeReduxState` / `memoizeReduxStatePerKey` — used consistently for all derived selectors
- `LookupTable` — used for organized accounts output

**Could use more of what exists:**

- `pipe` — the chip data selectors are 3-step pipelines (get selected → resolve labels → truncate + wrap). Not huge wins
  individually, but with the right abstractions below they'd become single `pipe` calls.
- `pluck` — not directly applicable (the lookups go through `.get(id).field`, not array-of-objects), but signals the
  pattern is common enough to warrant something

**Repeated patterns that are candidates to add to `@graffio/functional`:**

These keep showing up at a slightly higher level than what's in the library today:

| Pattern                        | Occurrences                                                         | What it does                                                                                                                       | Proposed API                                                                                            |
|--------------------------------|---------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **Resolve IDs through lookup** | 5 chip selectors + 3 filter data selectors                          | `ids.map(id => lookup.get(id)?.field \|\| id)` — map an array of IDs to display values via a LookupTable                           | `LookupTable.prototype.pluckMany(ids, field, fallback?)` or standalone `resolveIds(ids, lookup, field)` |
| **Truncate with count**        | 6 chip selectors via `toTruncatedDetails`                           | `['a','b','c','d','e']` → `['a','b','+3 more']` — show first N items with overflow summary                                         | `truncateWithCount(items, max, formatter?)`                                                             |
| **Wrapping index navigation**  | `_filterPopoverData` highlight arithmetic                           | Clamp index to range, compute next/prev with wrap-around                                                                           | `wrapIndex(index, count)` → `{ index, next, prev }`                                                     |
| **Mark selected in list**      | 3 filter data selectors                                             | `items.map(item => ({ ...item, isSelected: selectedIds.includes(item.id) }))` — annotate items with selection state from an ID set | `withSelection(items, selectedIds, idField?)`                                                           |
| **Build {id, label} pairs**    | `POPOVER_ITEM_SOURCES` (5 sources) + filter data badge construction | `collection.map(item => ({ id: item.id, label: item[labelField] }))` — project entities to popover/chip display shape              | `toIdLabelPairs(items, labelField)` or a LookupTable method                                             |

**Why these belong in `@graffio/functional`:**

- They're not domain-specific — any filter UI, any list navigation, any selection UI would use them
- They're the kind of fiddly-to-get-right utilities people inline repeatedly (especially `wrapIndex` — the
  off-by-one/edge-case logic is 10 lines every time)
- `resolveIds` is LookupTable-adjacent — it's the natural companion to `.get()` for batch operations
- `truncateWithCount` and `withSelection` are pure list operations with no domain knowledge

**Composition example** — with these additions, `_accountChipData` goes from:

```js
const _accountChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    const names = selected.map(id => accounts(state).get(id)?.name || id)
    return { isActive: selected.length > 0, details: toTruncatedDetails(names) }
}
```

to:

```js
const _accountChipData = (state, viewId) => {
    const selected = filter(state, viewId).selectedAccounts
    return { isActive: selected.length > 0, details: truncateWithCount(accounts(state).pluckMany(selected, 'name'), 3) }
}
```

And `_filterPopoverData`'s highlight block (10 lines) becomes `wrapIndex(filterPopoverHighlight, count)`.

### 5. Type.js Migration Opportunities

**Context:** Type definition `.type.js` files live in `type-definitions/` directories (e.g.,
`modules/quicken-web-app/type-definitions/transaction-filter.type.js`). They already contain business logic —
`TransactionFilter.apply()`, `Transaction.matchesText()`, etc. The code generator copies these methods into the
generated `types/*.js` files. New business logic goes in the `.type.js` files.

**Candidates:**

| Selector concern               | Destination                                                                 | Rationale                                                                                                                                                                                                                            |
|--------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `INVESTMENT_ACTIONS` constant  | `transaction.type.js`                                                       | Domain knowledge about investment action types. The `investmentAction` regex already lives in the Transaction definition — the label mapping belongs with it. Currently duplicated as `ACTION_LABELS_MAP` in selectors.              |
| `toTruncatedDetails`           | `utils/formatters.js`                                                       | Pure display utility — truncate list with "+N more". Not domain logic, not Redux-dependent.                                                                                                                                          |
| `POPOVER_ITEM_SOURCES` pattern | `toFilterItem()` methods on each type                                       | Each source lambda knows how to turn an entity into `{id, label}`. That's a display representation method: `Account.toFilterItem(account)`, `Security.toFilterItem(security)`.                                                       |
| Highlight wrapping arithmetic  | `utils/highlight-navigation.js` or similar                                  | Pure `(index, count) → {highlighted, next, prev}`. No domain knowledge.                                                                                                                                                              |
| `_isFiltering` check           | `transaction-filter.type.js` as `TransactionFilter.isActive(f)`             | The filter already has `apply()` and `applyInvestment()`. It knows what "default" means — `isActive` belongs here. Currently the selector reconstructs this from field checks (`dateRangeKey !== 'all'`, `filterQuery?.length > 0`). |
| Chip data badge construction   | `transaction-filter.type.js` as `TransactionFilter.toChipData(f, entities)` | The pattern of "get selected IDs → look up labels → check isActive" repeats 6 times. The filter type is the natural owner. `TransactionFilter` already owns the filter criteria — it should own the display representation too.      |

**Not worth moving:**

- `_filtered`, `_enriched`, `_forAccount` — already thin: one-line calls to `TransactionFilter.apply()`,
  `Transaction.enrichAll()`, etc. The Redux wiring (which state keys, which filter to pass) *is* selector work.
- Index builders (`priceIndex`, `allocationIndex`, `transactionIndex`) — already delegate to `HoldingsModule`. The
  memoization wrapper is the selector's job.

### 6. Business Logic Reorganization

**Repeated filter-chip pattern** — The 6 chip data selectors (`_dateChipData`, `_categoryChipData`, `_accountChipData`,
`_securityChipData`, `_actionChipData`, `_searchChipData`) each follow:

1. Read selected IDs from filter
2. Look up display labels from entity store
3. Return `{ isActive, details: toTruncatedDetails(labels) }`

This is `TransactionFilter.toChipSummary(filterField, entityLookup)` generalized. Moving this to the type means chip
selectors become one-liners: `TransactionFilter.toChipSummary(f.selectedAccounts, id => accounts(state).get(id).name)`.

**Duplicated sort+highlight pairs** — `_sortedForDisplay`/`_sortedForBankDisplay` and `_highlightedId`/
`_highlightedIdForBank` each differ only in which filter selector they call. These could be parameterized:

```
const _makeSortedSelector = filterSelector => (state, viewId, accountId, tableLayoutId, columns) => { ... }
const _makeHighlightSelector = sortSelector => (state, viewId, accountId, tableLayoutId, columns) => { ... }
```

This eliminates 4 duplicated function bodies (2 pairs × 2 bodies).

**Filter data selectors** — `_accountFilterData`, `_securityFilterData`, `_actionFilterData`, `_categoryFilterData`
follow the same pattern:

1. Read selected IDs
2. Map entities to rows with `isSelected`
3. Map selected IDs to badges with labels
4. Return `{ rows, badges, count }`

A generalized helper could handle this, but the entity shapes differ enough (accounts have `name`, securities have
`symbol`, actions have `label`) that the generalization might obscure rather than clarify. **Borderline.**

**`_organizedAccounts` coupling** — This selector calls `Holdings.asOf(state, ACCOUNT_LIST_VIEW_ID)`, hardcoding that
the account list uses a specific view ID for holdings data. If the account list ever needs different filter settings,
this breaks. The fix is to pass the view ID as a parameter, but that requires the account list component to know its
view ID. **Low priority — works today.**

### Selectors Disposition Table

| Selector                                              | Assessment            | Notes                                                   |
|-------------------------------------------------------|-----------------------|---------------------------------------------------------|
| 14 pure state accessors                               | **STAY**              | Correct thin wiring                                     |
| 4 entity lookups                                      | **STAY**              | Simple `.get(id).field`                                 |
| `UI` field accessors (~23)                            | **STAY**              | Filter/viewUi field projections                         |
| `_accountFilterData`                                  | **STAY** (borderline) | Could generalize, marginal benefit                      |
| `_securityFilterData`                                 | **STAY** (borderline) | Same                                                    |
| `_actionFilterData`                                   | **STAY** (borderline) | Same                                                    |
| `_categoryFilterData`                                 | **STAY**              | Simpler variant                                         |
| `_filterPopoverData`                                  | **SPLIT**             | Extract highlight arithmetic to utility                 |
| `_dateChipData`                                       | **STAY**              | 3 lines                                                 |
| `_categoryChipData`                                   | **STAY**              | 2 lines                                                 |
| `_accountChipData`                                    | **STAY**              | 3 lines                                                 |
| `_securityChipData`                                   | **STAY**              | 3 lines                                                 |
| `_actionChipData`                                     | **STAY**              | 3 lines                                                 |
| `_searchChipData`                                     | **STAY**              | 2 lines                                                 |
| `_filterCounts`                                       | **REFACTOR**          | Extract `isFiltering` to `TransactionFilter.isActive()` |
| `activeViewId`                                        | **STAY**              | Thin accessor                                           |
| `tableLayoutProps`                                    | **STAY**              | Simple delegation to utility                            |
| `_organizedAccounts`                                  | **STAY**              | Clean orchestration                                     |
| `priceIndex` / `allocationIndex` / `transactionIndex` | **STAY**              | Memoized index builders                                 |
| `_holdingsAsOf`                                       | **STAY**              | Delegates to HoldingsModule                             |
| `_holdingsTree`                                       | **STAY**              | Delegates to HoldingsTree                               |
| `_filtered`                                           | **STAY**              | One-liner delegation                                    |
| `_enriched`                                           | **STAY**              | One-liner delegation                                    |
| `_forAccount`                                         | **STAY**              | One-liner filter                                        |
| `_filteredForAccount`                                 | **STAY**              | One-liner composition                                   |
| `_filteredForInvestment`                              | **STAY**              | One-liner delegation                                    |
| `_sortedForDisplay`                                   | **DEDUP**             | Parameterize with `_sortedForBankDisplay`               |
| `_sortedForBankDisplay`                               | **DEDUP**             | Parameterize with `_sortedForDisplay`                   |
| `_highlightedId`                                      | **DEDUP**             | Parameterize with `_highlightedIdForBank`               |
| `_highlightedIdForBank`                               | **DEDUP**             | Parameterize with `_highlightedId`                      |
| `_searchMatches`                                      | **STAY**              | One-liner delegation                                    |
| `INVESTMENT_ACTIONS`                                  | **MOVE**              | → Transaction type                                      |
| `toTruncatedDetails`                                  | **MOVE**              | → `utils/formatters.js`                                 |
| `POPOVER_ITEM_SOURCES`                                | **BORDER**            | Could become `toFilterItem()` methods on types          |
| `getDefaultFilter` / `getDefaultViewUi`               | **STAY**              | Caching infrastructure, correct placement               |

### Summary

Selectors.js is mostly well-structured. The selector style card says "Redux mechanics and simple derivation" and most
selectors comply. The issues are:

- **4 duplicated function bodies** (2 sort + 2 highlight pairs) — straightforward dedup
- **1 function doing too much** (`_filterPopoverData`) — extract highlight arithmetic
- **2 misplaced constants/utilities** (`INVESTMENT_ACTIONS`, `toTruncatedDetails`)
- **1 missing type method** (`TransactionFilter.isActive`)
- Several borderline items where generalization is possible but marginal

---

## Implementation Dependency Order

The migration has a dependency chain — later steps assume earlier ones exist.

1. **`@graffio/functional` additions first** — `toggleItem`, `truncateWithCount`, `wrapIndex`, `pluckMany`, `withSelection`, `toIdLabelPairs`. These need to exist before destination code can use them.
2. **Type.js additions second** — `INVESTMENT_ACTIONS` → Transaction, `TransactionFilter.isActive()`, `Account.isInvestment()`. Same reason.
3. **Moves/dedup/reclass third** — component functions move to selectors/utilities/types that now have the right abstractions available.
4. **Selectors refactoring last** — parameterize sort/highlight pairs, split `_filterPopoverData`. Depends on the functional utilities existing.

If this order isn't respected, destination code reimplements the same inline patterns we're trying to eliminate.

## Housekeeping: `no-restricted-syntax` eslint overrides

The eslint rule at `eslint.config.js:68-75` flags any `state.xxx` access — good rule, forces use of selectors. But the exemption paths (line 78) are stale:

- `**/store/reducer.js` — should be `**/store/reducers/*.js` (reducers are in a `reducers/` directory)
- `**/store/selectors/**/*.js` — should be `**/store/selectors.js` (it's a single file, not a directory)

This mismatch is why every reducer has `// eslint-disable-next-line no-restricted-syntax` on every `state.` access, and `selectors.js` has a file-level `/* eslint-disable */`. Fixing the two glob patterns eliminates all those inline disables — a good cleanup to bundle with the migration.

---

## After the Migration: What to Investigate Next

The regrouping changes what's visible and what becomes possible. These are things to revisit once the migration work is complete.

### What the regrouping reveals

**Components become auditable.** Once all T functions are out, a component that has anything beyond P (show/hide predicates), F (style factories), and E (handlers calling `post()`) is a new violation. This makes the style card mechanically enforceable — a linter or review agent could flag any T/A function in a `.jsx` file.

**Selectors.js: split or shrink?** We deferred splitting. After the migration, two forces act on it:
- *Growth*: FilterChips `toCurrentOption`/`toItems`/`toSelectedItems`, CategoryReportPage `toChildRows`, and SectionHeader subtotals all move into selectors
- *Shrinkage*: if the `@graffio/functional` additions (`pluckMany`, `truncateWithCount`, `wrapIndex`, `withSelection`) absorb repeated patterns, chip/filter selectors get shorter

Revisit the line count and cohesion after both forces have played out. If it grew, the UI-derived selectors (chip data, filter data, popover data) are the natural split point — they serve a different consumer (FilterChips) than the transaction/holdings selectors.

**Reducer buried utilities.** We found `toggleItem` and `toTodayIso` in transaction-filters.js — generic operations hiding in a reducer. After moving those to `@graffio/functional`, audit the other reducers for the same pattern. The reducer T/F groups may contain more generic operations that should be library utilities.

**The "formatting" layer.** Display formatters land in `utils/formatters.js`, but the style cards don't currently describe formatting as a concept. After the AccountList formatters move, we'll have a concrete collection to examine: `formatCurrency`, `formatDateRange`, `toFormattedBalance`, `toFormattedDayChange`, `toDayChangeColor`, `toTruncatedDetails`. Is there a "formatter style card" that would help? What rules would it contain? (e.g., formatters are pure, take domain values, return display strings/styles, never touch state.)

### What the regrouping enables

**`TransactionFilter` as the filter display owner.** After `TransactionFilter.isActive()` exists and `INVESTMENT_ACTIONS` lives on Transaction, the path to `TransactionFilter.toChipSummary()` is clearer. The 6 chip selectors repeat the same get-selected → resolve-labels → truncate pipeline. If the filter type owns that pipeline, chip selectors become one-liners. Re-evaluate after the type methods exist.

**Filter data generalization.** The 4 filter data selectors (`_accountFilterData`, `_securityFilterData`, `_actionFilterData`, `_categoryFilterData`) were marked borderline because entity shapes differ. After `toIdLabelPairs` and `withSelection` exist in functional, revisit: does the generalization become natural, or is the shape difference still a problem?

**`POPOVER_ITEM_SOURCES` → type methods.** We marked this BORDER. After `INVESTMENT_ACTIONS` moves to Transaction, the popover sources become:
- `accounts: state => accounts(state).map(Account.toFilterItem)`
- `actions: () => Transaction.INVESTMENT_ACTIONS.map(toIdLabelPairs('label'))`
- `categories: state => Category.collectAllNames(...).map(name => ({id: name, label: name}))`
- `securities: state => securities(state).map(Security.toFilterItem)`

If `toFilterItem()` methods land on the types, the `POPOVER_ITEM_SOURCES` object becomes trivial delegation and might not need to exist as a separate lookup at all.

**Shared register module as an abstraction surface.** After deduping the 8 register functions into a shared module, that module becomes the single place to evolve register behavior. Questions to ask:
- Should the shared module parameterize more than just the table layout prefix? (e.g., which filter selector, which columns)
- Does the pattern suggest a `RegisterView` type or configuration object?
- Can the two register pages become a single parameterized component?

**`@graffio/functional` additions ripple outward.** The 5 proposed utilities (`pluckMany`, `truncateWithCount`, `wrapIndex`, `withSelection`, `toIdLabelPairs`) were identified from selectors, but they're general-purpose. After adding them, audit other files for the same inline patterns — they likely appear in components, services, and business modules too.

### Style card evolution

The migration tests the style cards against real code. Watch for:
- **Rules that were too vague** — did any BORDER decisions require inventing a principle the style card doesn't state?
- **Rules that were too strict** — did any STAY-as-wiring decisions feel like they needed a documented exception pattern?
- **Missing style cards** — do reducers, formatters, or the shared register module need their own cards?
- **The "wiring" boundary** — we decided DataTransfer JSON parse/stringify and prop assembly are wiring, but shape conversions (.find/.map/.filter for child props) are not. That distinction should be captured somewhere enforceable.
