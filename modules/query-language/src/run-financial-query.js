// ABOUTME: Executes an IRFinancialQuery IR against Redux state via 3-way .match() dispatch
// ABOUTME: Returns {nodes, source, columns?, computed?} for all query types; {snapshots} only for positions domain

import { filter, find, iterate, map, reduce, sort, sumCompensated, compactMap } from '@graffio/functional'
import { buildPositionsTree } from './financial-computations/build-positions-tree.js'
import { computePositions } from './financial-computations/compute-positions.js'
import { MetricRegistry } from './financial-computations/metric-registry.js'
import { CategoryAggregate, CategoryTreeNode, EnrichedAccount, PositionTreeNode, Transaction } from './types/index.js'
import { CategoryTree } from './category-tree.js'
import { buildFilterPredicate } from './build-filter-predicate.js'
import { IRFilter } from './types/ir-filter.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = { isInDateRange: (dateRange, date) => !dateRange || (date >= dateRange.start && date <= dateRange.end) }

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Format a Date object as an ISO date string
    // @sig toIsoDate :: Date -> String
    toIsoDate: date => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    },

    // Parse an ISO date string into a local Date object
    // @sig toLocalDate :: String -> Date
    toLocalDate: s => {
        const [y, m, d] = s.split('-').map(Number)
        return new Date(y, m - 1, d)
    },

    toLastDay: (year, month) => new Date(year, month, 0).getDate(),

    // Build start/end ISO strings for a given year and month
    // @sig toMonthRange :: (Number, Number) -> { start: String, end: String }
    toMonthRange: (year, month) => {
        const lastDay = T.toLastDay(year, month)
        const mm = String(month).padStart(2, '0')
        return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` }
    },

    // Compute a date range relative to today by unit and count
    // @sig toRelativeDateRange :: (String, Number) -> { start: String, end: String } | undefined
    toRelativeDateRange: (unit, count) => {
        const now = new Date()
        const end = T.toIsoDate(now)
        if (unit === 'months')
            return { start: T.toIsoDate(new Date(now.getFullYear(), now.getMonth() - count, now.getDate())), end }
        if (unit === 'days')
            return { start: T.toIsoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - count)), end }
        return undefined
    },

    // Resolve an IRDateRange descriptor to concrete start/end strings
    // @sig toDateRange :: IRDateRange? -> { start: String, end: String } | undefined
    toDateRange: descriptor => {
        if (!descriptor) return undefined
        return descriptor.match({
            Year: ({ year }) => ({ start: `${year}-01-01`, end: `${year}-12-31` }),
            Quarter: ({ quarter, year }) => {
                const firstMonth = (quarter - 1) * 3 + 1
                const start = `${year}-${String(firstMonth).padStart(2, '0')}-01`
                return { start, end: T.toMonthRange(year, firstMonth + 2).end }
            },
            Month: ({ month, year }) => T.toMonthRange(year, month),
            Relative: ({ unit, count }) => T.toRelativeDateRange(unit, count),
            Range: ({ start, end }) => ({ start, end }),
        })
    },

    toEscapedRegex: s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

    // Expand category Equals filters to prefix-matching Matches filters
    // @sig toResolvedFilter :: IRFilter -> IRFilter
    toResolvedFilter: node => {
        const { Equals, And, Or, Not, Matches } = IRFilter
        const { field, value, filters, filter: childFilter } = node
        if (Equals.is(node) && field === 'category') return Matches('category', `^${T.toEscapedRegex(value)}(:|$)`)
        if (And.is(node)) return And(map(T.toResolvedFilter, filters))
        if (Or.is(node)) return Or(map(T.toResolvedFilter, filters))
        if (Not.is(node)) return Not(T.toResolvedFilter(childFilter))
        return node
    },

    toFilterableTransaction: t => ({ ...t, category: t.categoryName, account: t.accountName }),

    toFilterablePosition: p => {
        const { accountName, securityName, securityType } = p
        return { ...p, account: accountName, payee: securityName, category: securityType }
    },

    toFilterableAccount: ea => ({ account: ea.account.name }),

    // Advance a Date by one interval step and return a new Date
    // @sig toAdvancedDate :: (Date, String) -> Date
    toAdvancedDate: (date, interval) => {
        const d = new Date(date.getTime())
        INTERVAL_ADVANCE[interval](d)
        return d
    },

    // Snap a start date to the first interval boundary (end of month for monthly)
    // @sig toInitialDatePoint :: (Date, String) -> Date
    toInitialDatePoint: (startDate, interval) => {
        if (interval !== 'monthly') return new Date(startDate.getTime())
        const d = new Date(startDate.getTime())
        d.setDate(1)
        d.setMonth(d.getMonth() + 1)
        d.setDate(0)
        return d
    },

    toNodeSortValue: (node, field) => {
        if (node.metrics && node.metrics[field] !== undefined) return node.metrics[field]
        if (node.position && node.position[field] !== undefined) return node.position[field]
        return 0
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Filter transactions by date range and optional IRFilter predicate
    // @sig collectFilteredTransactions :: (IRFilter?, IRDateRange?, State) -> [Object]
    collectFilteredTransactions: (queryFilter, dateDescriptor, state) => {
        const { accounts, categories, transactions } = state
        const dateRange = T.toDateRange(dateDescriptor)
        const dateFiltered = filter(t => P.isInDateRange(dateRange, t.date), Array.from(transactions))
        const enriched = Transaction.enrichAll(dateFiltered, categories, accounts)
        if (!queryFilter) return enriched
        return filter(buildFilterPredicate(T.toResolvedFilter(queryFilter)), map(T.toFilterableTransaction, enriched))
    },

    // Build a category tree from filtered transactions grouped by dimension
    // @sig collectTransactionTree :: (IRFilter?, IRDateRange?, IRGrouping?, State) -> [CategoryTreeNode]
    collectTransactionTree: (queryFilter, dateDescriptor, grouping, state) => {
        const filtered = A.collectFilteredTransactions(queryFilter, dateDescriptor, state)
        const groupBy = grouping ? grouping.rows : 'category'
        return CategoryTree.buildTransactionTree(groupBy, filtered)
    },

    // Evaluate all computed rows against cells for a single column
    // @sig collectComputedColumn :: (Object, [IRComputedRow], Object, String) -> Object
    collectComputedColumn: (acc, computed, grid, col) =>
        reduce(
            (colAcc, cr) => ({ ...colAcc, [cr.name]: A.evaluateIRPivotExpression(cr.expression, grid, col) }),
            acc,
            computed,
        ),

    // Reshape computed results from column-keyed to name-keyed for a single row
    // @sig collectComputedByName :: (Object, IRComputedRow, [String], Object) -> Object
    collectComputedByName: (acc, cr, columns, computedResults) => ({
        ...acc,
        [cr.name]: reduce((inner, col) => ({ ...inner, [col]: computedResults[col][cr.name] }), {}, columns),
    }),

    // Apply a binary arithmetic operator to two pivot expression results
    // @sig evaluateBinaryOp :: (String, Number, Number) -> Number
    evaluateBinaryOp: (op, l, r) => {
        if (op === '+') return l + r
        if (op === '-') return l - r
        if (op === '*') return l * r
        if (op === '/') return r === 0 ? NaN : l / r
        throw new Error(`Unknown operator: ${op}`)
    },

    // Look up a row's value for a column, returning NaN if missing
    // @sig evaluateRowRef :: (Object, String, String) -> Number
    evaluateRowRef: (cells, name, column) => {
        const row = cells[name]
        if (!row || row[column] === undefined) return NaN
        return row[column]
    },

    // Evaluate a Binary IRPivotExpression by recursing into left and right
    // @sig evaluateBinaryExpr :: (Object, Object, String) -> Number
    evaluateBinaryExpr: ({ op, left, right }, cells, column) =>
        A.evaluateBinaryOp(
            op,
            A.evaluateIRPivotExpression(left, cells, column),
            A.evaluateIRPivotExpression(right, cells, column),
        ),

    // Recursively evaluate a IRPivotExpression AST against a cells grid for one column
    // @sig evaluateIRPivotExpression :: (IRPivotExpression, Object, String) -> Number
    evaluateIRPivotExpression: (expr, cells, column) =>
        expr.match({
            RowRef: ({ name }) => A.evaluateRowRef(cells, name, column),
            Literal: ({ value }) => value,
            Binary: fields => A.evaluateBinaryExpr(fields, cells, column),
        }),

    // Compute positions and optionally group into a tree with metrics
    // @sig collectPositionsResult :: (IRFilter?, IRDateRange?, IRGrouping?, [String]?, State) -> [PositionTreeNode]
    collectPositionsResult: (queryFilter, dateDescriptor, grouping, metrics, state) => {
        const dateRange = T.toDateRange(dateDescriptor)
        const asOfDate = dateRange ? dateRange.end : T.toIsoDate(new Date())
        const allPositions = computePositions({ ...state, asOfDate, selectedAccountIds: [], filterQuery: undefined })
        const positions = queryFilter
            ? filter(
                  p => buildFilterPredicate(T.toResolvedFilter(queryFilter))(T.toFilterablePosition(p)),
                  allPositions,
              )
            : allPositions
        const groupBy = grouping ? grouping.rows : undefined
        if (groupBy) return buildPositionsTree(groupBy, positions)
        const nodes = map(
            position => PositionTreeNode.Position(`${position.accountId}|${position.securityId}`, [], position),
            positions,
        )
        if (!metrics) return nodes
        const benchmarkSecurityId = A.findBenchmarkSecurityId(state)
        const context = { ...state, asOfDate, benchmarkSecurityId }
        return map(node => A.collectPositionMetrics(node, metrics, context), nodes)
    },

    // Look up and compute a single named metric for a position
    // @sig collectSingleMetric :: (Object, Object, Object, String) -> Object
    collectSingleMetric: (acc, position, context, name) => {
        const definition = MetricRegistry.table.get(name)
        if (!definition) throw new Error(`Unknown metric '${name}'`)
        return { ...acc, [name]: MetricRegistry.resolveMetricFn(definition.compute)(position, context) }
    },

    // Attach computed metrics to a position tree node
    // @sig collectPositionMetrics :: (PositionTreeNode, [String], Object) -> PositionTreeNode
    collectPositionMetrics: (node, metricNames, context) => {
        const { id, children, position } = node
        const metrics = reduce((acc, name) => A.collectSingleMetric(acc, position, context, name), {}, metricNames)
        return PositionTreeNode.Position(id, children, position, metrics)
    },

    findBenchmarkSecurityId: ({ securities }) => {
        const spy = find(s => s.ticker === 'SPY', Array.from(securities))
        return spy ? spy.id : undefined
    },

    // Sort position tree nodes by a metric or position field
    // @sig collectSortedNodes :: ([PositionTreeNode], String, String) -> [PositionTreeNode]
    collectSortedNodes: (nodes, field, direction) => {
        const comparator =
            direction === 'asc'
                ? (a, b) => T.toNodeSortValue(a, field) - T.toNodeSortValue(b, field)
                : (a, b) => T.toNodeSortValue(b, field) - T.toNodeSortValue(a, field)
        return [...nodes].sort(comparator)
    },

    collectNextDatePoint: (acc, endDate, interval) => {
        const next = T.toAdvancedDate(acc.current, interval)
        return next <= endDate ? { current: next, points: [...acc.points, T.toIsoDate(next)] } : acc
    },

    // Generate a list of ISO date strings at interval steps within a range
    // @sig collectDatePoints :: (String, String, String) -> [String]
    collectDatePoints: (start, end, interval) => {
        const startDate = T.toLocalDate(start)
        const endDate = T.toLocalDate(end)
        const initial = T.toInitialDatePoint(startDate, interval)
        const seed = { current: initial, points: initial <= endDate ? [T.toIsoDate(initial)] : [] }
        return iterate(SAFETY_LIMIT, acc => A.collectNextDatePoint(acc, endDate, interval), seed).points
    },

    // Sum non-investment cash balances + investment position market values at a date
    // @sig collectBalanceSnapshot :: (String, [Object], Set, [String], State) -> { date: String, total: Number }
    collectBalanceSnapshot: (date, filtered, investmentAccountIds, investmentAccountIdsInScope, state) => {
        const isCashTransaction = ({ date: d, accountId }) => d <= date && !investmentAccountIds.has(accountId)
        const cashTotal = sumCompensated(compactMap(t => (isCashTransaction(t) ? t.amount : undefined), filtered))
        const positions = computePositions({
            ...state,
            asOfDate: date,
            selectedAccountIds: investmentAccountIdsInScope,
            filterQuery: undefined,
        })
        const investmentTotal = sumCompensated(map(p => p.marketValue, positions))
        return { date, total: cashTotal + investmentTotal }
    },

    collectPositionSnapshot: (state, date) => ({
        date,
        positions: computePositions({ ...state, asOfDate: date, selectedAccountIds: [], filterQuery: undefined }),
    }),

    // Collect sorted unique column keys from all top-level tree node aggregates
    // @sig collectColumnKeysFromTree :: [CategoryTreeNode] -> [String]
    collectColumnKeysFromTree: nodes => {
        const keySet = new Set()
        nodes.forEach(n => n.aggregate.columns && Object.keys(n.aggregate.columns).forEach(k => keySet.add(k)))
        return sort((a, b) => (a < b ? -1 : a > b ? 1 : 0), Array.from(keySet))
    },

    // Build a flat cells lookup from top-level tree nodes for IRComputedRow evaluation
    // @sig collectCellsFromTree :: [CategoryTreeNode] -> Object
    collectCellsFromTree: nodes =>
        reduce((acc, node) => ({ ...acc, [node.id]: node.aggregate.columns || {} }), {}, nodes),

    // Evaluate all IRComputedRow expressions against a cells grid, returning {name: {col: value}}
    // @sig collectComputedFromCells :: ([IRComputedRow], Object, [String]) -> Object
    collectComputedFromCells: (computed, cells, columns) => {
        const perColumn = reduce(
            (acc, col) => ({ ...acc, [col]: A.collectComputedColumn({}, computed, cells, col) }),
            {},
            columns,
        )
        return reduce((acc, cr) => A.collectComputedByName(acc, cr, columns, perColumn), {}, computed)
    },

    // Execute a TransactionQuery — 2D tree or flat tree depending on grouping.columns
    // @sig collectTransactionQueryResult :: (Object, State) -> { nodes, source, ... }
    collectTransactionQueryResult: ({ filter: queryFilter, dateRange, grouping, computed }, state) => {
        const { columns: colDim, rows: rowDim } = grouping
        if (!colDim) {
            const nodes = A.collectTransactionTree(queryFilter, dateRange, grouping, state)
            return { nodes, source: rowDim }
        }
        const filtered = A.collectFilteredTransactions(queryFilter, dateRange, state)
        const nodes = CategoryTree.buildColumnGroupedTree(rowDim, colDim, filtered)
        const columnKeys = A.collectColumnKeysFromTree(nodes)
        if (!computed) return { nodes, source: rowDim, columns: columnKeys }
        const cells = A.collectCellsFromTree(nodes)
        const computedByName = A.collectComputedFromCells(computed, cells, columnKeys)
        return { nodes, source: rowDim, columns: columnKeys, computed: computedByName }
    },

    // Execute an AccountQuery — enriched account list with computed balances
    // Returns [EnrichedAccount] (not { nodes } — accounts are a flat list, not tree nodes)
    // @sig collectAccountQueryResult :: (Object, State) -> [EnrichedAccount]
    collectAccountQueryResult: ({ filter: queryFilter, dateRange: dateDescriptor }, state) => {
        const { accounts, transactions } = state
        const dateRange = T.toDateRange(dateDescriptor)
        const asOfDate = dateRange ? dateRange.end : T.toIsoDate(new Date())
        const positions = computePositions({ ...state, asOfDate, selectedAccountIds: [], filterQuery: undefined })
        const enriched = EnrichedAccount.enrichAll(Array.from(accounts), positions, Array.from(transactions))
        if (!queryFilter) return enriched
        return filter(ea => buildFilterPredicate(queryFilter)(T.toFilterableAccount(ea)), enriched)
    },

    // Execute a PositionQuery — optionally sort and limit the results
    // @sig collectPositionQueryResult :: (Object, State) -> { nodes, source }
    collectPositionQueryResult: (
        { filter: queryFilter, dateRange, grouping, metrics, orderByField, orderByDirection, limit },
        state,
    ) => {
        const nodes = A.collectPositionsResult(queryFilter, dateRange, grouping, metrics, state)
        if (!orderByField) return { nodes, source: grouping ? grouping.rows : 'account' }
        const sorted = A.collectSortedNodes(nodes, orderByField, orderByDirection || 'asc')
        const limited = limit !== undefined ? sorted.slice(0, limit) : sorted
        return { nodes: limited, source: grouping ? grouping.rows : 'account' }
    },

    // Build a Set of account IDs for investment/retirement accounts
    // @sig collectInvestmentAccountIds :: LookupTable -> Set
    collectInvestmentAccountIds: accounts =>
        new Set(
            filter(a => EnrichedAccount.POSITION_BALANCE_TYPES.includes(a.type), Array.from(accounts)).map(a => a.id),
        ),

    // Accumulate balance snapshot totals per date point into a columns object
    // @sig collectBalanceColumns :: ([String], [Object], Set, [String], State) -> Object
    collectBalanceColumns: (datePoints, filtered, investmentAccountIds, investmentAccountIdsInScope, state) => {
        const totalAt = date =>
            A.collectBalanceSnapshot(date, filtered, investmentAccountIds, investmentAccountIdsInScope, state).total
        return reduce((cols, date) => ({ ...cols, [date]: totalAt(date) }), {}, datePoints)
    },

    // Build cumulative balance columns per date point as a single summary node
    // @sig collectUngroupedBalanceTree :: ([String], [Object], Set, [String], State) -> [CategoryTreeNode]
    collectUngroupedBalanceTree: (datePoints, filtered, investmentAccountIds, investmentAccountIdsInScope, state) => {
        const columns = A.collectBalanceColumns(
            datePoints,
            filtered,
            investmentAccountIds,
            investmentAccountIdsInScope,
            state,
        )
        const total = columns[datePoints[datePoints.length - 1]] ?? 0
        return [CategoryTreeNode.Group('Net worth', [], CategoryAggregate(total, datePoints.length, columns))]
    },

    // Build per-category cumulative balance tree with date-point columns (hierarchical)
    // @sig collectGroupedBalanceTree :: ([String], [Object], Set, IRGrouping) -> [CategoryTreeNode]
    collectGroupedBalanceTree: (datePoints, filtered, investmentAccountIds, grouping) => {
        const cashTransactions = filter(t => !investmentAccountIds.has(t.accountId), filtered)
        return CategoryTree.buildSnapshotTree(grouping.rows, datePoints, cashTransactions)
    },

    // Generate tree output at interval points within a date range
    // @sig collectSnapshotQueryResult :: (Object, State) -> { nodes, source, columns }
    collectSnapshotQueryResult: ({ domain, filter: queryFilter, grouping, dateRange, interval }, state) => {
        const resolved = T.toDateRange(dateRange)
        if (!resolved) throw new Error('SnapshotQuery requires a date range')
        const { start, end } = resolved
        const datePoints = A.collectDatePoints(start, end, interval)
        if (domain !== 'balances') {
            const snapshots = map(date => A.collectPositionSnapshot(state, date), datePoints)
            return { snapshots, source: 'positions' }
        }
        const { accounts } = state
        const filtered = A.collectFilteredTransactions(queryFilter, undefined, state)
        const investmentAccountIds = A.collectInvestmentAccountIds(accounts)
        if (grouping) {
            const nodes = A.collectGroupedBalanceTree(datePoints, filtered, investmentAccountIds, grouping)
            return { nodes, source: grouping.rows, columns: datePoints }
        }
        const filteredAccountIds = new Set(filtered.map(t => t.accountId))
        const investmentAccountIdsInScope = filter(id => filteredAccountIds.has(id), Array.from(investmentAccountIds))
        const nodes = A.collectUngroupedBalanceTree(
            datePoints,
            filtered,
            investmentAccountIds,
            investmentAccountIdsInScope,
            state,
        )
        return { nodes, source: 'balances', columns: datePoints }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const INTERVAL_ADVANCE = {
    daily:     d => d.setDate(d.getDate() + 1),
    weekly:    d => d.setDate(d.getDate() + 7),
    monthly:   d => { d.setDate(1); d.setMonth(d.getMonth() + 2); d.setDate(0) },
    quarterly: d => { d.setDate(1); d.setMonth(d.getMonth() + 4); d.setDate(0) },
    yearly:    d => { d.setFullYear(d.getFullYear() + 1); d.setMonth(11); d.setDate(31) },
}

const SAFETY_LIMIT = 500

const MAX_DEPTH = 10

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Dispatch an IRFinancialQuery to the appropriate execution path via .match()
// @sig runFinancialQuery :: (IRFinancialQuery, State, Number?) -> Object
const runFinancialQuery = (query, state, depth = 0) => {
    if (depth > MAX_DEPTH) throw new Error(`IRFinancialQuery depth exceeded maximum of ${MAX_DEPTH}`)

    return query.match({
        TransactionQuery: fields => A.collectTransactionQueryResult(fields, state),
        PositionQuery: fields => A.collectPositionQueryResult(fields, state),
        SnapshotQuery: fields => A.collectSnapshotQueryResult(fields, state),
        AccountQuery: fields => A.collectAccountQueryResult(fields, state),
    })
}

export { runFinancialQuery }
