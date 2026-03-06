// ABOUTME: Tests for seed query execution against fixture data via the engine
// ABOUTME: Verifies each seed query pattern produces correct filtered results

import { test } from 'tap'
import { LookupTable, reduce } from '@graffio/functional'
import { Account, Category, Security, Transaction } from '../../src/types/index.js'
import { IRComputation, IRDomain, IRFilter, IRSource, Query } from '../../src/query-language/types/index.js'
import { queryExecutionEngine } from '../../src/query-language/query-execution-engine.js'

// ═════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

const toQuery = (name, groupBy, filter) =>
    Query(
        name,
        undefined,
        LookupTable([IRSource('_default', IRDomain.Transactions(), filter, undefined, groupBy)], IRSource, 'name'),
        IRComputation.Identity('_default'),
        undefined,
    )

const countTreeTransactions = nodes => reduce((sum, node) => sum + node.aggregate.count, 0, nodes)

const runSeed = query => queryExecutionEngine(query, STATE).tree.nodes

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
    ],
    Category,
    'id',
)

// prettier-ignore
const TRANSACTIONS = LookupTable(
    [
        bankTx('txn_000000000001', 'acc_000000000001', '2025-01-15', 5000, 'cat_000000000006', 'Employer'),       // Income, Checking
        bankTx('txn_000000000002', 'acc_000000000002', '2025-01-20',  150, 'cat_000000000002', 'Olive Garden'),    // Food:Dining, Savings
        bankTx('txn_000000000003', 'acc_000000000001', '2025-01-25',  200, 'cat_000000000004', 'WALMART'),         // Shopping, Checking
        bankTx('txn_000000000004', 'acc_000000000001', '2025-02-01',   50, 'cat_000000000003', 'WAL-Mart'),        // Food:Groceries, Checking
        bankTx('txn_000000000005', 'acc_000000000001', '2025-02-10',  800, 'cat_000000000005', 'Wire Transfer'),   // Transfer, Checking
        bankTx('txn_000000000006', 'acc_000000000003', '2025-02-15',  300, 'cat_000000000002', 'WAL-Greens'),      // Food:Dining, Brokerage
        bankTx('txn_000000000007', 'acc_000000000001', '2025-02-20',   30, 'cat_000000000001', 'Corner Store'),    // Food, Checking
    ],
    Transaction,
    'id',
)

const STATE = {
    accounts: ACCOUNTS,
    categories: CATEGORIES,
    transactions: TRANSACTIONS,
    securities: LookupTable([], Security, 'id'),
}

// ═════════════════════════════════════════════════
// Seed queries — same patterns as ReportMetadata.SEED_QUERIES
// ═════════════════════════════════════════════════

const { And, Between, Equals, GreaterThan, In, Matches, Not, Or } = IRFilter

const SEEDS = {
    large_transactions: toQuery('large_transactions', 'category', GreaterThan('amount', 500)),
    dining_multi_account: toQuery(
        'dining_multi_account',
        'category',
        And([Equals('category', 'Food:Dining'), In('account', ['Checking', 'Savings'])]),
    ),
    exclude_transfers: toQuery('exclude_transfers', 'category', Not(Equals('category', 'Transfer'))),
    payee_pattern: toQuery('payee_pattern', 'category', Matches('payee', '^WAL')),
    amount_range: toQuery(
        'amount_range',
        'category',
        And([Between('amount', 100, 1000), Or([Equals('category', 'Food'), Equals('category', 'Shopping')])]),
    ),
}

// ═════════════════════════════════════════════════
// (a) large_transactions — GreaterThan('amount', 500)
// ═════════════════════════════════════════════════

test('large_transactions — GreaterThan amount 500', t => {
    t.test('Given the large_transactions seed query', t => {
        t.test('When executed against fixture data', t => {
            const nodes = runSeed(SEEDS.large_transactions)

            t.equal(countTreeTransactions(nodes), 2, 'Then only transactions over 500 are included')
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

            t.equal(countTreeTransactions(nodes), 6, 'Then all non-Transfer transactions are included')
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
