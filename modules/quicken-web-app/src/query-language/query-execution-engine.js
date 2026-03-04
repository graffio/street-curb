// ABOUTME: Query execution engine — routes IR sources to state queries and computes results
// ABOUTME: Resolves dates, filters data, dispatches computations via IRResult types

import { filter, find, map, range, reduce } from '@graffio/functional'
import { IRResult, IRResultTree, PositionTreeNode, Transaction } from '../types/index.js'
import { computePositions } from '../financial-computations/compute-positions.js'
import { buildPositionsTree } from '../financial-computations/build-positions-tree.js'
import { MetricRegistry } from '../financial-computations/metric-registry.js'
import { CategoryTree } from '../utils/category-tree.js'
import { resolveExpression } from './resolve-expression.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if a date falls within a resolved date range (or passes if no range)
    // @sig isInDateRange :: ({ start: String, end: String } | undefined, String) -> Boolean
    isInDateRange: (dateRange, date) => !dateRange || (date >= dateRange.start && date <= dateRange.end),

    // Check if a value is in a filter list, or pass if the filter list is empty
    // @sig isFilterMatch :: ([String], String) -> Boolean
    isFilterMatch: (filterValues, value) => filterValues.length === 0 || filterValues.includes(value),

    // Check if a transaction passes all source filters and date range
    // @sig isTransactionMatch :: ([String], [String], [String], Object, Transaction) -> Boolean
    isTransactionMatch: (categoryIds, accountIds, payees, dateRange, t) => {
        const { accountId, categoryId, date, payee } = t
        return (
            P.isInDateRange(dateRange, date) &&
            P.isFilterMatch(categoryIds, categoryId) &&
            P.isFilterMatch(accountIds, accountId) &&
            P.isFilterMatch(payees, payee)
        )
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Format a Date object as 'YYYY-MM-DD' using local time (avoids timezone shift from toISOString)
    // @sig toIsoDate :: Date -> String
    toIsoDate: date => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    },

    // Parse an ISO date string as local-time Date (avoids UTC timezone shift from new Date())
    // @sig toLocalDate :: String -> Date
    toLocalDate: s => {
        const [y, m, d] = s.split('-').map(Number)
        return new Date(y, m - 1, d)
    },

    // Get the last day of a month (1-indexed month)
    // @sig toLastDay :: (Number, Number) -> Number
    toLastDay: (year, month) => new Date(year, month, 0).getDate(),

    // Format year and month pair as padded 'YYYY-MM-DD' start/end date strings
    // @sig toMonthRange :: (Number, Number) -> { start: String, end: String }
    toMonthRange: (year, month) => {
        const lastDay = T.toLastDay(year, month)
        const mm = String(month).padStart(2, '0')
        return { start: `${year}-${mm}-01`, end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` }
    },

    // Resolve a relative date descriptor to absolute { start, end } ISO date strings
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

    // Resolve IR date descriptor to absolute { start, end } ISO date strings
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
            Named: ({ name }) => {
                throw new Error(`Named date range '${name}' not yet supported`)
            },
        })
    },

    // Resolve category name to matching category IDs (exact match + children via prefix)
    // @sig toCategoryIds :: (String, LookupTable) -> [String]
    toCategoryIds: (categoryName, categories) =>
        map(
            c => c.id,
            filter(c => c.name === categoryName || c.name.startsWith(categoryName + ':'), Array.from(categories)),
        ),

    // Resolve account name to account ID
    // @sig toAccountId :: (String, LookupTable) -> String
    toAccountId: (accountName, accounts) => {
        const account = find(a => a.name === accountName, Array.from(accounts))
        if (!account) throw new Error(`Unknown account '${accountName}'`)
        return account.id
    },

    // Extract filter values for a specific field from IR source filters
    // Only called for entity fields (category, account, payee) which are always IRFilter.Equals
    // @sig toFilterValues :: (String, [IRFilter]) -> [String]
    toFilterValues: (field, filters) =>
        map(
            f => f.value,
            filter(f => f.field === field, filters),
        ),

    // Advance a date by one interval step, returning a new Date
    // @sig toAdvancedDate :: (Date, String) -> Date
    toAdvancedDate: (date, interval) => {
        const d = new Date(date.getTime())
        INTERVAL_ADVANCE[interval](d)
        return d
    },

    // Get the first date point for a given interval (end-of-first-month for monthly, start date otherwise)
    // @sig toInitialDatePoint :: (Date, String) -> Date
    toInitialDatePoint: (startDate, interval) => {
        if (interval !== 'monthly') return new Date(startDate.getTime())
        const d = new Date(startDate.getTime())
        d.setDate(1)
        d.setMonth(d.getMonth() + 1)
        d.setDate(0)
        return d
    },

    // Extract the sort value for a position tree node from metrics or position fields
    // @sig toNodeSortValue :: (PositionTreeNode, String) -> Number
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
    // Execute a transaction source: apply filters, resolve dates, build tree
    // @sig collectTransactionResult :: (IRSource, Object) -> [CategoryTreeNode]
    collectTransactionResult: (source, state) => {
        const { accounts, categories, transactions } = state
        const { dateRange: dateDescriptor, filters, groupBy } = source
        const dateRange = T.toDateRange(dateDescriptor)
        const categoryIds = T.toFilterValues('category', filters).flatMap(n => T.toCategoryIds(n, categories))
        const accountIds = map(n => T.toAccountId(n, accounts), T.toFilterValues('account', filters))
        const payees = T.toFilterValues('payee', filters)

        const filtered = filter(
            t => P.isTransactionMatch(categoryIds, accountIds, payees, dateRange, t),
            Array.from(transactions),
        )

        const enriched = Transaction.enrichAll(filtered, categories, accounts)
        return CategoryTree.buildTransactionTree(groupBy || 'category', enriched)
    },

    // Execute an accounts source: filter by accountType if specified
    // @sig collectAccountResult :: (IRSource, Object) -> [Account]
    collectAccountResult: ({ filters }, { accounts }) => {
        const typeFilters = T.toFilterValues('accountType', filters)
        return typeFilters.length > 0
            ? filter(a => typeFilters.includes(a.type), Array.from(accounts))
            : Array.from(accounts)
    },

    // Execute a positions source: compute positions as of date, optionally with metrics
    // @sig collectPositionsResult :: (IRSource, Object) -> [PositionTreeNode]
    collectPositionsResult: (source, state) => {
        const { dateRange: dateDescriptor, groupBy, metrics } = source
        const dateRange = T.toDateRange(dateDescriptor)
        const asOfDate = dateRange ? dateRange.end : T.toIsoDate(new Date())
        const positions = computePositions({ ...state, asOfDate, selectedAccountIds: [], filterQuery: undefined })
        if (groupBy) return buildPositionsTree(groupBy, positions)
        const nodes = map(
            position => PositionTreeNode.Position(`${position.accountId}|${position.securityId}`, [], position),
            positions,
        )
        if (metrics) return map(node => A.collectPositionMetrics(node, metrics, state, asOfDate), nodes)
        return nodes
    },

    // Route a source to the correct domain executor via IRDomain.match()
    // @sig collectSourceResult :: (IRSource, Object) -> IRResultTree | [Account]
    collectSourceResult: (source, state) =>
        source.domain.match({
            Transactions: () => IRResultTree.Category(A.collectTransactionResult(source, state)),
            Accounts: () => A.collectAccountResult(source, state),
            Positions: () => IRResultTree.Positions(A.collectPositionsResult(source, state)),
        }),

    // Sum top-level node totals from an IRResultTree (Category: .total, Positions: .marketValue)
    // @sig collectTotal :: IRResultTree -> Number
    collectTotal: resultTree =>
        resultTree.match({
            Category: ({ nodes }) => reduce((sum, node) => sum + node.aggregate.total, 0, nodes),
            Positions: ({ nodes }) => reduce((sum, node) => sum + node.aggregate.marketValue, 0, nodes),
        }),

    // Collect bound values for expression evaluation from executed source results
    // @sig collectBoundValues :: Object -> Object
    collectBoundValues: executed =>
        reduce(
            (values, [name, data]) => ({
                ...values,
                [name]: { total: IRResultTree.is(data) ? A.collectTotal(data) : 0 },
            }),
            {},
            Object.entries(executed),
        ),

    // Compute a single metric value and accumulate into metrics object
    // @sig collectMetric :: (Object, Position, Object, String) -> Object
    collectMetric: (acc, position, context, name) => {
        const definition = MetricRegistry.get(name)
        if (!definition) throw new Error(`Unknown metric '${name}'`)
        return { ...acc, [name]: definition.compute(position, context) }
    },

    // Compute requested metrics for a position tree node, returning node with metrics attached
    // @sig collectPositionMetrics :: (PositionTreeNode, [String], Object, String) -> PositionTreeNode
    collectPositionMetrics: (node, metricNames, state, asOfDate) => {
        const { id, children, position } = node
        const context = { ...state, asOfDate, benchmarkSecurityId: A.findBenchmarkSecurityId(state) }
        const metrics = reduce((acc, name) => A.collectMetric(acc, position, context, name), {}, metricNames)
        return PositionTreeNode.Position(id, children, position, metrics)
    },

    // Find the benchmark security ID (SPY) from state
    // @sig findBenchmarkSecurityId :: Object -> String | undefined
    findBenchmarkSecurityId: ({ securities }) => {
        const spy = find(s => s.ticker === 'SPY', Array.from(securities))
        return spy ? spy.id : undefined
    },

    // Apply orderBy sorting to position tree nodes
    // @sig collectSortedNodes :: ([PositionTreeNode], String, String) -> [PositionTreeNode]
    collectSortedNodes: (nodes, field, direction) => {
        const comparator =
            direction === 'asc'
                ? (a, b) => T.toNodeSortValue(a, field) - T.toNodeSortValue(b, field)
                : (a, b) => T.toNodeSortValue(b, field) - T.toNodeSortValue(a, field)
        return [...nodes].sort(comparator)
    },

    // Accumulate the next date point if within range, otherwise return unchanged
    // @sig collectNextDatePoint :: (Object, Date, String) -> Object
    collectNextDatePoint: (acc, endDate, interval) => {
        const next = T.toAdvancedDate(acc.current, interval)
        return next <= endDate ? { current: next, points: [...acc.points, T.toIsoDate(next)] } : acc
    },

    // Generate date points at interval boundaries within a date range
    // @sig collectDatePoints :: (String, String, String) -> [String]
    collectDatePoints: (start, end, interval) => {
        const startDate = T.toLocalDate(start)
        const endDate = T.toLocalDate(end)
        const initial = T.toInitialDatePoint(startDate, interval)
        const seed = { current: initial, points: initial <= endDate ? [T.toIsoDate(initial)] : [] }
        return reduce((acc, _) => A.collectNextDatePoint(acc, endDate, interval), seed, range(0, SAFETY_LIMIT)).points
    },

    // Create a position snapshot for a given date
    // @sig collectSnapshot :: (Object, String) -> { date: String, positions: [Position] }
    collectSnapshot: (state, date) => ({
        date,
        positions: computePositions({ ...state, asOfDate: date, selectedAccountIds: [], filterQuery: undefined }),
    }),

    // Compute timeSeries snapshots at interval boundaries within the source date range
    // @sig collectTimeSeriesResult :: (String, String, Object, LookupTable) -> IRResult
    collectTimeSeriesResult: (sourceName, interval, state, sources) => {
        const sourceIR = find(s => s.name === sourceName, Array.from(sources))
        const dateRange = T.toDateRange(sourceIR.dateRange)
        if (!dateRange) throw new Error('TimeSeries requires a date range')
        const datePoints = A.collectDatePoints(dateRange.start, dateRange.end, interval)
        return IRResult.TimeSeries(
            map(date => A.collectSnapshot(state, date), datePoints),
            sourceName,
        )
    },

    // Apply orderBy and limit post-processing to an IRResultTree.Positions result
    // @sig collectPostProcessedResult :: (IRResultTree, IROutput) -> IRResultTree
    collectPostProcessedResult: (tree, output) => {
        if (!output || !IRResultTree.Positions.is(tree)) return tree
        const { orderByField, orderByDirection, limit } = output
        let nodes = tree.nodes
        if (orderByField) nodes = A.collectSortedNodes(nodes, orderByField, orderByDirection || 'asc')
        if (limit !== undefined) nodes = nodes.slice(0, limit)
        return IRResultTree.Positions(nodes)
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Execute a query IR against Redux state, dispatching on computation type
// @sig queryExecutionEngine :: (Query, Object) -> IRResult
const queryExecutionEngine = ({ sources, computation, output }, state) => {
    const executed = reduce(
        (results, source) => ({ ...results, [source.name]: A.collectSourceResult(source, state) }),
        {},
        Array.from(sources),
    )

    return computation.match({
        Identity: ({ source }) => IRResult.Identity(A.collectPostProcessedResult(executed[source], output), source),
        Compare: ({ left, right }) => IRResult.Comparison(executed[left], executed[right], left),
        Expression: ({ expression }) =>
            IRResult.Scalar(resolveExpression(expression, A.collectBoundValues(executed)), expression),
        FilterEntities: ({ source }) => IRResult.FilteredEntities(executed[source], source),
        TimeSeries: ({ source: sourceName, interval }) =>
            A.collectTimeSeriesResult(sourceName, interval, state, sources),
    })
}
export { queryExecutionEngine }
