---
title: Search match navigation ignores column sort order
category: runtime-errors
tags: [navigation, search, sorting, register]
module: quicken-web-app
symptoms:
  - Search match navigation follows date order instead of display order
  - Pressing Return jumps to wrong row when table is column-sorted
  - Navigation skips visible matches or jumps backwards visually
---

# Search Match Navigation Ignores Column Sort Order

## Solution

Rewrote `toAdjacentMatchRowIdx` to delegate to `toNearestMatchRowIdx`:

```js
const toAdjacentMatchRowIdx = (data, matchIds, currentIdx, dir) => {
    const currentRowIdx = toRowIndex(data, matchIds[currentIdx])
    return toNearestMatchRowIdx(data, matchIds, currentRowIdx, dir)
}
```

This converts from match-list index to display row index, then uses the existing correct navigation.

## Prevention

When navigating a sorted collection, always navigate by **display position** (index in the rendered
array), not by **source order** (index in the selector/store array). If two functions navigate the
same data, they should use the same ordering strategy.

## Problem

When the register table is sorted by a non-date column (e.g., Amount), pressing Return to navigate
to the next search match jumps to the next match in **date order** instead of the current
**display (sort) order**.

## Investigation

Traced data flow: `state.transactions` (date order) -> `T.filteredForAccount` (preserves date order)
-> `Transaction.collectSearchMatchIds` (preserves input order) -> `searchMatches` selector (date order).

`toAdjacentMatchRowIdx` received `matchIds` in date order and stepped through them by array index:
```js
const targetIdx = (currentIdx + dir + matchIds.length) % matchIds.length
return toRowIndex(data, matchIds[targetIdx])
```

This always navigated in date order regardless of how `data` (the display-ordered rows) was sorted.

## Root Cause

Two separate orderings exist: **match-list order** (from selectors, always date order) and
**display order** (from sorted data array). `toAdjacentMatchRowIdx` navigated by match-list index
instead of display position.

Meanwhile, `toNearestMatchRowIdx` (used when not already on a match) correctly navigated by display
position using modular distance in the `data` array.
