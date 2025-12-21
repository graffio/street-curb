// ABOUTME: Category tree building utility for spending reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree for hierarchical category display

import { groupBy, buildTree, aggregateTree } from '@graffio/functional'

// Derive parent from colon-delimited category path
// @sig getParent :: String -> String?
const getParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}

// Default aggregation: sum amounts and count transactions
// @sig sumTransactions :: ([Transaction], [Aggregate]) -> Aggregate
const sumTransactions = (transactions, childAggregates) => {
    const ownTotal = transactions.reduce((sum, t) => sum + t.amount, 0)
    const childTotal = childAggregates.reduce((sum, a) => sum + a.total, 0)
    const ownCount = transactions.length
    const childCount = childAggregates.reduce((sum, a) => sum + a.count, 0)
    return { total: ownTotal + childTotal, count: ownCount + childCount }
}

// Build aggregated category tree from transactions
// @sig buildCategoryTree :: ([Transaction], ((a, [b]) -> b)?) -> [TreeNode]
const buildCategoryTree = (transactions, aggregateFn = sumTransactions) => {
    const groups = groupBy(txn => txn.categoryName || 'Uncategorized', transactions)
    const tree = buildTree(getParent, groups)
    return aggregateTree(aggregateFn, tree)
}

export { buildCategoryTree, getParent, sumTransactions }
