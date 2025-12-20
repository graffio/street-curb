// ABOUTME: Multi-column stable sort for transactions
// ABOUTME: Works with TanStack Table sorting state format (SortSpec = { id, desc })

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
// SortSpec is TanStack Table's { id, desc } format
// @sig sortBy :: ([SortSpec], LookupTable<ColumnDefinition>?) -> (a, b) -> Number
const sortBy = (sorting, columns = []) => {
    // Gets column definition by id (supports LookupTable or plain array)
    // @sig getColumn :: String -> ColumnDefinition?
    const getColumn = id => (columns.get ? columns.get(id) : columns.find(c => c.id === id))

    // Gets the accessor key for a column, handling accessorKey vs id
    // @sig getAccessorKey :: (ColumnDefinition?, String) -> String
    const getAccessorKey = (column, columnId) => (column ? column.accessorKey || column.id : columnId)

    // Compares two items by one sort column
    // @sig compareByColumn :: ({ id, desc }, a, b) -> Number
    const compareByColumn = ({ id, desc }, a, b) => {
        const key = getAccessorKey(getColumn(id), id)
        const cmp = compareValues(a[key], b[key])
        return desc ? -cmp : cmp
    }

    // @sig compareAll :: (a, b) -> Number
    const compareAll = (a, b) =>
        sorting.reduce((result, spec) => (result !== 0 ? result : compareByColumn(spec, a, b)), 0)

    return compareAll
}

// Sorts items by multiple columns
// @sig applySort :: ([SortSpec], [a], LookupTable<ColumnDefinition>?) -> [a]
const applySort = (sorting, items, columns = []) =>
    sorting?.length ? [...items].sort(sortBy(sorting, columns)) : items

export { compareValues, sortBy, applySort }
