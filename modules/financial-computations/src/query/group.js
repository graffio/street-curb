// ABOUTME: Group transactions by field or function
// ABOUTME: Returns object with group keys mapping to arrays

// Group items by field value or key function
// @sig groupBy :: (String | Function, [a]) -> { [key]: [a] }
const groupBy = (keyFn, items) => {
    // Accumulates item into the appropriate group
    // @sig addToGroup :: ({ [key]: [a] }, a) -> { [key]: [a] }
    const addToGroup = (result, item) => {
        const key = getKey(item) ?? 'undefined'
        if (!result[key]) result[key] = []
        result[key].push(item)
        return result
    }

    const getKey = typeof keyFn === 'string' ? item => item[keyFn] : keyFn

    return items.reduce(addToGroup, {})
}

// Expand category path into all ancestor paths
// "food:restaurant:lunch" → ["food", "food:restaurant", "food:restaurant:lunch"]
// @sig expandCategoryHierarchy :: String -> [String]
const expandCategoryHierarchy = categoryName => {
    if (!categoryName) return []
    const parts = categoryName.split(':')
    return parts.map((_, i) => parts.slice(0, i + 1).join(':'))
}

// Group by category with hierarchy expansion
// Transaction in "food:restaurant" appears in groups for both "food" and "food:restaurant"
// @sig groupByCategoryHierarchy :: [Transaction] -> { [categoryPath]: [Transaction] }
const groupByCategoryHierarchy = transactions => {
    // Adds transaction to a single path group
    // @sig addToPath :: ({ [path]: [Transaction] }, String, Transaction) -> void
    const addToPath = (result, path, txn) => {
        if (!result[path]) result[path] = []
        result[path].push(txn)
    }

    // Accumulates transaction into all ancestor category groups
    // @sig addToHierarchyGroups :: ({ [path]: [Transaction] }, Transaction) -> { [path]: [Transaction] }
    const addToHierarchyGroups = (result, txn) => {
        const paths = expandCategoryHierarchy(txn.categoryName || 'Uncategorized')
        paths.forEach(path => addToPath(result, path, txn))
        return result
    }

    return transactions.reduce(addToHierarchyGroups, {})
}

export { groupBy, expandCategoryHierarchy, groupByCategoryHierarchy }
