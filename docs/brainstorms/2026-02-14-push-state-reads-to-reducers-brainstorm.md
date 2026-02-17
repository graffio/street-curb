# Push State Reads from E Groups to Reducers

**Date:** 2026-02-14

## What We're Building

Refactor E group functions that read current state via `currentStore().getState()` to instead dispatch semantic intent actions, letting reducers compute next state.

## Why This Approach

Handlers should never read current state — they pass identifiers and payloads to `post()`. When computing next state requires current state, that's the reducer's job (it already has it). The current pattern leaks reducer logic into the component layer.

## Current Callsites

All in `modules/quicken-web-app/src/`:

| File | What it reads | Could become |
|------|--------------|--------------|
| `pages/InvestmentReportPage.jsx` | `treeExpansion` → toggle node | `ToggleTreeNode(viewId, nodeId)` |
| `pages/InvestmentReportPage.jsx` | `columnSizing` → merge update | `MergeColumnSizing(viewId, delta)` |
| `pages/CategoryReportPage.jsx` | `treeExpansion` → toggle node | `ToggleTreeNode(viewId, nodeId)` |
| `components/FilterChips.jsx` | `popoverId`, `filterPopoverData` → navigation | Semantic nav actions |
| `components/FilterChips.jsx` | `popoverId` → dismiss/toggle | `DismissFilterPopover(viewId)` |
| `components/FilterChips.jsx` | `filterPopoverData` → next/prev highlight | `NavigateFilterHighlight(viewId, direction)` |
| `components/FilterChips.jsx` | `dateRangeKey` → date preset cycle | `CycleDateRange(viewId)` |
| `components/RootLayout.jsx` | `showDrawer` → toggle | `ToggleDrawer()` |
| `pages/register-page-commands.js` | Various state for command dispatch | Needs investigation |

`post.js` also reads state for persistence — that's fine, persistence is post's job.

## FilterChips.jsx — Heaviest User

FilterChips has 6 `currentStore().getState()` calls for popover keyboard navigation. This is the densest case and may need its own design pass — the reads are interleaved with navigation logic (next/prev highlight, date preset cycling, dismiss on select). Semantic actions here are less obvious than simple toggles.

## Key Decisions

- Generic setters (`SetViewUiState`) become semantic intents (`ToggleTreeNode`, `ToggleDrawer`)
- Each new action variant needs a reducer case
- FilterChips navigation is the hardest case — multiple reads per action, branching logic

## Open Questions

- Do all callsites justify new action variants, or are some too trivial?
- Should this be one sweep or incremental per-page?
- FilterChips: should navigation state machine live in the reducer, or is there a simpler decomposition?
