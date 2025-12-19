// ABOUTME: Multi-column stable sort for transactions
// ABOUTME: Works with TanStack Table sorting state format

// Compares two values, handling strings (case-insensitive) and numbers
// @sig compareValues :: (Any, Any) -> Number
const compareValues = (a, b) => {
    if (a == null && b == null) return 0
    if (a == null) return 1
    if (b == null) return -1
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, undefined, { sensitivity: 'base' })
    if (a < b) return -1
    if (a > b) return 1
    return 0
}

// Creates a comparator for multi-column sorting
// @sig sortBy :: ([SortSpec], [Column]?) -> (a, b) -> Number
const sortBy = (sorting, columns = []) => {
    // Gets the accessor key for a column, handling accessorKey vs id
    // @sig getAccessorKey :: (Column, String) -> String
    const getAccessorKey = (column, columnId) => (column ? column.accessorKey || column.id : columnId)

    // Accumulates comparison result for one sort column
    // @sig compareOneColumn :: (Number, { id, desc }, Object, Object, Object) -> Number
    const compareOneColumn = (result, { id, desc }, a, b, columnMap) => {
        if (result !== 0) return result
        const key = getAccessorKey(columnMap[id], id)
        const cmp = compareValues(a[key], b[key])
        return desc ? -cmp : cmp
    }

    const columnMap = Object.fromEntries(columns.map(c => [c.id, c]))

    return (a, b) => sorting.reduce((result, spec) => compareOneColumn(result, spec, a, b, columnMap), 0)
}

// Sorts items by multiple columns
// @sig applySort :: ([SortSpec], [a], [Column]?) -> [a]
const applySort = (sorting, items, columns = []) => {
    if (!sorting || sorting.length === 0) return items
    return [...items].sort(sortBy(sorting, columns))
}

export { compareValues, sortBy, applySort }
