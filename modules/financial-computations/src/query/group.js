// ABOUTME: Group transactions by field or function
// ABOUTME: Returns object with group keys mapping to arrays

import { groupBy as functionalGroupBy, groupByMulti } from '@graffio/functional'

// Group items by field value or key function (extends functional's groupBy with string accessor support)
// @sig groupBy :: (String | Function, [a]) -> { [key]: [a] }
const groupBy = (keyFn, items) => {
    const getKey = typeof keyFn === 'string' ? item => item[keyFn] ?? 'undefined' : item => keyFn(item) ?? 'undefined'
    return functionalGroupBy(getKey, items)
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
    const getCategoryPaths = txn => expandCategoryHierarchy(txn.categoryName || 'Uncategorized')
    return groupByMulti(getCategoryPaths, transactions)
}

export { groupBy, expandCategoryHierarchy, groupByCategoryHierarchy }
