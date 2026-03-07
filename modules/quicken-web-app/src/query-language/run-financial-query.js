// ABOUTME: Executes a FinancialQuery IR against Redux state via 6-way .match() dispatch
// ABOUTME: Replaces runQuery — each variant carries only domain-relevant fields

import { filter, find, iterate, map, reduce, sort } from '@graffio/functional'
import { buildPositionsTree } from '../financial-computations/build-positions-tree.js'
import { computePositions } from '../financial-computations/compute-positions.js'
import { MetricRegistry } from '../financial-computations/metric-registry.js'
import { EnrichedAccount, PositionTreeNode, QueryResult, QueryResultTree, Transaction } from '../types/index.js'
import { CategoryTree } from '../utils/category-tree.js'
import { buildFilterPredicate } from './build-filter-predicate.js'
import { resolveExpression } from './resolve-expression.js'
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

    toFilterableAccount: a => ({ ...a, accountType: a.type }),

    toFilterablePosition: p => {
        const { accountName, securityName, securityType } = p
        return { ...p, account: accountName, payee: securityName, category: securityType }
    },

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

    // Map a transaction to its bucket label for a given dimension
    // @sig toColumnBucket :: (Object, String) -> String
    toColumnBucket: (txn, dimension) => {
        const { date, categoryName, accountName, securityName, payee } = txn
        const [y, m] = date.split('-').map(Number)
        if (dimension === 'month') return `${y}-${String(m).padStart(2, '0')}`
        if (dimension === 'quarter') return `${y}-Q${Math.ceil(m / 3)}`
        if (dimension === 'year') return String(y)
        if (dimension === 'category') return (categoryName || 'Uncategorized').split(':')[0]
        if (dimension === 'account') return accountName || 'Unknown'
        if (dimension === 'security') return securityName || 'Unknown'
        if (dimension === 'payee') return payee || 'Unknown Payee'
        return 'Unknown'
    },

    // Build a running balance entry from a transaction and prior balance
    // @sig toRunningBalanceEntry :: (Object, Number) -> { entry: Object, balance: Number }
    toRunningBalanceEntry: (t, balance) => {
        const { id, date, amount, payee } = t
        const newBalance = balance + amount
        return { entry: { id, date, amount, payee, balance: newBalance }, balance: newBalance }
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

    // Accumulate a transaction into the pivot cells grid, column set, and row set
    // @sig collectPivotCell :: (Object, Object, String, String) -> undefined
    collectPivotCell: (txn, cells, rowDim, colDim) => {
        const row = T.toColumnBucket(txn, rowDim)
        const col = T.toColumnBucket(txn, colDim)
        cells.columnSet.add(col)
        cells.rowSet.add(row)
        if (!cells.grid[row]) cells.grid[row] = {}
        cells.grid[row][col] = (cells.grid[row][col] || 0) + txn.amount
    },

    // Evaluate all computed rows against cells for a single column
    // @sig collectComputedColumn :: (Object, [ComputedRow], Object, String) -> Object
    collectComputedColumn: (acc, computed, grid, col) =>
        reduce(
            (colAcc, cr) => ({ ...colAcc, [cr.name]: A.evaluatePivotExpression(cr.expression, grid, col) }),
            acc,
            computed,
        ),

    // Reshape computed results from column-keyed to name-keyed for a single row
    // @sig collectComputedByName :: (Object, ComputedRow, [String], Object) -> Object
    collectComputedByName: (acc, cr, columns, computedResults) => ({
        ...acc,
        [cr.name]: reduce((inner, col) => ({ ...inner, [col]: computedResults[col][cr.name] }), {}, columns),
    }),

    // Sum a single row's values across all columns for row totals
    // @sig collectRowTotal :: (Object, String, Object, [String]) -> Object
    collectRowTotal: (acc, row, grid, columns) => {
        const rowCells = grid[row] || {}
        return { ...acc, [row]: reduce((sum, col) => sum + (rowCells[col] || 0), 0, columns) }
    },

    // Build a pivot result with rows x columns grid, row totals, and computed rows
    // @sig collectPivotResult :: (IRFilter?, IRDateRange?, IRGrouping, [ComputedRow]?, State) -> QueryResult
    collectPivotResult: (queryFilter, dateDescriptor, grouping, computed, state) => {
        const filtered = A.collectFilteredTransactions(queryFilter, dateDescriptor, state)
        const { rows: rowDim, columns: colDim, only } = grouping

        const cells = { grid: {}, columnSet: new Set(), rowSet: new Set() }
        filtered.forEach(txn => A.collectPivotCell(txn, cells, rowDim, colDim))
        const { grid, columnSet, rowSet } = cells

        const columns = sort((a, b) => (a < b ? -1 : a > b ? 1 : 0), Array.from(columnSet))
        let rows = sort((a, b) => (a < b ? -1 : a > b ? 1 : 0), Array.from(rowSet))
        if (only) rows = filter(r => only.includes(r), rows)

        const rowTotals = reduce((acc, row) => A.collectRowTotal(acc, row, grid, columns), {}, rows)

        const computedResults = computed
            ? reduce((acc, col) => ({ ...acc, [col]: A.collectComputedColumn({}, computed, grid, col) }), {}, columns)
            : {}

        const computedByName = computed
            ? reduce((acc, cr) => A.collectComputedByName(acc, cr, columns, computedResults), {}, computed)
            : {}

        return QueryResult.Pivot(columns, rows, grid, computedByName, rowTotals)
    },

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

    // Evaluate a Binary PivotExpression by recursing into left and right
    // @sig evaluateBinaryExpr :: (Object, Object, String) -> Number
    evaluateBinaryExpr: ({ op, left, right }, cells, column) =>
        A.evaluateBinaryOp(
            op,
            A.evaluatePivotExpression(left, cells, column),
            A.evaluatePivotExpression(right, cells, column),
        ),

    // Recursively evaluate a PivotExpression AST against a cells grid for one column
    // @sig evaluatePivotExpression :: (PivotExpression, Object, String) -> Number
    evaluatePivotExpression: (expr, cells, column) =>
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
        const definition = MetricRegistry.get(name)
        if (!definition) throw new Error(`Unknown metric '${name}'`)
        return { ...acc, [name]: definition.compute(position, context) }
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
        const cashTotal = reduce((sum, t) => (isCashTransaction(t) ? sum + t.amount : sum), 0, filtered)
        const positions = computePositions({
            ...state,
            asOfDate: date,
            selectedAccountIds: investmentAccountIdsInScope,
            filterQuery: undefined,
        })
        const investmentTotal = reduce((sum, p) => sum + p.marketValue, 0, positions)
        return { date, total: cashTotal + investmentTotal }
    },

    collectPositionSnapshot: (state, date) => ({
        date,
        positions: computePositions({ ...state, asOfDate: date, selectedAccountIds: [], filterQuery: undefined }),
    }),

    // Fold transactions into running balance entries with cumulative totals
    // @sig collectRunningBalanceEntries :: [Object] -> [Object]
    collectRunningBalanceEntries: filtered =>
        reduce(
            (acc, t) => {
                const { entry, balance } = T.toRunningBalanceEntry(t, acc.balance)
                return { balance, entries: [...acc.entries, entry] }
            },
            { balance: 0, entries: [] },
            filtered,
        ).entries,

    // Extract total from a QueryResult for use in ExpressionQuery binding
    // @sig collectResultTotal :: QueryResult -> Number
    collectResultTotal: result =>
        result.match({
            Identity: ({ tree }) =>
                tree.match({
                    Category: ({ nodes }) => reduce((sum, n) => sum + n.aggregate.total, 0, nodes),
                    Positions: ({ nodes }) => reduce((sum, n) => sum + n.aggregate.marketValue, 0, nodes),
                }),
            Scalar: ({ value }) => value,
            Pivot: ({ rowTotals }) => reduce((sum, [, v]) => sum + v, 0, Object.entries(rowTotals)),
            FilteredEntities: () => 0,
            TimeSeries: () => 0,
            RunningBalance: () => 0,
        }),

    // Execute a TransactionQuery — pivot or category tree depending on grouping
    // @sig collectTransactionQueryResult :: (Object, State) -> QueryResult
    collectTransactionQueryResult: ({ filter: queryFilter, dateRange, grouping, computed }, state) => {
        if (grouping && grouping.columns) return A.collectPivotResult(queryFilter, dateRange, grouping, computed, state)
        const nodes = A.collectTransactionTree(queryFilter, dateRange, grouping, state)
        return QueryResult.Identity(QueryResultTree.Category(nodes), grouping ? grouping.rows : 'category')
    },

    // Execute a PositionQuery — optionally sort and limit the results
    // @sig collectPositionQueryResult :: (Object, State) -> QueryResult
    collectPositionQueryResult: (
        { filter: queryFilter, dateRange, grouping, metrics, orderByField, orderByDirection, limit },
        state,
    ) => {
        const nodes = A.collectPositionsResult(queryFilter, dateRange, grouping, metrics, state)
        const tree = QueryResultTree.Positions(nodes)
        if (!orderByField) return QueryResult.Identity(tree, grouping ? grouping.rows : 'account')
        const sorted = A.collectSortedNodes(nodes, orderByField, orderByDirection || 'asc')
        const limited = limit !== undefined ? sorted.slice(0, limit) : sorted
        return QueryResult.Identity(QueryResultTree.Positions(limited), grouping ? grouping.rows : 'account')
    },

    // Execute an AccountQuery — filter accounts by predicate, return enriched with balances
    // @sig collectAccountQueryResult :: (Object, State) -> QueryResult
    collectAccountQueryResult: ({ filter: queryFilter }, state) => {
        const { accounts, transactions } = state
        const allAccounts = Array.from(accounts)
        const filtered = queryFilter
            ? filter(a => buildFilterPredicate(queryFilter)(T.toFilterableAccount(a)), allAccounts)
            : allAccounts
        const asOfDate = T.toIsoDate(new Date())
        const positions = computePositions({ ...state, asOfDate, selectedAccountIds: [], filterQuery: undefined })
        const enriched = EnrichedAccount.enrichAll(filtered, positions, Array.from(transactions))
        return QueryResult.FilteredEntities(enriched, 'accounts')
    },

    // Execute an ExpressionQuery — recursively resolve left/right sub-queries
    // @sig collectExpressionQueryResult :: (Object, State, Function) -> QueryResult
    collectExpressionQueryResult: ({ left, right, expression }, state, recurse) => {
        const leftResult = recurse(left, state)
        const rightResult = recurse(right, state)
        const bound = {
            left: { total: A.collectResultTotal(leftResult) },
            right: { total: A.collectResultTotal(rightResult) },
        }
        return QueryResult.Scalar(resolveExpression(expression, bound), expression)
    },

    // Build a Set of account IDs for investment/retirement accounts
    // @sig collectInvestmentAccountIds :: LookupTable -> Set
    collectInvestmentAccountIds: accounts =>
        new Set(
            filter(a => EnrichedAccount.POSITION_BALANCE_TYPES.includes(a.type), Array.from(accounts)).map(a => a.id),
        ),

    // Generate time-series snapshots at interval points within a date range
    // @sig collectSnapshotQueryResult :: (Object, State) -> QueryResult
    collectSnapshotQueryResult: ({ domain, filter: queryFilter, dateRange, interval }, state) => {
        const { accounts } = state
        const resolved = T.toDateRange(dateRange)
        if (!resolved) throw new Error('SnapshotQuery requires a date range')
        const datePoints = A.collectDatePoints(resolved.start, resolved.end, interval)

        if (domain === 'balances') {
            const filtered = A.collectFilteredTransactions(queryFilter, undefined, state)
            const investmentAccountIds = A.collectInvestmentAccountIds(accounts)
            const filteredAccountIds = new Set(filtered.map(t => t.accountId))
            const investmentAccountIdsInScope = filter(
                id => filteredAccountIds.has(id),
                Array.from(investmentAccountIds),
            )
            const snapshots = map(
                date =>
                    A.collectBalanceSnapshot(date, filtered, investmentAccountIds, investmentAccountIdsInScope, state),
                datePoints,
            )
            return QueryResult.TimeSeries(snapshots, 'balances')
        }
        const snapshots = map(date => A.collectPositionSnapshot(state, date), datePoints)
        return QueryResult.TimeSeries(snapshots, 'positions')
    },

    // Filter, sort, and accumulate per-transaction running balance
    // @sig collectRunningBalanceResult :: (Object, State) -> QueryResult
    collectRunningBalanceResult: ({ filter: queryFilter, dateRange }, state) => {
        const filtered = A.collectFilteredTransactions(queryFilter, dateRange, state)
        const sorted = [...filtered].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
        const entries = A.collectRunningBalanceEntries(sorted)
        return QueryResult.RunningBalance(entries)
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

// Dispatch a FinancialQuery to the appropriate execution path via .match()
// @sig runFinancialQuery :: (FinancialQuery, State, Number?) -> QueryResult
const runFinancialQuery = (query, state, depth = 0) => {
    const recurse = (q, s) => runFinancialQuery(q, s, depth + 1)
    if (depth > MAX_DEPTH) throw new Error(`FinancialQuery depth exceeded maximum of ${MAX_DEPTH}`)

    return query.match({
        TransactionQuery: fields => A.collectTransactionQueryResult(fields, state),
        PositionQuery: fields => A.collectPositionQueryResult(fields, state),
        AccountQuery: fields => A.collectAccountQueryResult(fields, state),
        ExpressionQuery: fields => A.collectExpressionQueryResult(fields, state, recurse),
        SnapshotQuery: fields => A.collectSnapshotQueryResult(fields, state),
        RunningBalanceQuery: fields => A.collectRunningBalanceResult(fields, state),
    })
}

export { runFinancialQuery }
