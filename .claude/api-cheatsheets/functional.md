# @graffio/functional API Cheat Sheet

Quick reference for `import { ... } from '@graffio/functional'`

## Array Basics

| Function | Signature                    | Description                        |
|----------|------------------------------|------------------------------------|
| `map`    | `(a -> b, [a]) -> [b]`       | Transform each element             |
| `filter` | `(a -> Bool, [a]) -> [a]`    | Keep elements matching predicate   |
| `reject` | `(a -> Bool, [a]) -> [a]`    | Remove elements matching predicate |
| `reduce` | `((b, a) -> b, b, [a]) -> b` | Fold array to single value         |
| `find`   | `(a -> Bool, [a]) -> a?`     | First element matching predicate   |
| `head`   | `[a] -> a`                   | First element                      |
| `last`   | `[a] -> a`                   | Last element                       |
| `tail`   | `[a] -> [a]`                 | All but first                      |
| `append` | `(a, [a]) -> [a]`            | Add to end (immutable)             |
| `slice`  | `(from, to, [a]) -> [a]`     | Subarray                           |
| `nth`    | `(n, [a]) -> a`              | Element at index                   |

## Array Transforms

| Function     | Signature                  | Description              |
|--------------|----------------------------|--------------------------|
| `compact`    | `[a?] -> [a]`              | Remove nil values        |
| `compactMap` | `(a -> b?, [a]) -> [b]`    | Map then compact         |
| `uniq`       | `[a] -> [a]`               | Remove duplicates        |
| `uniqBy`     | `(a -> k, [a]) -> [a]`     | Unique by key function   |
| `without`    | `(a, [a]) -> [a]`          | Remove item from array   |
| `pluck`      | `(key, [obj]) -> [val]`    | Extract field from each  |
| `sort`       | `((a,a) -> n, [a]) -> [a]` | Sort with comparator     |
| `range`      | `(start, end) -> [Number]` | Generate number sequence |
| `aperture`   | `(n, [a]) -> [[a]]`        | Sliding window of size n |
| `splitEvery` | `(n, [a]) -> [[a]]`        | Chunk into groups of n   |

## Grouping & Collecting

| Function       | Signature                                        | Description                          |
|----------------|--------------------------------------------------|--------------------------------------|
| `groupBy`      | `(a -> String, [a]) -> {k: [a]}`                 | Group by key function                |
| `groupByMulti` | `(a -> [String], [a]) -> {k: [a]}`               | Group where item maps to many keys   |
| `pushToKey`    | `(obj, key, item) -> obj`                        | Append to array at key (immutable)   |
| `mapAccum`     | `((acc, a) -> [acc, b], acc, [a]) -> [acc, [b]]` | Map with accumulator                 |

## Object Operations

| Function     | Signature                   | Description              |
|--------------|-----------------------------|--------------------------|
| `assoc`      | `(key, val, obj) -> obj`    | Set property (immutable) |
| `assocPath`  | `([keys], val, obj) -> obj` | Set nested property      |
| `dissoc`     | `(key, obj) -> obj`         | Remove property          |
| `dissocPath` | `([keys], obj) -> obj`      | Remove nested property   |
| `path`       | `([keys], obj) -> val`      | Get nested value         |
| `pick`       | `([keys], obj) -> obj`      | Select properties        |
| `omit`       | `([keys], obj) -> obj`      | Exclude properties       |
| `keys`       | `obj -> [String]`           | Object keys              |
| `clone`      | `obj -> obj`                | Deep clone               |
| `equals`     | `(a, b) -> Bool`            | Deep equality            |

## Object Transforms

| Function          | Signature                          | Description                        |
|-------------------|------------------------------------|------------------------------------|
| `mapObject`       | `((k, v) -> [k2, v2], obj) -> obj` | Transform keys and values          |
| `mapValues`       | `(v -> v2, obj) -> obj`            | Transform values only              |
| `filterObject`    | `((k, v) -> Bool, obj) -> obj`     | Filter by key/value                |
| `filterValues`    | `(v -> Bool, obj) -> obj`          | Filter by value                    |
| `evolve`          | `({k: v -> v2}, obj) -> obj`       | Apply transforms to matching keys  |
| `renameKeys`      | `({old: new}, obj) -> obj`         | Rename object keys                 |
| `mergeRight`      | `(a, b) -> obj`                    | Shallow merge, b wins              |
| `mergeDeepRight`  | `(a, b) -> obj`                    | Deep merge, b wins                 |
| `removeNilValues` | `obj -> obj`                       | Remove nil properties              |
| `invertObj`       | `{k: v} -> {v: k}`                 | Swap keys and values               |
| `zipObject`       | `([keys], [vals]) -> obj`          | Create object from parallel arrays |

## Object Queries

| Function       | Signature                             | Description                   |
|----------------|---------------------------------------|-------------------------------|
| `findInValues` | `(pred, obj) -> val?`                 | Find value matching predicate |
| `firstKey`     | `obj -> String`                       | First key                     |
| `diffObjects`  | `(a, b) -> {added, removed, changed}` | Compare objects               |

## Utilities

| Function      | Signature        | Description               |
|---------------|------------------|---------------------------|
| `pipe`        | `(...fns) -> fn` | Left-to-right composition |
| `isNil`       | `a -> Bool`      | Is null or undefined      |
| `type`        | `a -> String`    | Type name                 |
| `debounce`    | `(fn, ms) -> fn` | Debounce function         |
| `throttle`    | `(fn, ms) -> fn` | Throttle function         |
| `memoizeOnce` | `fn -> fn`       | Cache single result       |

## LookupTable

Array with id-based lookup. Items accessible by index OR by id.

```javascript
const table = LookupTable(items, ItemType, 'id')
table[0]          // by index
table['abc123']   // by id
table.get('abc123') // same as above
```

| Method             | Signature                       | Description                       |
|--------------------|---------------------------------|-----------------------------------|
| `get`              | `id -> Item?`                   | Get by id                         |
| `filter`           | `pred -> LookupTable`           | Filter (returns LookupTable)      |
| `sort`             | `cmp -> LookupTable`            | Sort (returns LookupTable)        |
| `pick`             | `[ids] -> LookupTable`          | Select by ids                     |
| `addItem`          | `(item, sort?) -> LookupTable`  | Add item                          |
| `addItemWithId`    | `(item, sort?) -> LookupTable`  | Add or replace by id              |
| `removeItem`       | `item -> LookupTable`           | Remove item                       |
| `removeItemWithId` | `id -> LookupTable`             | Remove by id                      |
| `toggleItem`       | `(item, sort?) -> LookupTable`  | Add if missing, remove if present |
| `updateAll`        | `(Item -> Item) -> LookupTable` | Transform all items               |
| `updateWhere`      | `(pred, fn) -> LookupTable`     | Transform matching items          |
| `moveElement`      | `(from, to) -> LookupTable`     | Reorder                           |
| `prepend`          | `item -> LookupTable`           | Add to front                      |
| `includesWithId`   | `id -> Bool`                    | Has item with id?                 |
| `hasItemEqualTo`   | `item -> Bool`                  | Has equal item?                   |

## Tree Operations

Build trees from flat hierarchical data (e.g., categories `food:restaurant:lunch`).

| Function        | Signature                                       | Description                  |
|-----------------|-------------------------------------------------|------------------------------|
| `buildTree`     | `((k -> k?), {k: v}) -> [TreeNode]`             | Build tree from flat groups  |
| `aggregateTree` | `((v, [agg]) -> agg, [TreeNode]) -> [TreeNode]` | Compute aggregates bottom-up |
| `flattenTree`   | `((TreeNode, depth) -> a, [TreeNode]) -> [a]`   | Flatten tree depth-first     |

```javascript
// TreeNode = { key: String, value: a, children: [TreeNode], aggregate?: b }
// Caller provides getParent function (derive from path, lookup table, etc.)
const getParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}
const groups = { food: [...], 'food:restaurant': [...] }
const tree = buildTree(getParent, groups)
const aggregated = aggregateTree((items, childAggs) => sum(items) + sum(childAggs), tree)
const flat = flattenTree((node, depth) => ({ name: node.key, depth }), aggregated)
```

## Date Utils

```javascript
import { startOfMonth, addDays, parseIsoDateFormat } from '@graffio/functional'
```

| Function                      | Description                    |
|-------------------------------|--------------------------------|
| `startOfDay/endOfDay`         | Day boundaries                 |
| `startOfWeek/endOfWeek`       | Week boundaries (Sunday start) |
| `startOfMonth/endOfMonth`     | Month boundaries               |
| `startOfQuarter/endOfQuarter` | Quarter boundaries             |
| `startOfYear/endOfYear`       | Year boundaries                |
| `addDays/subtractDays`        | Add/subtract days              |
| `parseIsoDateFormat`          | Parse "YYYY-MM-DD"             |
| `parseSlashDateFormat`        | Parse "MM/DD/YYYY"             |
| `formatDateString`            | Format to string               |
