// ABOUTME: Transaction tree building utility for spending reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree -> toGroupNode for hierarchical display by dimension

import {
    groupBy as groupByFn,
    buildTree,
    aggregateTree,
    map,
    compactMap,
    pushToKey,
    sumCompensated,
} from '@graffio/functional'
import { CategoryAggregate } from './types/category-aggregate.js'
import { CategoryTreeNode } from './types/category-tree-node.js'

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

    // Extract YYYY from transaction date
    // @sig toYearKey :: Transaction -> String
    toYearKey: txn => {
        if (!txn.date) return 'Unknown'
        return String(new Date(txn.date).getFullYear())
    },

    // Extract YYYY-QN from transaction date
    // @sig toQuarterKey :: Transaction -> String
    toQuarterKey: txn => {
        if (!txn.date) return 'Unknown'
        const d = new Date(txn.date)
        const q = Math.ceil((d.getMonth() + 1) / 3)
        return `${d.getFullYear()}-Q${q}`
    },

    // Transforms a plain aggregate object into CategoryAggregate instance
    // @sig toCategoryAggregate :: Object -> CategoryAggregate
    toCategoryAggregate: ({ total, count, columns }) => CategoryAggregate(total, count, columns),

    // Transforms a transaction into CategoryTreeNode.Transaction (leaf node)
    // @sig toTransactionNode :: Transaction -> CategoryTreeNode.Transaction
    toTransactionNode: txn => CategoryTreeNode.Transaction(String(txn.id), [], txn),

    // Wraps direct transactions in a synthetic <Others> group under a parent that also has child groups
    // @sig toOthersGroup :: (String, [Transaction]) -> CategoryTreeNode.Group
    toOthersGroup: (parentKey, transactions) => {
        const nodes = transactions.map(T.toTransactionNode)
        const total = sumCompensated(map(t => t.amount, transactions))
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
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Merge child column values into a mutable columns accumulator
    // @sig mergeChildColumns :: (Object, Object) -> undefined
    mergeChildColumns: (columns, childColumns) =>
        Object.entries(childColumns).forEach(([col, val]) => (columns[col] = (columns[col] ?? 0) + val)),

    // Produces an aggregation function that computes cumulative balances at each date point
    // @sig makeSnapshotAggregator :: [String] -> (([Transaction], [Aggregate]) -> Aggregate)
    makeSnapshotAggregator: datePoints => (transactions, childAggregates) => {
        const cumulativeAt = date =>
            sumCompensated(compactMap(t => (t.date <= date ? (t.amount ?? 0) : undefined), transactions))
        const columns = {}
        datePoints.forEach(date => (columns[date] = cumulativeAt(date)))
        childAggregates.forEach(a => a.columns && F.mergeChildColumns(columns, a.columns))
        const total = columns[datePoints[datePoints.length - 1]] ?? 0
        const count = transactions.length + childAggregates.reduce((sum, a) => sum + a.count, 0)
        return { total, count, columns }
    },

    // Produces an aggregation function that tracks per-column totals alongside the standard total/count
    // @sig makeColumnAggregator :: (Transaction -> String) -> (([Transaction], [Aggregate]) -> Aggregate)
    makeColumnAggregator: getColumnKey => (transactions, childAggregates) => {
        const ownTotal = sumCompensated(map(t => t.amount ?? 0, transactions))
        const childTotal = sumCompensated(map(a => a.total, childAggregates))
        const ownCount = transactions.length
        const childCount = childAggregates.reduce((sum, a) => sum + a.count, 0)
        const columnBuckets = transactions.reduce((acc, t) => pushToKey(acc, getColumnKey(t), t.amount ?? 0), {})
        const columns = Object.fromEntries(
            Object.entries(columnBuckets).map(([col, vals]) => [col, sumCompensated(vals)]),
        )
        childAggregates.forEach(a => a.columns && F.mergeChildColumns(columns, a.columns))
        return { total: ownTotal + childTotal, count: ownCount + childCount, columns }
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

// Column key extractors — map column dimension name to transaction → column-key function
const columnKeyExtractors = { year: T.toYearKey, quarter: T.toQuarterKey, month: T.toMonthKey }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Default aggregation: sum amounts and count transactions (amount ?? 0 guards undefined for splits/transfers)
// @sig collectTransactionTotals :: ([Transaction], [Aggregate]) -> Aggregate
const collectTransactionTotals = (transactions, childAggregates) => {
    const ownTotal = sumCompensated(map(t => t.amount ?? 0, transactions))
    const childTotal = sumCompensated(map(a => a.total, childAggregates))
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

// Build 2D tree: rows grouped by rowDim, each node has per-column totals from colDim
// @sig buildColumnGroupedTree :: (String, String, [Transaction]) -> [CategoryTreeNode]
const buildColumnGroupedTree = (rowDim, colDim, transactions) => {
    const getColumnKey = columnKeyExtractors[colDim]
    if (!getColumnKey) throw new Error(`Unknown column dimension: ${colDim}`)
    const aggregateFn = F.makeColumnAggregator(getColumnKey)
    return buildTransactionTree(rowDim, transactions, aggregateFn)
}

// Build snapshot tree: rows grouped by dimension, each node has cumulative date-point columns
// @sig buildSnapshotTree :: (String, [String], [Transaction]) -> [CategoryTreeNode]
const buildSnapshotTree = (dimension, datePoints, transactions) => {
    const aggregateFn = F.makeSnapshotAggregator(datePoints)
    return buildTransactionTree(dimension, transactions, aggregateFn)
}

const CategoryTree = { buildTransactionTree, buildColumnGroupedTree, buildSnapshotTree, collectTransactionTotals }

export { CategoryTree }
