import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    Category,
    Lot,
    LotAllocation,
    Price,
    QueryResult,
    QueryResultTree,
    Security,
    Transaction,
} from '../../src/types/index.js'
import {
    ComputedRow,
    FinancialQuery,
    IRDateRange,
    IRExpression,
    IRFilter,
    IRGrouping,
    PivotExpression,
} from '../../src/query-language/types/index.js'
import { runFinancialQuery } from '../../src/query-language/run-financial-query.js'

// ═════════════════════════════════════════════════
// Helper: build a Bank transaction with minimal boilerplate
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

// ═════════════════════════════════════════════════
// Test fixture: mock Redux state with LookupTables
// ═════════════════════════════════════════════════

const ACCOUNTS = LookupTable(
    [
        Account('acc_000000000001', 'Chase Checking', 'Bank'),
        Account('acc_000000000002', 'Amex Platinum', 'Credit Card'),
        Account('acc_000000000003', 'Vanguard 401k', 'Investment'),
    ],
    Account,
    'id',
)

const CATEGORIES = LookupTable(
    [
        Category('cat_000000000001', 'Food'),
        Category('cat_000000000002', 'Food:Dining'),
        Category('cat_000000000003', 'Food:Groceries'),
        Category('cat_000000000004', 'Income'),
        Category('cat_000000000005', 'Income:Salary'),
        Category('cat_000000000006', 'Housing'),
        Category('cat_000000000007', 'Housing:Rent'),
    ],
    Category,
    'id',
)

// Multi-month data spanning Jan-Jun 2025 for snapshot and running balance tests
const TRANSACTIONS = LookupTable(
    [
        // Income (Jan-Mar 2025)
        bankTx('txn_000000000001', 'acc_000000000001', '2025-01-01', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000002', 'acc_000000000001', '2025-02-01', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000003', 'acc_000000000001', '2025-03-01', 5000, 'cat_000000000005', 'Employer'),

        // Food:Dining (across accounts and months)
        bankTx('txn_000000000004', 'acc_000000000001', '2025-01-15', -50, 'cat_000000000002', 'Chipotle'),
        bankTx('txn_000000000005', 'acc_000000000002', '2025-02-10', -75, 'cat_000000000002', 'Olive Garden'),
        bankTx('txn_000000000006', 'acc_000000000001', '2025-03-20', -60, 'cat_000000000002', 'Chipotle'),

        // Food:Groceries
        bankTx('txn_000000000007', 'acc_000000000001', '2025-01-20', -200, 'cat_000000000003', 'Costco'),
        bankTx('txn_000000000008', 'acc_000000000001', '2025-02-20', -180, 'cat_000000000003', 'Costco'),

        // Housing:Rent
        bankTx('txn_000000000009', 'acc_000000000001', '2025-01-05', -1500, 'cat_000000000007', 'Landlord'),
        bankTx('txn_00000000000a', 'acc_000000000001', '2025-02-05', -1500, 'cat_000000000007', 'Landlord'),
        bankTx('txn_00000000000b', 'acc_000000000001', '2025-03-05', -1500, 'cat_000000000007', 'Landlord'),
    ],
    Transaction,
    'id',
)

const STATE = {
    accounts: ACCOUNTS,
    categories: CATEGORIES,
    transactions: TRANSACTIONS,
    securities: LookupTable([], Security, 'id'),
    lots: LookupTable([], Lot, 'id'),
    lotAllocations: LookupTable([], LotAllocation, 'id'),
    prices: LookupTable([], Price, 'id'),
}

// ═════════════════════════════════════════════════
// (a) TransactionQuery — category grouping
// ═════════════════════════════════════════════════

test('TransactionQuery — category grouping with filter', t => {
    t.test('Given a TransactionQuery filtering by Food category', t => {
        t.test('When executing against state', t => {
            const query = FinancialQuery.TransactionQuery(
                'food_spending',
                'Food spending',
                IRFilter.Equals('category', 'Food'),
                IRDateRange.Year(2025),
                IRGrouping('category'),
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(QueryResultTree.Category.is(result.tree), 'Then result contains a category tree')
            t.ok(result.tree.nodes.length > 0, 'Then tree is not empty')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (b) TransactionQuery — pivot grouping with ComputedRow
// ═════════════════════════════════════════════════

test('TransactionQuery — pivot with computed rows', t => {
    t.test('Given a pivot query grouping by category rows and quarter columns', t => {
        t.test('When executing with a housing-%-of-income computed row', t => {
            const computed = [
                ComputedRow(
                    'Housing % of Income',
                    PivotExpression.Binary(
                        '/',
                        PivotExpression.RowRef('Housing'),
                        PivotExpression.Binary('*', PivotExpression.RowRef('Income'), PivotExpression.Literal(-1)),
                    ),
                ),
            ]
            const query = FinancialQuery.TransactionQuery(
                'pivot_test',
                'Category by quarter',
                undefined,
                IRDateRange.Year(2025),
                IRGrouping('category', 'quarter'),
                computed,
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.Pivot.is(result), 'Then result is QueryResult.Pivot')
            t.ok(Array.isArray(result.columns), 'Then result has columns array')
            t.ok(Array.isArray(result.rows), 'Then result has rows array')
            t.ok(result.cells !== undefined, 'Then result has cells grid')
            t.ok(result.computed !== undefined, 'Then result has computed rows')
            t.ok(result.computed['Housing % of Income'] !== undefined, 'Then housing ratio computed row exists')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (c) PositionQuery — structural
// ═════════════════════════════════════════════════

test('PositionQuery — positions tree', t => {
    t.test('Given a PositionQuery', t => {
        t.test('When executing against state with an investment account', t => {
            const query = FinancialQuery.PositionQuery('positions', 'All positions', undefined, IRDateRange.Year(2025))
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(QueryResultTree.Positions.is(result.tree), 'Then result contains a positions tree')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (d) AccountQuery — filter by type
// ═════════════════════════════════════════════════

test('AccountQuery — filter by account type', t => {
    t.test('Given an AccountQuery filtering by Bank type', t => {
        t.test('When executing against state', t => {
            const query = FinancialQuery.AccountQuery(
                'bank_accounts',
                'Bank accounts',
                IRFilter.Equals('accountType', 'Bank'),
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.FilteredEntities.is(result), 'Then result is QueryResult.FilteredEntities')
            t.equal(result.entities.length, 1, 'Then one Bank account is returned')
            t.equal(result.entities[0].account.name, 'Chase Checking', 'Then it is Chase Checking')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (e) ExpressionQuery — recursive sub-query dispatch
// ═════════════════════════════════════════════════

test('ExpressionQuery — food as percentage of income', t => {
    t.test('Given an ExpressionQuery with food and income sub-queries', t => {
        t.test('When executing the ratio expression', t => {
            const food = FinancialQuery.TransactionQuery(
                'food',
                undefined,
                IRFilter.Equals('category', 'Food'),
                IRDateRange.Quarter(1, 2025),
                IRGrouping('category'),
            )
            const income = FinancialQuery.TransactionQuery(
                'income',
                undefined,
                IRFilter.Equals('category', 'Income'),
                IRDateRange.Quarter(1, 2025),
                IRGrouping('category'),
            )
            const expression = IRExpression.Binary(
                '*',
                IRExpression.Binary(
                    '/',
                    IRExpression.Call('abs', [IRExpression.Reference('left', 'total')]),
                    IRExpression.Call('abs', [IRExpression.Reference('right', 'total')]),
                ),
                IRExpression.Literal(100),
            )
            const query = FinancialQuery.ExpressionQuery('food_ratio', 'Food % of income', food, income, expression)
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.Scalar.is(result), 'Then result is QueryResult.Scalar')
            t.type(result.value, 'number', 'Then value is a number')
            t.ok(result.value > 0, 'Then the ratio is positive')
            t.ok(result.value < 100, 'Then the ratio is less than 100%')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (f) SnapshotQuery — balance snapshots over time
// ═════════════════════════════════════════════════

test('SnapshotQuery — monthly balance snapshots', t => {
    t.test('Given a SnapshotQuery for balances at monthly intervals', t => {
        t.test('When executing over Q1 2025', t => {
            const query = FinancialQuery.SnapshotQuery(
                'net_worth',
                'Net worth over time',
                'balances',
                undefined,
                IRDateRange.Range('2025-01-01', '2025-03-31'),
                'monthly',
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.TimeSeries.is(result), 'Then result is QueryResult.TimeSeries')
            t.ok(Array.isArray(result.snapshots), 'Then result has snapshots array')
            t.ok(result.snapshots.length >= 3, 'Then there are at least 3 monthly snapshots')
            t.ok(result.snapshots[0].date !== undefined, 'Then each snapshot has a date')
            t.type(result.snapshots[0].total, 'number', 'Then each snapshot has a numeric total')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (g) RunningBalanceQuery — per-transaction cumulative
// ═════════════════════════════════════════════════

test('RunningBalanceQuery — cumulative balance', t => {
    t.test('Given a RunningBalanceQuery for Q1 2025', t => {
        t.test('When executing against state', t => {
            const query = FinancialQuery.RunningBalanceQuery(
                'running',
                'Running balance',
                undefined,
                IRDateRange.Quarter(1, 2025),
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(QueryResult.RunningBalance.is(result), 'Then result is QueryResult.RunningBalance')
            t.ok(Array.isArray(result.entries), 'Then result has entries array')
            t.ok(result.entries.length > 0, 'Then entries is not empty')
            const first = result.entries[0]
            t.ok(first.date !== undefined, 'Then each entry has a date')
            t.type(first.amount, 'number', 'Then each entry has an amount')
            t.type(first.balance, 'number', 'Then each entry has a cumulative balance')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (h) ExpressionQuery — depth limit
// ═════════════════════════════════════════════════

test('ExpressionQuery — depth limit prevents unbounded nesting', t => {
    t.test('Given a deeply nested ExpressionQuery beyond MAX_DEPTH', t => {
        t.test('When attempting to execute', t => {
            const leaf = FinancialQuery.TransactionQuery(
                'leaf',
                undefined,
                undefined,
                undefined,
                IRGrouping('category'),
            )
            const trivialExpr = IRExpression.Literal(1)

            // Build nesting: wrap in ExpressionQuery 12 times (exceeds MAX_DEPTH of 10)
            let nested = leaf
            for (let i = 0; i < 12; i++)
                nested = FinancialQuery.ExpressionQuery(`depth_${i}`, undefined, nested, leaf, trivialExpr)

            t.throws(() => runFinancialQuery(nested, STATE), 'Then execution throws a depth error')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (i) JSON.stringify stability — memoization depends on this
// ═════════════════════════════════════════════════

test('FinancialQuery — JSON.stringify produces stable deterministic output', t => {
    t.test('Given two identical TransactionQuery constructions', t => {
        t.test('When serializing both with JSON.stringify', t => {
            const a = FinancialQuery.TransactionQuery('q', undefined, undefined, undefined, IRGrouping('category'))
            const b = FinancialQuery.TransactionQuery('q', undefined, undefined, undefined, IRGrouping('category'))
            t.equal(JSON.stringify(a), JSON.stringify(b), 'Then serialized strings are identical')
            t.end()
        })
        t.end()
    })
    t.end()
})
