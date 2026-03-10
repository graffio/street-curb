import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    Category,
    Lot,
    LotAllocation,
    Price,
    Security,
    Transaction,
    IRFinancialQuery,
    IRComputedRow,
    IRDateRange,
    IRFilter,
    IRGrouping,
    IRPivotExpression,
} from '../src/types/index.js'
import { runFinancialQuery } from '../src/run-financial-query.js'

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
            const query = IRFinancialQuery.TransactionQuery(
                'food_spending',
                'Food spending',
                IRFilter.Equals('category', 'Food'),
                IRDateRange.Year(2025),
                IRGrouping('category'),
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(Array.isArray(result.nodes), 'Then result has nodes array')
            t.ok(result.nodes.length > 0, 'Then tree is not empty')
            t.equal(result.source, 'category', 'Then source is category')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (b) TransactionQuery — pivot grouping with IRComputedRow
// ═════════════════════════════════════════════════

test('TransactionQuery — pivot with computed rows', t => {
    t.test('Given a pivot query grouping by category rows and quarter columns', t => {
        t.test('When executing with a housing-%-of-income computed row', t => {
            const computed = [
                IRComputedRow(
                    'Housing % of Income',
                    IRPivotExpression.Binary(
                        '/',
                        IRPivotExpression.RowRef('Housing'),
                        IRPivotExpression.Binary(
                            '*',
                            IRPivotExpression.RowRef('Income'),
                            IRPivotExpression.Literal(-1),
                        ),
                    ),
                ),
            ]
            const query = IRFinancialQuery.TransactionQuery(
                'pivot_test',
                'Category by quarter',
                undefined,
                IRDateRange.Year(2025),
                IRGrouping('category', 'quarter'),
                computed,
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(Array.isArray(result.nodes), 'Then result has nodes (2D tree)')
            t.ok(Array.isArray(result.columns), 'Then result has columns array')
            t.equal(result.source, 'category', 'Then source is category')

            // Tree nodes have per-column values in aggregate.columns
            const food = result.nodes.find(n => n.id === 'Food')
            t.ok(food, 'Then Food group exists in tree')
            t.ok(food.aggregate.columns, 'Then Food has per-column values')

            // IRComputedRow evaluation produces per-column ratios
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
            const query = IRFinancialQuery.PositionQuery(
                'positions',
                'All positions',
                undefined,
                IRDateRange.Year(2025),
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(Array.isArray(result.nodes), 'Then result has nodes array')
            t.equal(result.source, 'account', 'Then source is account')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (d) SnapshotQuery — balance snapshots over time
// ═════════════════════════════════════════════════

test('SnapshotQuery — monthly balance snapshots (legacy shape check)', t => {
    t.test('Given a SnapshotQuery for balances at monthly intervals', t => {
        t.test('When executing over Q1 2025', t => {
            const query = IRFinancialQuery.SnapshotQuery(
                'net_worth',
                'Net worth over time',
                undefined,
                IRDateRange.Range('2025-01-01', '2025-03-31'),
                undefined,
                'balances',
                'monthly',
            )
            const result = runFinancialQuery(query, STATE)
            t.ok(Array.isArray(result.nodes), 'Then result has nodes array')
            t.ok(Array.isArray(result.columns), 'Then result has columns array')
            t.ok(result.columns.length >= 3, 'Then at least 3 monthly column keys')
            t.equal(result.source, 'balances', 'Then source is balances')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (d2) SnapshotQuery — tree output (ungrouped and grouped)
// ═════════════════════════════════════════════════

test('SnapshotQuery — ungrouped tree output', t => {
    t.test('Given a SnapshotQuery without grouping', t => {
        t.test('When executing over Q1 2025', t => {
            const query = IRFinancialQuery.SnapshotQuery(
                'net_worth',
                'Net worth over time',
                undefined,
                IRDateRange.Range('2025-01-01', '2025-03-31'),
                undefined,
                'balances',
                'monthly',
            )
            const result = runFinancialQuery(query, STATE)

            t.ok(Array.isArray(result.nodes), 'Then result has nodes array')
            t.ok(Array.isArray(result.columns), 'Then result has columns array')
            t.ok(result.columns.length >= 3, 'Then at least 3 monthly column keys')
            t.equal(result.nodes.length, 1, 'Then single summary node')
            t.ok(result.nodes[0].aggregate.columns, 'Then node has per-date-point columns')
            t.type(result.nodes[0].aggregate.columns[result.columns[0]], 'number', 'Then column value is numeric')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('SnapshotQuery — grouped tree output', t => {
    t.test('Given a SnapshotQuery with category grouping', t => {
        t.test('When executing over Q1 2025', t => {
            const query = IRFinancialQuery.SnapshotQuery(
                'spending_by_cat',
                'Spending by category over time',
                undefined,
                IRDateRange.Range('2025-01-01', '2025-03-31'),
                IRGrouping('category'),
                'balances',
                'monthly',
            )
            const result = runFinancialQuery(query, STATE)

            t.ok(Array.isArray(result.nodes), 'Then result has nodes array')
            t.ok(Array.isArray(result.columns), 'Then result has columns array')
            t.ok(result.nodes.length > 1, 'Then multiple category nodes')

            const food = result.nodes.find(n => n.id === 'Food')
            t.ok(food, 'Then Food parent node exists')
            t.ok(food.aggregate.columns, 'Then Food has per-date-point columns')

            const dining = food.children.find(n => n.id === 'Food:Dining')
            t.ok(dining, 'Then Food:Dining is a child of Food')
            t.ok(dining.aggregate.columns, 'Then Food:Dining has per-date-point columns')

            const housing = result.nodes.find(n => n.id === 'Housing')
            t.ok(housing, 'Then Housing parent node exists')
            t.ok(housing.aggregate.columns, 'Then Housing has per-date-point columns')

            const rent = housing.children.find(n => n.id === 'Housing:Rent')
            t.ok(rent, 'Then Housing:Rent is a child of Housing')
            t.ok(rent.aggregate.columns, 'Then Housing:Rent has per-date-point columns')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (e) JSON.stringify stability — memoization depends on this
// ═════════════════════════════════════════════════

test('IRFinancialQuery — JSON.stringify produces stable deterministic output', t => {
    t.test('Given two identical TransactionQuery constructions', t => {
        t.test('When serializing both with JSON.stringify', t => {
            const a = IRFinancialQuery.TransactionQuery('q', undefined, undefined, undefined, IRGrouping('category'))
            const b = IRFinancialQuery.TransactionQuery('q', undefined, undefined, undefined, IRGrouping('category'))
            t.equal(JSON.stringify(a), JSON.stringify(b), 'Then serialized strings are identical')
            t.end()
        })
        t.end()
    })
    t.end()
})
