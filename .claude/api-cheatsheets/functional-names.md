# @graffio/functional — Available Functions

Use these instead of rolling your own. `import { ... } from '@graffio/functional'`

**Array:** map, filter, reject, reduce, find, head, last, tail, append, slice, nth
**Array transforms:** compact, compactMap, uniq, uniqBy, without, pluck, sort, range, aperture, splitEvery
**Grouping:** groupBy, groupByMulti, pushToKey, mapAccum
**Object:** assoc, assocPath, dissoc, dissocPath, path, pick, omit, keys, clone, equals
**Object transforms:** mapObject, mapValues, filterObject, filterValues, evolve, renameKeys, mergeRight, mergeDeepRight, removeNilValues, invertObj, zipObject
**Object queries:** findInValues, firstKey, diffObjects
**Utilities:** pipe, isNil, type, debounce, throttle, memoizeOnce
**Selectors:** createSelector (supports curried + uncurried usage)
**Dates:** startOfDay/endOfDay, startOfWeek/endOfWeek, startOfMonth/endOfMonth, startOfQuarter/endOfQuarter, startOfYear/endOfYear, addDays/subtractDays, parseIsoDateFormat, parseSlashDateFormat, formatDateString

**Custom data structures (read full API before using):**
- LookupTable — see `api-cheatsheets/lookup-table.md`
- Tree operations — see `api-cheatsheets/tree-operations.md`
