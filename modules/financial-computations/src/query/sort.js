// ABOUTME: Multi-column sort with nested key support
// ABOUTME: SortSpec = { id: String, desc: Boolean } - compatible with TanStack Table

import { path } from '@graffio/functional'

const P = {
    // @sig isNullish :: Any -> Boolean
    isNullish: v => v == null,
}

const T = {
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

    // @sig toAccessorKey :: (LookupTable?, String) -> String
    toAccessorKey: (columns, id) => {
        const column = columns?.get ? columns.get(id) : columns?.find(c => c.id === id)
        return column?.accessorKey || column?.id || id
    },

    // @sig toComparator :: ([SortSpec], LookupTable?) -> (a, b) -> Number
    toComparator: (sorting, columns) => (a, b) => {
        const { id, desc } = sorting[0]
        const key = T.toAccessorKey(columns, id)
        const cmp = T.toCompareResult(path(key, a), path(key, b))
        return desc ? -cmp : cmp
    },
}

// Sorts items by SortSpec array (first spec wins)
// @sig applySort :: ([SortSpec], [a], LookupTable?) -> [a]
const applySort = (sorting, items, columns) =>
    sorting?.length ? [...items].sort(T.toComparator(sorting, columns)) : items

export { applySort }
