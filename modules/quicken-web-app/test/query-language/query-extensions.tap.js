// ABOUTME: Tests for query language extensions — orderBy, limit, metrics, timeSeries
// ABOUTME: Run with: yarn tap:file test/query-language/query-extensions.tap.js

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    AccountSummary,
    DataSummary,
    Lot,
    LotAllocation,
    Price,
    QueryResult,
    Security,
    Transaction,
} from '../../src/types/index.js'
import {
    IRComputation,
    IRDateRange,
    IRDomain,
    IROutput,
    IRSource,
    Query,
} from '../../src/query-language/types/index.js'
import { queryValidator } from '../../src/query-language/query-validator.js'
import { queryExecutionEngine } from '../../src/query-language/query-execution-engine.js'

// ═════════════════════════════════════════════════
// Fixture helpers
// ═════════════════════════════════════════════════

const investTx = (id, accountId, date, action, securityId, quantity, amount, pricePerShare) =>
    Transaction.Investment(
        accountId,
        date,
        id,
        'investment',
        undefined,
        amount,
        undefined,
        undefined,
        undefined,
        action,
        undefined,
        undefined,
        pricePerShare,
        quantity,
        undefined,
        securityId,
        undefined,
    )

const lot = (id, accountId, securityId, purchaseDate, quantity, costBasis) =>
    Lot(accountId, costBasis, purchaseDate, id, purchaseDate, quantity, quantity, securityId, 'txn_000000000000')

const price = (id, securityId, date, priceValue) => Price(id, securityId, date, priceValue)

const positionsSource = (name, filters = [], dateRange, groupBy, metrics) =>
    IRSource(name, IRDomain.Positions(), filters, dateRange, groupBy, metrics)

const positionsQuery = (name, source, computation, output) =>
    Query(
        name,
        name,
        LookupTable([source], IRSource, 'name'),
        computation || IRComputation.Identity(source.name),
        output || IROutput(['marketValue']),
    )

// ═════════════════════════════════════════════════
// Validator fixture: DataSummary
// ═════════════════════════════════════════════════

const SUMMARY = DataSummary(
    ['Income', 'Income:Salary', 'Food', 'Food:Dining'],
    [AccountSummary('Brokerage', 'Investment'), AccountSummary('Chase Checking', 'Bank')],
    ['Bank', 'Investment'],
    ['Employer'],
)

// ═════════════════════════════════════════════════
// Execution engine fixture: investment state with 3 positions
// ═════════════════════════════════════════════════

const ACCOUNT_ID = 'acc_000000000001'
const AAPL_ID = 'sec_000000000001'
const MSFT_ID = 'sec_000000000002'
const GOOGL_ID = 'sec_000000000003'
const SPY_ID = 'sec_000000000004'

const SECURITIES = LookupTable(
    [
        Security(AAPL_ID, 'Apple Inc.', 'AAPL', 'Stock', undefined),
        Security(MSFT_ID, 'Microsoft Corp', 'MSFT', 'Stock', undefined),
        Security(GOOGL_ID, 'Alphabet Inc.', 'GOOGL', 'Stock', undefined),
        Security(SPY_ID, 'SPDR S&P 500 ETF', 'SPY', 'ETF', undefined),
    ],
    Security,
    'id',
)

const LOTS = LookupTable(
    [
        lot('lot_000000000001', ACCOUNT_ID, AAPL_ID, '2024-01-15', 10, 1500),
        lot('lot_000000000002', ACCOUNT_ID, MSFT_ID, '2024-03-01', 20, 7000),
        lot('lot_000000000003', ACCOUNT_ID, GOOGL_ID, '2024-06-01', 5, 700),
    ],
    Lot,
    'id',
)

const TRANSACTIONS = LookupTable(
    [
        investTx('txn_000000000001', ACCOUNT_ID, '2024-01-15', 'Buy', AAPL_ID, 10, -1500, 150),
        investTx('txn_000000000002', ACCOUNT_ID, '2024-03-01', 'Buy', MSFT_ID, 20, -7000, 350),
        investTx('txn_000000000003', ACCOUNT_ID, '2024-06-01', 'Buy', GOOGL_ID, 5, -700, 140),
    ],
    Transaction,
    'id',
)

const PRICES = LookupTable(
    [
        // Current prices as of 2025-03-01
        price('prc_000000000001', AAPL_ID, '2025-03-01', 185),
        price('prc_000000000002', MSFT_ID, '2025-03-01', 420),
        price('prc_000000000003', GOOGL_ID, '2025-03-01', 175),

        // SPY benchmark prices
        price('prc_000000000004', SPY_ID, '2024-01-15', 470),
        price('prc_000000000005', SPY_ID, '2024-03-01', 510),
        price('prc_000000000006', SPY_ID, '2024-06-01', 530),
        price('prc_000000000007', SPY_ID, '2025-03-01', 580),

        // Historical prices for timeSeries snapshots
        price('prc_000000000008', AAPL_ID, '2024-12-31', 180),
        price('prc_000000000009', MSFT_ID, '2024-12-31', 410),
        price('prc_00000000000a', GOOGL_ID, '2024-12-31', 170),
        price('prc_00000000000b', AAPL_ID, '2025-01-31', 182),
        price('prc_00000000000c', MSFT_ID, '2025-01-31', 415),
        price('prc_00000000000d', GOOGL_ID, '2025-01-31', 172),
        price('prc_00000000000e', AAPL_ID, '2025-02-28', 183),
        price('prc_00000000000f', MSFT_ID, '2025-02-28', 418),
        price('prc_000000000010', GOOGL_ID, '2025-02-28', 174),
    ],
    Price,
    'id',
)

const ACCOUNTS = LookupTable([Account(ACCOUNT_ID, 'Brokerage', 'Investment')], Account, 'id')

const STATE = {
    accounts: ACCOUNTS,
    categories: LookupTable([], { name: 'Category', is: () => true }, 'id'),
    transactions: TRANSACTIONS,
    securities: SECURITIES,
    lots: LOTS,
    lotAllocations: LookupTable([], LotAllocation, 'id'),
    prices: PRICES,
}

// ═════════════════════════════════════════════════
// VALIDATOR: orderBy
// ═════════════════════════════════════════════════

test('Validator — valid orderBy accepted', t => {
    t.test('Given a positions query with orderBy total_return_pct desc', t => {
        t.test('When validating against the data summary', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025))
            const output = IROutput(['marketValue'], undefined, 'total_return_pct', 'desc')
            const ir = positionsQuery('top_performers', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.equal(result.errors.length, 0, 'Then there are no errors')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — unknown orderBy field rejected', t => {
    t.test('Given a positions query with orderBy on a non-existent field', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025))
            const output = IROutput(['marketValue'], undefined, 'nonexistent_metric', 'desc')
            const ir = positionsQuery('bad_order', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/nonexistent_metric/)),
                'Then error names the bad field',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// VALIDATOR: limit
// ═════════════════════════════════════════════════

test('Validator — valid limit accepted', t => {
    t.test('Given a positions query with limit 10', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025))
            const output = IROutput(['marketValue'], undefined, undefined, undefined, 10)
            const ir = positionsQuery('top_ten', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — negative limit rejected', t => {
    t.test('Given a positions query with limit -5', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025))
            const output = IROutput(['marketValue'], undefined, undefined, undefined, -5)
            const ir = positionsQuery('bad_limit', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/limit/i)),
                'Then error mentions limit',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — zero limit rejected', t => {
    t.test('Given a positions query with limit 0', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025))
            const output = IROutput(['marketValue'], undefined, undefined, undefined, 0)
            const ir = positionsQuery('zero_limit', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — limit with groupBy rejected', t => {
    t.test('Given a positions query with both limit and groupBy', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025), 'account')
            const output = IROutput(['marketValue'], undefined, undefined, undefined, 10)
            const ir = positionsQuery('grouped_limit', source, undefined, output)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/limit.*group/i)),
                'Then error mentions limit and groupBy conflict',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// VALIDATOR: metrics
// ═════════════════════════════════════════════════

test('Validator — valid metrics accepted', t => {
    t.test('Given a positions query with registered metric names', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025), undefined, [
                'total_return_pct',
                'irr',
            ])
            const ir = positionsQuery('with_metrics', source)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — unknown metric name rejected', t => {
    t.test('Given a positions query with an unregistered metric name', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Year(2025), undefined, [
                'total_return_pct',
                'fake_metric',
            ])
            const ir = positionsQuery('bad_metrics', source)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/fake_metric/)),
                'Then error names the unknown metric',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// VALIDATOR: timeSeries
// ═════════════════════════════════════════════════

test('Validator — valid timeSeries accepted', t => {
    t.test('Given a positions query with monthly timeSeries', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2025-01-01', '2025-03-31'))
            const computation = IRComputation.TimeSeries(source.name, 'monthly')
            const ir = positionsQuery('monthly_series', source, computation)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Type system — invalid timeSeries interval rejected at construction', t => {
    t.test('Given an invalid timeSeries interval "biweekly"', t => {
        t.test('When constructing IRComputation.TimeSeries', t => {
            t.throws(
                () => IRComputation.TimeSeries('_default', 'biweekly'),
                /biweekly/,
                'Then construction throws with the invalid interval',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Validator — timeSeries with excessive date points rejected', t => {
    t.test('Given a daily timeSeries over 2 years (730+ points)', t => {
        t.test('When validating', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2023-01-01', '2024-12-31'))
            const computation = IRComputation.TimeSeries(source.name, 'daily')
            const ir = positionsQuery('too_many_points', source, computation)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/100|excessive|too many/i)),
                'Then error mentions the point limit',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// EXECUTION ENGINE: orderBy
// ═════════════════════════════════════════════════

test('Execution — orderBy desc produces correctly sorted positions', t => {
    t.test('Given 3 positions with different unrealized gains', t => {
        t.test('When executing with orderBy unrealizedGainLossPercent desc', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'))
            const output = IROutput(['marketValue'], undefined, 'unrealizedGainLossPercent', 'desc')
            const ir = positionsQuery('sorted_desc', source, undefined, output)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            const positions = result.tree.nodes
            t.ok(positions.length >= 2, 'Then at least 2 positions are returned')

            // GOOGL (25%) > AAPL (23.3%) > MSFT (20%) by unrealized gain %
            t.ok(
                positions[0].position.unrealizedGainLossPercent >= positions[1].position.unrealizedGainLossPercent,
                'Then first position has higher gain % than second',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Execution — orderBy asc produces ascending sort', t => {
    t.test('Given positions with different market values', t => {
        t.test('When executing with orderBy marketValue asc', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'))
            const output = IROutput(['marketValue'], undefined, 'marketValue', 'asc')
            const ir = positionsQuery('sorted_asc', source, undefined, output)
            const result = queryExecutionEngine(ir, STATE)
            const positions = result.tree.nodes
            t.ok(positions.length >= 2, 'Then at least 2 positions are returned')

            // GOOGL ($875) < AAPL ($1850) < MSFT ($8400)
            t.ok(
                positions[0].position.marketValue <= positions[1].position.marketValue,
                'Then first position has lower market value than second',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Execution — orderBy without groupBy returns flat list', t => {
    t.test('Given a positions query with orderBy but no groupBy', t => {
        t.test('When executing', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'))
            const output = IROutput(['marketValue'], undefined, 'marketValue', 'desc')
            const ir = positionsQuery('flat_sorted', source, undefined, output)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')

            // Flat list: nodes are Position leaf nodes, not Group nodes
            const nodes = result.tree.nodes
            t.ok(nodes.length >= 2, 'Then positions are returned as a flat list')
            t.ok(
                nodes.every(n => n.position !== undefined),
                'Then every node is a Position leaf',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// EXECUTION ENGINE: limit
// ═════════════════════════════════════════════════

test('Execution — limit truncates after sort', t => {
    t.test('Given 3 positions and limit 2 with orderBy desc', t => {
        t.test('When executing', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'))
            const output = IROutput(['marketValue'], undefined, 'marketValue', 'desc', 2)
            const ir = positionsQuery('top_two', source, undefined, output)
            const result = queryExecutionEngine(ir, STATE)
            const positions = result.tree.nodes
            t.equal(positions.length, 2, 'Then only 2 positions are returned')

            // MSFT ($8400) > AAPL ($1850) — GOOGL ($875) truncated
            t.ok(
                positions[0].position.marketValue >= positions[1].position.marketValue,
                'Then the top 2 by market value are returned in order',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// EXECUTION ENGINE: metrics
// ═════════════════════════════════════════════════

test('Execution — metrics attaches computed values to each position', t => {
    t.test('Given a positions query requesting total_return_pct and irr metrics', t => {
        t.test('When executing', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'), undefined, [
                'total_return_pct',
                'irr',
            ])
            const ir = positionsQuery('with_metrics', source)
            const result = queryExecutionEngine(ir, STATE)
            const positions = result.tree.nodes
            t.ok(positions.length >= 1, 'Then positions are returned')
            const first = positions[0]
            t.type(first.metrics.total_return_pct, 'number', 'Then total_return_pct is attached as a number')
            t.type(first.metrics.irr, 'number', 'Then irr is attached as a number')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Execution — metrics with unknown name throws', t => {
    t.test('Given a positions query requesting a non-existent metric', t => {
        t.test('When executing', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2024-01-01', '2025-03-01'), undefined, [
                'nonexistent_metric',
            ])
            const ir = positionsQuery('bad_metric', source)
            t.throws(
                () => queryExecutionEngine(ir, STATE),
                /Unknown metric 'nonexistent_metric'/,
                'Then it throws with the unknown metric name',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// EXECUTION ENGINE: timeSeries
// ═════════════════════════════════════════════════

test('Execution — timeSeries monthly over 3 months produces 3 snapshots', t => {
    t.test('Given a monthly timeSeries query from Jan to Mar 2025', t => {
        t.test('When executing', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2025-01-01', '2025-03-31'))
            const computation = IRComputation.TimeSeries(source.name, 'monthly')
            const ir = positionsQuery('monthly_net_worth', source, computation)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.TimeSeries.is(result), 'Then result is QueryResult.TimeSeries')
            t.equal(result.snapshots.length, 3, 'Then 3 monthly snapshots are produced')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Execution — timeSeries snapshots have correct end-of-month dates', t => {
    t.test('Given a monthly timeSeries query from Jan to Mar 2025', t => {
        t.test('When examining snapshot dates', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2025-01-01', '2025-03-31'))
            const computation = IRComputation.TimeSeries(source.name, 'monthly')
            const ir = positionsQuery('monthly_dates', source, computation)
            const result = queryExecutionEngine(ir, STATE)
            const dates = result.snapshots.map(s => s.date)
            t.same(dates, ['2025-01-31', '2025-02-28', '2025-03-31'], 'Then dates are end-of-month')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Execution — timeSeries snapshots contain positions', t => {
    t.test('Given a monthly timeSeries query', t => {
        t.test('When examining snapshot content', t => {
            const source = positionsSource('_default', [], IRDateRange.Range('2025-01-01', '2025-03-31'))
            const computation = IRComputation.TimeSeries(source.name, 'monthly')
            const ir = positionsQuery('monthly_content', source, computation)
            const result = queryExecutionEngine(ir, STATE)
            const firstSnapshot = result.snapshots[0]
            t.ok(Array.isArray(firstSnapshot.positions), 'Then snapshot has a positions array')
            t.ok(firstSnapshot.positions.length >= 1, 'Then snapshot contains positions')
            t.end()
        })
        t.end()
    })
    t.end()
})
