// ABOUTME: Tests for query pipeline — validate → execute flow with direct IR construction
// ABOUTME: Verifies pipeline produces correct results for identity, comparison, and expression queries

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    AccountSummary,
    Category,
    IRComputation,
    DataSummary,
    IRDateRange,
    IRDomain,
    IRExpression,
    IRFilter,
    Query,
    IROutput,
    IRResult,
    IRSource,
    IRResultTree,
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
// Helper: build an IRSource for transactions with a category filter
// ═════════════════════════════════════════════════

const txnSource = (name, category, dateRange) =>
    IRSource(name, IRDomain.Transactions(), [IRFilter.Equals('category', category)], dateRange)

// ═════════════════════════════════════════════════
// (a) Full pipeline — transaction IR → tree result
// ═════════════════════════════════════════════════

test('Full pipeline — transaction IR produces tree result', t => {
    t.test('Given an IR filtering transactions by Food category', t => {
        t.test('When running through the pipeline', t => {
            const ir = Query(
                'food',
                'Food spending',
                LookupTable([txnSource('_default', 'Food', IRDateRange.Year(2025))], IRSource, 'name'),
                IRComputation.Identity('_default'),
                IROutput(['total']),
            )

            const result = queryPipeline(ir, SUMMARY, STATE)

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(IRResult.Identity.is(result.result), 'Then result is IRResult.Identity')
            t.ok(IRResultTree.Category.is(result.result.tree), 'Then result contains a category tree')
            t.ok(result.result.tree.nodes.length > 0, 'Then tree is not empty')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Full pipeline — comparison IR → two-period result
// ═════════════════════════════════════════════════

test('Full pipeline — comparison IR produces two-period result', t => {
    t.test('Given an IR comparing Q1 vs Q2 food spending', t => {
        t.test('When running through the pipeline', t => {
            const ir = Query(
                'compare',
                'Q1 vs Q2 food',
                LookupTable(
                    [
                        txnSource('q1', 'Food', IRDateRange.Quarter(1, 2025)),
                        txnSource('q2', 'Food', IRDateRange.Quarter(2, 2025)),
                    ],
                    IRSource,
                    'name',
                ),
                IRComputation.Compare('q1', 'q2'),
                IROutput(['total']),
            )

            const result = queryPipeline(ir, SUMMARY, STATE)

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(IRResult.Comparison.is(result.result), 'Then result is IRResult.Comparison')
            t.ok(IRResultTree.Category.is(result.result.left), 'Then left result is a category tree')
            t.ok(IRResultTree.Category.is(result.result.right), 'Then right result is a category tree')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Full pipeline — expression IR → scalar number
// ═════════════════════════════════════════════════

test('Full pipeline — expression IR produces scalar', t => {
    t.test('Given an IR computing abs(food.total) / abs(income.total) * 100', t => {
        t.test('When running through the pipeline', t => {
            const ir = Query(
                'ratio',
                'Food ratio',
                LookupTable(
                    [
                        txnSource('income', 'Income', IRDateRange.Year(2025)),
                        txnSource('food', 'Food', IRDateRange.Year(2025)),
                    ],
                    IRSource,
                    'name',
                ),
                IRComputation.Expression(
                    IRExpression.Binary(
                        '*',
                        IRExpression.Binary(
                            '/',
                            IRExpression.Call('abs', [IRExpression.Reference('food', 'total')]),
                            IRExpression.Call('abs', [IRExpression.Reference('income', 'total')]),
                        ),
                        IRExpression.Literal(100),
                    ),
                ),
                IROutput(undefined, 'percent'),
            )

            const result = queryPipeline(ir, SUMMARY, STATE)

            t.equal(result.success, true, 'Then pipeline succeeds')
            t.ok(IRResult.Scalar.is(result.result), 'Then result is IRResult.Scalar')
            t.type(result.result.value, 'number', 'Then value is a number')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) Validation error — misspelled category returns phase 'validate'
// ═════════════════════════════════════════════════

test('Validation error — misspelled category returns phase validate', t => {
    t.test('Given an IR with a misspelled category name', t => {
        t.test('When running through the pipeline', t => {
            const ir = Query(
                'bad',
                'Bad category',
                LookupTable([txnSource('_default', 'Fod', IRDateRange.Year(2025))], IRSource, 'name'),
                IRComputation.Identity('_default'),
                IROutput(['total']),
            )

            const result = queryPipeline(ir, SUMMARY, STATE)

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
// (e) Validation catches before execution — nonexistent account
// ═════════════════════════════════════════════════

test('Validation catches before execution — never reaches executor', t => {
    t.test('Given an IR with a nonexistent account filter', t => {
        t.test('When running through the pipeline', t => {
            const ir = Query(
                'bad',
                'Bad account',
                LookupTable(
                    [
                        IRSource(
                            '_default',
                            IRDomain.Transactions(),
                            [IRFilter.Equals('account', 'Nonexistent Bank')],
                            IRDateRange.Year(2025),
                        ),
                    ],
                    IRSource,
                    'name',
                ),
                IRComputation.Identity('_default'),
                IROutput(['total']),
            )

            const result = queryPipeline(ir, SUMMARY, STATE)

            t.equal(result.success, false, 'Then pipeline fails')
            t.equal(result.phase, 'validate', 'Then phase is validate (not execute)')
            t.ok(result.errors[0].message.includes('Nonexistent Bank'), 'Then error identifies the bad account')
            t.end()
        })
        t.end()
    })

    t.end()
})
