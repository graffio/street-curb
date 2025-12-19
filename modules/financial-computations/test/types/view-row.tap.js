// ABOUTME: Tests for ViewRow TaggedSum type
// ABOUTME: Verifies Detail and Summary variants with construction, identification, and matching

import { test } from 'tap'
import { ViewRow, Transaction } from '../../src/types/index.js'

// Helper: create a minimal bank transaction for testing
// Transaction.Bank(accountId, amount, date, id, transactionType, address, categoryId, cleared, memo, number, payee)
const createTestTransaction = (amount = 100, payee = null) =>
    Transaction.Bank(
        'acc_000000000001',
        amount,
        '2024-01-15',
        'txn_000000000001',
        'bank',
        null,
        null,
        null,
        null,
        null,
        payee,
    )

test('ViewRow.Detail', async t =>
    t.test('given valid transaction and computed object', async t => {
        const transaction = createTestTransaction(250)
        const computed = { runningBalance: 1250 }

        t.test('when constructing a Detail', async t => {
            const detail = ViewRow.Detail(transaction, computed)

            t.test('then the Detail contains the transaction', async t => t.equal(detail.transaction, transaction))

            t.test('then the Detail contains the computed values', async t =>
                t.same(detail.computed, { runningBalance: 1250 }),
            )

            t.test('then ViewRow.Detail.is identifies it correctly', async t => {
                t.equal(ViewRow.Detail.is(detail), true)
                t.equal(ViewRow.Summary.is(detail), false)
            })

            t.test('then ViewRow.is identifies it as a ViewRow', async t => t.equal(ViewRow.is(detail), true))
        })
    }))

test('ViewRow.Summary', async t => {
    t.test('given a group key and aggregates', async t => {
        const groupKey = 'food:restaurant'
        const aggregates = { total: -500, count: 10, average: -50 }
        const depth = 2

        t.test('when constructing a Summary', async t => {
            const summary = ViewRow.Summary(groupKey, aggregates, depth)

            t.test('then the Summary contains the group key', async t => t.equal(summary.groupKey, 'food:restaurant'))

            t.test('then the Summary contains the aggregates', async t =>
                t.same(summary.aggregates, { total: -500, count: 10, average: -50 }),
            )

            t.test('then the Summary contains the depth', async t => t.equal(summary.depth, 2))

            t.test('then ViewRow.Summary.is identifies it correctly', async t => {
                t.equal(ViewRow.Summary.is(summary), true)
                t.equal(ViewRow.Detail.is(summary), false)
            })

            t.test('then ViewRow.is identifies it as a ViewRow', async t => t.equal(ViewRow.is(summary), true))
        })
    })

    t.test('given depth 0 for grand total', async t => {
        const summary = ViewRow.Summary('Total', { total: -600 }, 0)

        t.test('then depth is 0', async t => t.equal(summary.depth, 0))
    })
})

test('ViewRow.match', async t => {
    const transaction = createTestTransaction(100, 'Whole Foods')
    const detail = ViewRow.Detail(transaction, { percentOfTotal: 0.25 })
    const summary = ViewRow.Summary('food', { total: -500 }, 1)

    t.test('given a Detail row', async t =>
        t.test('when matching with handlers', async t => {
            const result = detail.match({
                Detail: ({ transaction, computed }) => `${transaction.payee}: ${computed.percentOfTotal}`,
                Summary: () => 'summary',
            })

            t.test('then the Detail handler is called', async t => t.equal(result, 'Whole Foods: 0.25'))
        }),
    )

    t.test('given a Summary row', async t =>
        t.test('when matching with handlers', async t => {
            const result = summary.match({
                Detail: () => 'detail',
                Summary: ({ groupKey, aggregates, depth }) => `${groupKey} (${depth}): ${aggregates.total}`,
            })

            t.test('then the Summary handler is called', async t => t.equal(result, 'food (1): -500'))
        }),
    )
})

test('ViewRow type discrimination', async t =>
    t.test('given non-ViewRow values', async t => {
        t.equal(ViewRow.is({}), false)
        t.equal(ViewRow.is({ transaction: {}, computed: {} }), false)
        t.equal(ViewRow.Detail.is({}), false)
        t.equal(ViewRow.Summary.is({}), false)
    }))
