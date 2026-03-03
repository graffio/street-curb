// ABOUTME: Query execution engine — routes IR sources to state queries and computes results
// ABOUTME: Resolves dates, filters data, dispatches computations via QueryResult types

import { filter, find, map, reduce } from '@graffio/functional'
import { QueryResult, ResultTree, Transaction } from '../types/index.js'
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
    // @sig toRelativeDateRange :: Object -> { start: String, end: String } | undefined
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
    // @sig toDateRange :: DateRange? -> { start: String, end: String } | undefined
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
    // Only called for entity fields (category, account, payee) which are always QueryFilter.Equals
    // @sig toFilterValues :: (String, [QueryFilter]) -> [String]
    toFilterValues: (field, filters) =>
        map(
            f => f.value,
            filter(f => f.field === field, filters),
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Execute a transaction source: apply filters, resolve dates, build tree
    // @sig collectTransactionResult :: (QuerySource, Object) -> [CategoryTreeNode]
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
    // @sig collectAccountResult :: (QuerySource, Object) -> [Account]
    collectAccountResult: ({ filters }, { accounts }) => {
        const typeFilters = T.toFilterValues('accountType', filters)
        return typeFilters.length > 0
            ? filter(a => typeFilters.includes(a.type), Array.from(accounts))
            : Array.from(accounts)
    },

    // Execute a holdings source (placeholder — returns empty tree)
    // @sig collectHoldingsResult :: (QuerySource, Object) -> [HoldingsTreeNode]
    collectHoldingsResult: (_source, _state) => [],

    // Route a source to the correct domain executor via Domain.match()
    // @sig collectSourceResult :: (QuerySource, Object) -> ResultTree | [Account]
    collectSourceResult: (source, state) =>
        source.domain.match({
            Transactions: () => ResultTree.Category(A.collectTransactionResult(source, state)),
            Accounts: () => A.collectAccountResult(source, state),
            Holdings: () => ResultTree.Holdings(A.collectHoldingsResult(source, state)),
        }),

    // Sum top-level node totals from a ResultTree (Category: .total, Holdings: .marketValue)
    // @sig collectTotal :: ResultTree -> Number
    collectTotal: resultTree =>
        resultTree.match({
            Category: ({ nodes }) => reduce((sum, node) => sum + node.aggregate.total, 0, nodes),
            Holdings: ({ nodes }) => reduce((sum, node) => sum + node.aggregate.marketValue, 0, nodes),
        }),

    // Collect bound values for expression evaluation from executed source results
    // @sig collectBoundValues :: Object -> Object
    collectBoundValues: executed =>
        reduce(
            (values, [name, data]) => ({
                ...values,
                [name]: { total: ResultTree.is(data) ? A.collectTotal(data) : 0 },
            }),
            {},
            Object.entries(executed),
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Execute a query IR against Redux state, dispatching on computation type
// @sig queryExecutionEngine :: (QueryIR, Object) -> QueryResult
const queryExecutionEngine = ({ sources, computation }, state) => {
    const executed = reduce(
        (results, source) => ({ ...results, [source.name]: A.collectSourceResult(source, state) }),
        {},
        Array.from(sources),
    )

    return computation.match({
        Identity: ({ source }) => QueryResult.Identity(executed[source], source),
        Compare: ({ left, right }) => QueryResult.Comparison(executed[left], executed[right], left),
        Expression: ({ expression }) =>
            QueryResult.Scalar(resolveExpression(expression, A.collectBoundValues(executed)), expression),
        FilterEntities: ({ source }) => QueryResult.FilteredEntities(executed[source], source),
    })
}
export { queryExecutionEngine }
