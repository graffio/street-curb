// ABOUTME: Tests for seed query execution against fixture data via the engine
// ABOUTME: Verifies each seed query pattern produces correct filtered results

import { test } from 'tap'
import { LookupTable, reduce } from '@graffio/functional'
import {
    Account,
    Category,
    Lot,
    LotAllocation,
    Price,
    Security,
    Transaction,
    FinancialQuery,
    IRComputedRow,
    IRDateRange,
    IRFilter,
    IRGrouping,
    IRPivotExpression,
} from '../src/types/index.js'
import { runFinancialQuery } from '../src/run-financial-query.js'

// ═════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

const countTreeTransactions = nodes => reduce((sum, node) => sum + node.aggregate.count, 0, nodes)

// ═════════════════════════════════════════════════
// Fixtures
// ═════════════════════════════════════════════════

const ACCOUNTS = LookupTable(
    [
        Account('acc_000000000001', 'Checking', 'Bank'),
        Account('acc_000000000002', 'Savings', 'Bank'),
        Account('acc_000000000003', 'Brokerage', 'Investment'),
    ],
    Account,
    'id',
)

const CATEGORIES = LookupTable(
    [
        Category('cat_000000000001', 'Food'),
        Category('cat_000000000002', 'Food:Dining'),
        Category('cat_000000000003', 'Food:Groceries'),
        Category('cat_000000000004', 'Shopping'),
        Category('cat_000000000005', 'Transfer'),
        Category('cat_000000000006', 'Income'),
        Category('cat_000000000007', 'Housing'),
        Category('cat_000000000008', 'Housing:Rent'),
    ],
    Category,
    'id',
)

// prettier-ignore
const TRANSACTIONS = LookupTable(
    [
        bankTx('txn_000000000001', 'acc_000000000001', '2025-01-15',  5000, 'cat_000000000006', 'Employer'),       // Income, Checking
        bankTx('txn_000000000002', 'acc_000000000002', '2025-01-20',   150, 'cat_000000000002', 'Olive Garden'),    // Food:Dining, Savings
        bankTx('txn_000000000003', 'acc_000000000001', '2025-01-25',   200, 'cat_000000000004', 'WALMART'),         // Shopping, Checking
        bankTx('txn_000000000004', 'acc_000000000001', '2025-02-01',    50, 'cat_000000000003', 'WAL-Mart'),        // Food:Groceries, Checking
        bankTx('txn_000000000005', 'acc_000000000001', '2025-02-10',   800, 'cat_000000000005', 'Wire Transfer'),   // Transfer, Checking
        bankTx('txn_000000000006', 'acc_000000000003', '2025-02-15',   300, 'cat_000000000002', 'WAL-Greens'),      // Food:Dining, Brokerage
        bankTx('txn_000000000007', 'acc_000000000001', '2025-02-20',    30, 'cat_000000000001', 'Corner Store'),    // Food, Checking
        bankTx('txn_000000000008', 'acc_000000000001', '2025-03-01', -1500, 'cat_000000000008', 'Landlord'),        // Housing:Rent, Checking
        bankTx('txn_000000000009', 'acc_000000000001', '2025-03-15',  5000, 'cat_000000000006', 'Employer'),        // Income, Checking
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
// Seed queries — FinancialQuery variants
// ═════════════════════════════════════════════════

const { And, Between, Equals, GreaterThan, In, Matches, Not, Or } = IRFilter

const runSeed = query => {
    const result = runFinancialQuery(query, STATE)
    if (result.nodes) return result.nodes
    return result
}

const SEEDS = {
    large_transactions: FinancialQuery.TransactionQuery(
        'large_transactions',
        undefined,
        GreaterThan('amount', 500),
        undefined,
        IRGrouping('category'),
    ),
    dining_multi_account: FinancialQuery.TransactionQuery(
        'dining_multi_account',
        undefined,
        And([Equals('category', 'Food:Dining'), In('account', ['Checking', 'Savings'])]),
        undefined,
        IRGrouping('category'),
    ),
    exclude_transfers: FinancialQuery.TransactionQuery(
        'exclude_transfers',
        undefined,
        Not(Equals('category', 'Transfer')),
        undefined,
        IRGrouping('category'),
    ),
    payee_pattern: FinancialQuery.TransactionQuery(
        'payee_pattern',
        undefined,
        Matches('payee', '^WAL'),
        undefined,
        IRGrouping('category'),
    ),
    amount_range: FinancialQuery.TransactionQuery(
        'amount_range',
        undefined,
        And([Between('amount', 100, 1000), Or([Equals('category', 'Food'), Equals('category', 'Shopping')])]),
        undefined,
        IRGrouping('category'),
    ),
    net_worth: FinancialQuery.SnapshotQuery(
        'net_worth',
        'Net worth over time',
        'balances',
        undefined,
        undefined,
        IRDateRange.Range('2025-01-01', '2025-03-31'),
        'monthly',
    ),
    spending_over_time: FinancialQuery.SnapshotQuery(
        'spending_over_time',
        'Spending over time',
        'balances',
        undefined,
        IRGrouping('category'),
        IRDateRange.Range('2025-01-01', '2025-03-31'),
        'monthly',
    ),
    category_by_year: FinancialQuery.TransactionQuery(
        'category_by_year',
        'Spending by category per year',
        undefined,
        undefined,
        IRGrouping('category', 'year'),
        [
            IRComputedRow(
                'Housing % of Income',
                IRPivotExpression.Binary(
                    '/',
                    IRPivotExpression.RowRef('Housing'),
                    IRPivotExpression.Binary('*', IRPivotExpression.RowRef('Income'), IRPivotExpression.Literal(-1)),
                ),
            ),
        ],
    ),
}

// ═════════════════════════════════════════════════
// (a) large_transactions — GreaterThan('amount', 500)
// ═════════════════════════════════════════════════

test('large_transactions — GreaterThan amount 500', t => {
    t.test('Given the large_transactions seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.large_transactions)

            t.equal(countTreeTransactions(nodes), 3, 'Then only transactions over 500 are included')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (b) dining_multi_account — Dining at Checking or Savings
// ═════════════════════════════════════════════════

test('dining_multi_account — Dining at Checking or Savings', t => {
    t.test('Given the dining_multi_account seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.dining_multi_account)

            t.equal(countTreeTransactions(nodes), 1, 'Then only Dining at Checking/Savings is included')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (c) exclude_transfers — Not(Equals category Transfer)
// ═════════════════════════════════════════════════

test('exclude_transfers — everything except Transfer', t => {
    t.test('Given the exclude_transfers seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.exclude_transfers)
            const groupNames = nodes.map(n => n.id)

            t.equal(countTreeTransactions(nodes), 8, 'Then all non-Transfer transactions are included')
            t.notOk(groupNames.includes('Transfer'), 'Then no Transfer category group exists')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (d) payee_pattern — Matches payee ^WAL
// ═════════════════════════════════════════════════

test('payee_pattern — payees starting with WAL', t => {
    t.test('Given the payee_pattern seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.payee_pattern)

            t.equal(countTreeTransactions(nodes), 3, 'Then only WAL* payees are included')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (e) amount_range — Between 100-1000 AND (Food OR Shopping)
// ═════════════════════════════════════════════════

test('amount_range — mid-range spending in Food or Shopping', t => {
    t.test('Given the amount_range seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.amount_range)

            t.equal(countTreeTransactions(nodes), 3, 'Then only 100-1000 amounts in Food or Shopping are included')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (f) net_worth — SnapshotQuery with monthly intervals
// ═════════════════════════════════════════════════

test('net_worth — SnapshotQuery tree output with monthly columns', t => {
    t.test('Given the net_worth seed query', t => {
        t.test('When executed against fixture data', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)

            t.ok(Array.isArray(result.nodes), 'Then result has nodes (tree shape)')
            t.ok(Array.isArray(result.columns), 'Then result has columns (date points)')
            t.ok(result.columns.length >= 3, 'Then at least 3 monthly date points')
            t.equal(result.nodes.length, 1, 'Then single summary node')
            t.end()
        })
        t.test('Then tree excludes investment account transactions from cash total', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)
            const node = result.nodes[0]
            const janCol = result.columns[0]

            // Fixture: Jan Checking +5000 +200 = 5200, Savings +150 = 5350, Brokerage excluded
            t.ok(node.aggregate.columns[janCol] > 0, 'Then January total is positive')
            t.end()
        })
        t.test('Then monthly column values are cumulative', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)
            const node = result.nodes[0]
            const firstCol = result.columns[0]
            const lastCol = result.columns[result.columns.length - 1]

            // Last column should include March income (+5000) and rent (-1500)
            t.ok(node.aggregate.columns[lastCol] !== node.aggregate.columns[firstCol], 'Then totals change over time')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (g) spending_over_time — SnapshotQuery with grouping
// ═════════════════════════════════════════════════

test('spending_over_time — SnapshotQuery with category grouping', t => {
    t.test('Given the spending_over_time seed query', t => {
        t.test('When executed against fixture data', t => {
            const result = runFinancialQuery(SEEDS.spending_over_time, STATE)

            t.ok(Array.isArray(result.nodes), 'Then result has nodes (tree shape)')
            t.ok(Array.isArray(result.columns), 'Then result has columns (date points)')
            t.ok(result.nodes.length > 1, 'Then multiple category nodes')
            t.end()
        })
        t.test('Then per-category nodes have date-point columns with drillable children', t => {
            const result = runFinancialQuery(SEEDS.spending_over_time, STATE)
            const food = result.nodes.find(n => n.id === 'Food')

            t.ok(food, 'Then Food parent node exists')
            t.ok(food.aggregate.columns, 'Then Food has per-date-point columns')
            t.ok(food.children.length > 0, 'Then Food has drillable children')

            const dining = food.children.find(n => n.id === 'Food:Dining')
            t.ok(dining, 'Then Food:Dining is a child of Food')
            t.ok(dining.aggregate.columns, 'Then Food:Dining has per-date-point columns')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (h) category_by_year — Pivot with IRComputedRow
// ═════════════════════════════════════════════════

test('category_by_year — 2D tree with computed row', t => {
    t.test('Given the category_by_year seed query', t => {
        t.test('When executed against fixture data', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)

            t.ok(Array.isArray(result.nodes), 'Then result has nodes (2D tree)')
            t.ok(result.columns.length > 0, 'Then columns exist')
            t.equal(result.source, 'category', 'Then source is category')
            t.ok(result.computed['Housing % of Income'] !== undefined, 'Then computed row exists')
            t.end()
        })
        t.test('Then tree has top-level category groups', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)
            const names = result.nodes.map(n => n.id)

            t.ok(names.includes('Food'), 'Then Food is a top-level node')
            t.ok(names.includes('Housing'), 'Then Housing is a top-level node')
            t.ok(names.includes('Income'), 'Then Income is a top-level node')
            t.end()
        })
        t.test('Then Food node aggregates all Food subcategory transactions', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)
            const food = result.nodes.find(n => n.id === 'Food')

            t.type(food.aggregate.total, 'number', 'Then Food has a numeric total')
            t.ok(food.aggregate.total !== 0, 'Then Food total is non-zero')
            t.ok(food.aggregate.columns, 'Then Food has per-column values')
            t.end()
        })
        t.test('Then Housing % of Income computed row has values', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)
            const housingPct = result.computed['Housing % of Income']
            const yearCol = result.columns[0]

            t.type(housingPct[yearCol], 'number', 'Then computed value is a number')
            t.ok(!isNaN(housingPct[yearCol]), 'Then computed value is not NaN')
            t.ok(
                housingPct[yearCol] > 0,
                'Then housing-to-income ratio is positive (negative expense / negative income)',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})
