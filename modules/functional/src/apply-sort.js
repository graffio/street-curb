// ABOUTME: Multi-column sort with nested key support
// ABOUTME: SortSpec = { id: String, desc: Boolean } - compatible with TanStack Table

import path from './ramda-like/path.js'

const P = {
    // Checks if value is null or undefined
    // @sig isNullish :: Any -> Boolean
    isNullish: v => v == null,
}

const T = {
    // Compares two values and returns sort-compatible result
    // @sig toCompareResult :: (Any, Any) -> Number
    toCompareResult: (a, b) => {
        if (P.isNullish(a) && P.isNullish(b)) return 0
        if (P.isNullish(a)) return 1
        if (P.isNullish(b)) return -1
        if (typeof a === 'string' && typeof b === 'string')
            return a.localeCompare(b, undefined, { sensitivity: 'base' })

        if (a < b) return -1
        if (a > b) return 1
        return 0
    },

    // Resolves column id to accessor key for nested property access
    // @sig toAccessorKey :: (LookupTable, String) -> String
    toAccessorKey: (columns, id) => {
        const column = columns.get(id)
        return column?.accessorKey || column?.id || id
    },

    // Creates a comparator function from sort spec
    // @sig toComparator :: ([SortSpec], LookupTable) -> (a, b) -> Number
    toComparator: (sorting, columns) => (a, b) => {
        const { id, desc } = sorting[0]
        const key = T.toAccessorKey(columns, id)
        const cmp = T.toCompareResult(path(key, a), path(key, b))
        return desc ? -cmp : cmp
    },
}

// Sorts items by SortSpec array (first spec wins, empty array = no sort)
// @sig applySort :: ([SortSpec], [a], LookupTable) -> [a]
const applySort = (sorting, items, columns) =>
    sorting.length ? [...items].sort(T.toComparator(sorting, columns)) : items

export default applySort
