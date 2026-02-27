// ABOUTME: Transaction tree building utility for spending reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree -> toGroupNode for hierarchical display by dimension

import { groupBy as groupByFn, buildTree, aggregateTree } from '@graffio/functional'
import { CategoryAggregate } from '../types/category-aggregate.js'
import { CategoryTreeNode } from '../types/category-tree-node.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Derive parent from colon-delimited category path
    // @sig parseCategoryParent :: String -> String?
    parseCategoryParent: key => {
        const idx = key.lastIndexOf(':')
        return idx === -1 ? undefined : key.slice(0, idx)
    },

    // Derive parent year from YYYY-MM month key
    // @sig parseMonthParent :: String -> String?
    parseMonthParent: key => {
        const idx = key.indexOf('-')
        return idx === -1 ? undefined : key.slice(0, idx)
    },

    // Extract YYYY-MM from transaction date
    // @sig toMonthKey :: Transaction -> String
    toMonthKey: txn => {
        if (!txn.date) return 'Unknown'
        const d = new Date(txn.date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        return `${year}-${month}`
    },

    // Transforms a plain aggregate object into CategoryAggregate instance
    // @sig toCategoryAggregate :: Object -> CategoryAggregate
    toCategoryAggregate: agg => CategoryAggregate(agg.total, agg.count),

    // Transforms a transaction into CategoryTreeNode.Transaction (leaf node)
    // @sig toTransactionNode :: Transaction -> CategoryTreeNode.Transaction
    toTransactionNode: txn => CategoryTreeNode.Transaction(String(txn.id), [], txn),

    // Wraps direct transactions in a synthetic <Others> group under a parent that also has child groups
    // @sig toOthersGroup :: (String, [Transaction]) -> CategoryTreeNode.Group
    toOthersGroup: (parentKey, transactions) => {
        const nodes = transactions.map(T.toTransactionNode)
        const total = transactions.reduce((sum, t) => sum + t.amount, 0)
        return CategoryTreeNode.Group(`${parentKey}:<Others>`, nodes, CategoryAggregate(total, transactions.length))
    },

    // Transforms an aggregated tree node into CategoryTreeNode.Group
    // @sig toGroupNode :: TreeNode -> CategoryTreeNode.Group
    toGroupNode: node => {
        const { key, value, children, aggregate } = node
        const groupNodes = children.map(T.toGroupNode)
        const hasGroups = groupNodes.length > 0
        const hasDirectTxns = value.length > 0
        const txnChildren = hasGroups && hasDirectTxns ? [T.toOthersGroup(key, value)] : value.map(T.toTransactionNode)
        return CategoryTreeNode.Group(key, [...groupNodes, ...txnChildren], T.toCategoryAggregate(aggregate))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// Configuration for each groupBy dimension
const dimensionConfig = {
    category: { getKey: txn => txn.categoryName || 'Uncategorized', getParent: T.parseCategoryParent },
    account: { getKey: txn => txn.accountName || 'Unknown Account', getParent: () => undefined },
    payee: { getKey: txn => txn.payee || 'No Payee', getParent: () => undefined },
    month: { getKey: T.toMonthKey, getParent: T.parseMonthParent },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Default aggregation: sum amounts and count transactions (amount ?? 0 guards undefined for splits/transfers)
// @sig collectTransactionTotals :: ([Transaction], [Aggregate]) -> Aggregate
const collectTransactionTotals = (transactions, childAggregates) => {
    const ownTotal = transactions.reduce((sum, t) => sum + (t.amount ?? 0), 0)
    const childTotal = childAggregates.reduce((sum, a) => sum + a.total, 0)
    const ownCount = transactions.length
    const childCount = childAggregates.reduce((sum, a) => sum + a.count, 0)
    return { total: ownTotal + childTotal, count: ownCount + childCount }
}

// Build aggregated transaction tree by dimension, returning CategoryTreeNode instances
// @sig buildTransactionTree :: (String?, [Transaction], ((a, [b]) -> b)?) -> [CategoryTreeNode]
const buildTransactionTree = (dimension, transactions, aggregateFn = collectTransactionTotals) => {
    const config = dimensionConfig[dimension] || dimensionConfig.category
    const groups = groupByFn(config.getKey, transactions)
    const tree = buildTree(config.getParent, groups)
    const aggregated = aggregateTree(aggregateFn, tree)
    return aggregated.map(T.toGroupNode)
}

const CategoryTree = { buildTransactionTree, collectTransactionTotals }

export { CategoryTree }
