import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    AccountSummary,
    Category,
    DataSummary,
    QueryResult,
    ResultTree,
    Security,
    Transaction,
} from '../../src/types/index.js'
import { queryPipeline } from '../../src/query-language/query-pipeline.js'

// ═════════════════════════════════════════════════
// Helper: build a Bank transaction with minimal boilerplate
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

// ═════════════════════════════════════════════════
// Test fixtures: mock Redux state + DataSummary
// ═════════════════════════════════════════════════

const ACCOUNTS = LookupTable(
    [
        Account('acc_000000000001', 'Chase Checking', 'Bank'),
        Account('acc_000000000002', 'Amex Platinum', 'Credit Card'),
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
    ],
    Category,
    'id',
)

const TRANSACTIONS = LookupTable(
    [
        bankTx('txn_000000000001', 'acc_000000000001', '2025-01-15', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000002', 'acc_000000000001', '2025-02-15', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000003', 'acc_000000000001', '2025-01-20', -50, 'cat_000000000002', 'Chipotle'),
        bankTx('txn_000000000004', 'acc_000000000002', '2025-02-10', -75, 'cat_000000000002', 'Olive Garden'),
        bankTx('txn_000000000005', 'acc_000000000001', '2025-01-25', -200, 'cat_000000000003', 'Costco'),
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

const SUMMARY = DataSummary(
    ['Food', 'Food:Dining', 'Food:Groceries', 'Income', 'Income:Salary'],
    [AccountSummary('Chase Checking', 'Bank'), AccountSummary('Amex Platinum', 'Credit Card')],
    ['Bank', 'Credit Card'],
    ['Employer', 'Chipotle', 'Olive Garden', 'Costco'],
)

// ═════════════════════════════════════════════════
// (a) Full pipeline — transaction query → tree result
// ═════════════════════════════════════════════════

test('Full pipeline — transaction query produces tree result', t => {
    t.test('Given a valid transaction query filtering by Food category', t => {
        t.test('When running through the full pipeline', t => {
            const result = queryPipeline(
                `
query food "Food spending" {
  from transactions
  where category = "Food"
  date 2025
  show total
}
`,
                SUMMARY,
                STATE,
            )

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(QueryResult.Identity.is(result.result), 'Then result is QueryResult.Identity')
            t.ok(ResultTree.Category.is(result.result.tree), 'Then result contains a category tree')
            t.ok(result.result.tree.nodes.length > 0, 'Then tree is not empty')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Full pipeline — comparison query → two-period result
// ═════════════════════════════════════════════════

test('Full pipeline — comparison query produces two-period result', t => {
    t.test('Given a valid compare query with Q1 vs Q2', t => {
        t.test('When running through the full pipeline', t => {
            const result = queryPipeline(
                `
query compare "Q1 vs Q2 food" {
  q1: from transactions
      where category = "Food"
      date Q1 2025
  q2: from transactions
      where category = "Food"
      date Q2 2025
  compare q1 vs q2
  show total
}
`,
                SUMMARY,
                STATE,
            )

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(QueryResult.Comparison.is(result.result), 'Then result is QueryResult.Comparison')
            t.ok(ResultTree.Category.is(result.result.left), 'Then left result is a category tree')
            t.ok(ResultTree.Category.is(result.result.right), 'Then right result is a category tree')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Full pipeline — expression query → scalar number
// ═════════════════════════════════════════════════

test('Full pipeline — expression query produces scalar', t => {
    t.test('Given a valid compute expression query', t => {
        t.test('When running through the full pipeline', t => {
            const result = queryPipeline(
                `
query ratio "Food ratio" {
  income: from transactions
          where category = "Income"
          date 2025
  food: from transactions
        where category = "Food"
        date 2025
  compute abs(food.total) / abs(income.total) * 100
  format percent
}
`,
                SUMMARY,
                STATE,
            )

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(QueryResult.Scalar.is(result.result), 'Then result is QueryResult.Scalar')
            t.type(result.result.value, 'number', 'Then value is a number')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) Parse error — oversized query rejected
// ═════════════════════════════════════════════════

test('Parse error — oversized query rejected', t => {
    t.test('Given a query string exceeding 100KB', t => {
        t.test('When running through the pipeline', t => {
            const oversized = 'x'.repeat(102401)
            const result = queryPipeline(oversized, SUMMARY, STATE)

            t.equal(result.success, false, 'Then pipeline fails')
            t.equal(result.phase, 'parse', 'Then phase is parse')
            t.ok(result.errors[0].message.includes('maximum size'), 'Then error mentions size limit')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (e) Parse error — bad syntax returns phase parse
// ═════════════════════════════════════════════════

test('Parse error — bad syntax returns phase parse', t => {
    t.test('Given a query with invalid syntax', t => {
        t.test('When running through the pipeline', t => {
            const result = queryPipeline('not a valid query {{{', SUMMARY, STATE)

            t.equal(result.success, false, 'Then pipeline fails')
            t.equal(result.phase, 'parse', 'Then phase is parse')
            t.ok(Array.isArray(result.errors), 'Then errors array is present')
            t.ok(result.errors.length > 0, 'Then at least one error is returned')
            t.ok(result.errors[0].message, 'Then error has a message')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (f) Validation error — misspelled category returns phase 'validate'
// ═════════════════════════════════════════════════

test('Validation error — misspelled category returns phase validate', t => {
    t.test('Given a query with a misspelled category name', t => {
        t.test('When running through the pipeline', t => {
            const result = queryPipeline(
                `
query bad "Bad category" {
  from transactions
  where category = "Fod"
  date 2025
  show total
}
`,
                SUMMARY,
                STATE,
            )

            t.equal(result.success, false, 'Then pipeline fails')
            t.equal(result.phase, 'validate', 'Then phase is validate')
            t.ok(result.errors.length > 0, 'Then at least one error is returned')
            t.ok(result.errors[0].suggestions.length > 0, 'Then error includes suggestions')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (g) Validation catches before execution — valid parse + invalid data
// ═════════════════════════════════════════════════

test('Validation catches before execution — never reaches executor', t => {
    t.test('Given a syntactically valid query with a nonexistent account', t => {
        t.test('When running through the pipeline', t => {
            const result = queryPipeline(
                `
query bad "Bad account" {
  from transactions
  where account = "Nonexistent Bank"
  date 2025
  show total
}
`,
                SUMMARY,
                STATE,
            )

            t.equal(result.success, false, 'Then pipeline fails')
            t.equal(result.phase, 'validate', 'Then phase is validate (not execute)')
            t.ok(result.errors[0].message.includes('Nonexistent Bank'), 'Then error identifies the bad account')
            t.end()
        })
        t.end()
    })

    t.end()
})
