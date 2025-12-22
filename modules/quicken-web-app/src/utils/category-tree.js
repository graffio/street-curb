// ABOUTME: Transaction tree building utility for spending reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree for hierarchical display by dimension

import { groupBy as groupByFn, buildTree, aggregateTree } from '@graffio/functional'

// Derive parent from colon-delimited category path
// @sig getCategoryParent :: String -> String?
const getCategoryParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}

// Derive parent year from YYYY-MM month key
// @sig getMonthParent :: String -> String?
const getMonthParent = key => {
    const idx = key.indexOf('-')
    return idx === -1 ? null : key.slice(0, idx)
}

// Extract YYYY-MM from transaction date
// @sig getMonthKey :: Transaction -> String
const getMonthKey = txn => {
    if (!txn.date) return 'Unknown'
    const d = new Date(txn.date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
}

// Configuration for each groupBy dimension
const dimensionConfig = {
    category: { getKey: txn => txn.categoryName || 'Uncategorized', getParent: getCategoryParent },
    account: { getKey: txn => txn.accountName || 'Unknown Account', getParent: () => null },
    payee: { getKey: txn => txn.payee || 'No Payee', getParent: () => null },
    month: { getKey: getMonthKey, getParent: getMonthParent },
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

// Build aggregated transaction tree by dimension
// @sig buildTransactionTree :: (String?, [Transaction], ((a, [b]) -> b)?) -> [TreeNode]
const buildTransactionTree = (dimension, transactions, aggregateFn = sumTransactions) => {
    const config = dimensionConfig[dimension] || dimensionConfig.category
    const groups = groupByFn(config.getKey, transactions)
    const tree = buildTree(config.getParent, groups)
    return aggregateTree(aggregateFn, tree)
}

// Legacy alias for backward compatibility
// @sig buildCategoryTree :: ([Transaction], ((a, [b]) -> b)?) -> [TreeNode]
const buildCategoryTree = (transactions, aggregateFn = sumTransactions) =>
    buildTransactionTree('category', transactions, aggregateFn)

export { buildCategoryTree, buildTransactionTree, getCategoryParent, sumTransactions }
