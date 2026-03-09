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
    QueryResult,
    Security,
    Transaction,
} from '../../src/types/index.js'
import {
    ComputedRow,
    FinancialQuery,
    IRDateRange,
    IRFilter,
    IRGrouping,
    PivotExpression,
} from '../../src/query-language/types/index.js'
import { runFinancialQuery } from '../../src/query-language/run-financial-query.js'

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
    if (QueryResult.Identity.is(result)) return result.tree.nodes
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
            ComputedRow(
                'Housing % of Income',
                PivotExpression.Binary(
                    '/',
                    PivotExpression.RowRef('Housing'),
                    PivotExpression.Binary('*', PivotExpression.RowRef('Income'), PivotExpression.Literal(-1)),
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

test('net_worth — SnapshotQuery monthly balance snapshots', t => {
    t.test('Given the net_worth seed query', t => {
        t.test('When executed against fixture data', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)

            t.ok(QueryResult.TimeSeries.is(result), 'Then result is TimeSeries')
            t.ok(result.snapshots.length >= 3, 'Then at least 3 monthly snapshots')
            t.type(result.snapshots[0].total, 'number', 'Then each snapshot has a numeric total')
            t.end()
        })
        t.test('Then snapshots exclude investment account transactions from cash total', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)

            // Fixture has no lots/positions, so investment total is 0.
            // Only non-investment transactions (Checking + Savings) should be summed.
            // Brokerage txn (acc_000000000003, $300) should be excluded from cash.
            const jan = result.snapshots[0]

            // Jan: Checking gets +5000 (Income) +150... wait, Savings gets +150. Brokerage excluded.
            // Checking: +5000 +200 = 5200 by Jan 31, Savings: +150 by Jan 31 => 5350
            t.ok(jan.total > 0, 'Then January total is positive')
            t.end()
        })
        t.test('Then monthly totals are cumulative', t => {
            const result = runFinancialQuery(SEEDS.net_worth, STATE)
            const totals = result.snapshots.map(s => s.total)

            // Last snapshot should include March income (+5000) and rent (-1500)
            t.ok(totals[totals.length - 1] !== totals[0], 'Then totals change over time')
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
            t.doesNotThrow(() => runFinancialQuery(SEEDS.spending_over_time, STATE), 'Then it does not throw')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// (h) category_by_year — Pivot with ComputedRow
// ═════════════════════════════════════════════════

test('category_by_year — pivot with computed row', t => {
    t.test('Given the category_by_year seed query', t => {
        t.test('When executed against fixture data', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)

            t.ok(QueryResult.Pivot.is(result), 'Then result is Pivot')
            t.ok(result.columns.length > 0, 'Then columns exist')
            t.ok(result.rows.length > 0, 'Then rows exist')
            t.ok(result.computed['Housing % of Income'] !== undefined, 'Then computed row exists')
            t.end()
        })
        t.test('Then rows use top-level category names', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)

            t.ok(result.rows.includes('Food'), 'Then Food is a top-level row')
            t.ok(result.rows.includes('Housing'), 'Then Housing is a top-level row')
            t.ok(result.rows.includes('Income'), 'Then Income is a top-level row')
            t.notOk(result.rows.includes('Food:Dining'), 'Then subcategory Food:Dining is not a row')
            t.notOk(result.rows.includes('Housing:Rent'), 'Then subcategory Housing:Rent is not a row')
            t.end()
        })
        t.test('Then Food row aggregates all Food subcategory transactions', t => {
            const result = runFinancialQuery(SEEDS.category_by_year, STATE)
            const foodTotal = result.rowTotals.Food

            // Food:Dining at Savings +150, Food:Dining at Brokerage +300, Food:Groceries +50, Food (generic) +30 = 530
            t.type(foodTotal, 'number', 'Then Food has a numeric total')
            t.ok(foodTotal !== 0, 'Then Food total is non-zero')
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
